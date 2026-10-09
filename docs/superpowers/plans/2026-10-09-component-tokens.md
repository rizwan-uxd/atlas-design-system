# Component Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an aliased component-token layer (Button, Input, Card; colour + size) to code and Figma with zero visual change.

**Architecture:** One CSS block in `packages/tokens/atlas.tokens.css` (between `BEGIN/END:component-tokens` markers, selector `:root, [data-theme="dark"], .dark`) holds ~85 tokens, each `var(--atlas-<semantic>)`. A pure parser/linter in `scripts/lib/component-tokens.mjs` is shared by `token-lint` (rule) and `atlas-sync` (a labelled section in `atlas/tokens.md`). Figma gets a single-mode `Atlas/Component` collection of aliases; component sets are rebound to it. The three `.module.css` files then switch to the new tokens.

**Tech Stack:** Node ESM scripts (`node --test`), CSS custom properties, Figma Plugin API (`use_figma`), Playwright visual regression, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-component-tokens-design.md` (approved).

## Global Constraints

- Every new component token aliases an existing semantic token: value is exactly `var(--atlas-<semantic>)`. Never `--atlas-color-*`, a primitive ramp (`--atlas-blue-500` …), a literal, or another component token.
- **Only exception:** `--atlas-card-filled-background-hover`, value exactly `color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0))`, with the spec comment beside it. Nothing else may be a non-alias.
- Naming: colour/state `--atlas-<component>-<variant>-<property>[-<state>]`; size `--atlas-<component>-size-<size>-<property>`; non-size shape `--atlas-<component>-<property>`. Components: `button`, `input`, `card`.
- Component tokens are for Atlas component implementation and documentation. `atlas/tokens.md` labels them "Atlas implementation tokens"; product code and prototypes keep using semantic tokens.
- The block selector must include `:root`, `[data-theme="dark"]` and `.dark` so a `.dark` subtree re-resolves the aliases (a `var()` on `:root` alone would freeze at the light value).
- Native (`packages/ui-native`) is not touched. The generated native token file must stay byte-identical (the converter only reads `var(--atlas-color-*)` aliases).
- Figma wins on any disagreement; Figma is built and approved before CSS changes. Never hand-edit `atlas/` (regenerate with `atlas:sync`).
- The PR carries the `atlas-approved-new` label; do not bypass the "no new tokens" check any other way.
- Verification order (every verify step below follows it): token build → token-lint → typecheck → vitest → ESLint → `atlas:verify` → visual regression.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/lib/component-tokens.mjs` (create) | Pure functions: find the block, parse declarations, lint, render the `tokens.md` section. No I/O. |
| `scripts/tests/component-tokens.test.mjs` (create) | Unit tests for the lib, plus repo-level checks of the real CSS. |
| `packages/governance/token-lint.mjs` (modify) | Run `lintComponentTokens` on `packages/tokens/atlas.tokens.css` and report as rule `component-token-alias`. |
| `scripts/atlas-sync.mjs` (modify) | Import `renderComponentSection`; upsert it into `atlas/tokens.md`. |
| `scripts/tests/atlas-sync.test.mjs` (modify) | Test that the section appears, is labelled, and a second sync writes 0 files. |
| `packages/tokens/atlas.tokens.css` (modify) | The component-token block (Task 5). |
| `packages/ui-web/src/primitives/Button/Button.module.css`, `.../Input/Input.module.css`, `packages/ui-web/src/compositions/Card/Card.module.css` (modify) | Switch to component tokens (Task 6). |
| `atlas/state/decisions.json` (modify, append) | DEC-053 recording the decision (Task 7). |

---

### Task 1: Component-token library

**Files:**
- Create: `scripts/lib/component-tokens.mjs`
- Test: `scripts/tests/component-tokens.test.mjs`

**Interfaces:**
- Produces: `COMPONENTS`, `BEGIN`, `END`, `CARD_EXCEPTION`, `extractComponentBlock(css) → {selector, body, bodyOffset} | null`, `parseComponentTokens(css) → [{name, value, line}]`, `lintComponentTokens(css) → string[]`, `renderComponentSection(css) → string` (empty string when there is no block), `SECTION_BEGIN`, `SECTION_END`.

- [ ] **Step 1: Write the failing tests**

```js
// scripts/tests/component-tokens.test.mjs
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  BEGIN, END, CARD_EXCEPTION, extractComponentBlock, parseComponentTokens, lintComponentTokens, renderComponentSection,
} from "../lib/component-tokens.mjs"

const wrap = (decls, selector = ':root,\n[data-theme="dark"],\n.dark') =>
  `:root { --atlas-primary: x; }\n${BEGIN}\n${selector} {\n${decls}\n}\n${END}\n`

const OK = "  --atlas-button-primary-background: var(--atlas-primary);\n  --atlas-button-size-md-height: var(--atlas-spacing-10);"

test("a block of semantic aliases passes", () => {
  assert.deepEqual(lintComponentTokens(wrap(OK)), [])
})

test("parse returns name, value and line", () => {
  const t = parseComponentTokens(wrap(OK))
  assert.deepEqual(t.map((x) => [x.name, x.value]), [
    ["--atlas-button-primary-background", "var(--atlas-primary)"],
    ["--atlas-button-size-md-height", "var(--atlas-spacing-10)"],
  ])
  assert.ok(t[0].line > 1)
})

test("a missing block is a violation", () => {
  assert.match(lintComponentTokens(":root {}")[0], /no component-token block/)
})

test("aliasing a primitive colour is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-button-primary-background: var(--atlas-color-brand-500);"))
  assert.match(v.join("\n"), /primitive/)
  const v2 = lintComponentTokens(wrap("  --atlas-button-primary-background: var(--atlas-blue-500);"))
  assert.match(v2.join("\n"), /primitive/)
})

test("aliasing another component token is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-input-border: var(--atlas-button-outline-border);"))
  assert.match(v.join("\n"), /component token/)
})

test("a literal value is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-card-radius: 12px;"))
  assert.match(v.join("\n"), /must be var\(--atlas-/)
})

test("a name outside the component prefixes is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-badge-background: var(--atlas-primary);"))
  assert.match(v.join("\n"), /name/)
})

test("the Card hover exception passes only with its exact value", () => {
  const ok = `  ${CARD_EXCEPTION.name}: ${CARD_EXCEPTION.value};`
  assert.deepEqual(lintComponentTokens(wrap(ok)), [])
  const bad = `  ${CARD_EXCEPTION.name}: color-mix(in oklch, var(--atlas-background-muted) 70%, oklch(1 0 0));`
  assert.match(lintComponentTokens(wrap(bad)).join("\n"), /exception/)
})

test("any other color-mix is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-button-ghost-background-hover: color-mix(in oklch, var(--atlas-primary) 10%, oklch(1 0 0));"))
  assert.match(v.join("\n"), /must be var\(--atlas-/)
})

test("the selector must cover :root, [data-theme=dark] and .dark", () => {
  assert.match(lintComponentTokens(wrap(OK, ":root")).join("\n"), /selector/)
  assert.match(lintComponentTokens(wrap(OK, ':root, [data-theme="dark"]')).join("\n"), /selector/)
})

test("a component token defined outside the block is rejected", () => {
  const css = wrap(OK) + ":root { --atlas-card-radius: var(--atlas-radius-lg); }\n"
  assert.match(lintComponentTokens(css).join("\n"), /outside the component-token block/)
})

test("a duplicate name is rejected", () => {
  const v = lintComponentTokens(wrap(OK + "\n  --atlas-button-primary-background: var(--atlas-primary);"))
  assert.match(v.join("\n"), /duplicate/)
})

test("the rendered section is labelled as implementation tokens and lists each alias", () => {
  const md = renderComponentSection(wrap(OK))
  assert.match(md, /Atlas implementation tokens/)
  assert.match(md, /product code and prototypes use the semantic tokens/i)
  assert.match(md, /### Button/)
  assert.match(md, /`button-primary-background` → `primary`/)
  assert.match(md, /`button-size-md-height` → `spacing-10`/)
})

test("no block renders nothing", () => {
  assert.equal(renderComponentSection(":root {}"), "")
})

test("extractComponentBlock exposes the selector", () => {
  assert.match(extractComponentBlock(wrap(OK)).selector, /\.dark/)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: FAIL, `Cannot find module '../lib/component-tokens.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// scripts/lib/component-tokens.mjs
// Pure helpers for the component-token layer in packages/tokens/atlas.tokens.css (no I/O).
// Rule: a component token aliases a semantic token. The single exception is CARD_EXCEPTION.

export const COMPONENTS = ["button", "input", "card"]
export const BEGIN = "/* BEGIN:component-tokens */"
export const END = "/* END:component-tokens */"
export const SECTION_BEGIN = "<!-- BEGIN:generated-component-tokens -->"
export const SECTION_END = "<!-- END:generated-component-tokens -->"

// Card interactive filled hover preserves the existing computed value until a proper semantic
// token is approved (spec: docs/superpowers/specs/2026-10-09-component-tokens-design.md).
export const CARD_EXCEPTION = {
  name: "--atlas-card-filled-background-hover",
  value: "color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0))",
}

const PRIMITIVE = /^--atlas-(color-|(blue|gray|grey|red|green|amber|yellow|neutral|slate)-\d+)/
const COMPONENT_NAME = new RegExp(`^--atlas-(${COMPONENTS.join("|")})-[a-z0-9]+(-[a-z0-9]+)*$`)
const COMPONENT_PREFIX = new RegExp(`^--atlas-(${COMPONENTS.join("|")})-`)
const ALIAS = /^var\((--atlas-[\w-]+)\)$/
const lineAt = (css, index) => css.slice(0, index).split("\n").length
const squash = (s) => s.replace(/\s+/g, " ").trim()
// blank out comments but keep newlines so line numbers stay right
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))

export function extractComponentBlock(css) {
  const b = css.indexOf(BEGIN), e = css.indexOf(END)
  if (b === -1 || e === -1 || e < b) return null
  const inner = css.slice(b + BEGIN.length, e)
  const open = inner.indexOf("{"), close = inner.lastIndexOf("}")
  if (open === -1 || close === -1) return null
  return { selector: inner.slice(0, open).trim(), body: inner.slice(open + 1, close), bodyOffset: b + BEGIN.length + open + 1 }
}

export function parseComponentTokens(css) {
  const block = extractComponentBlock(css)
  if (!block) return []
  const body = stripComments(block.body)
  return [...body.matchAll(/(--atlas-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => ({
    name: m[1],
    value: squash(m[2]),
    line: lineAt(css, block.bodyOffset + m.index),
  }))
}

export function lintComponentTokens(css) {
  const block = extractComponentBlock(css)
  if (!block) return ["no component-token block (expected /* BEGIN:component-tokens */ … /* END:component-tokens */)"]
  const out = []
  const sel = squash(block.selector)
  for (const need of [":root", '[data-theme="dark"]', ".dark"]) {
    if (!sel.includes(need)) out.push(`selector "${sel}" must include ${need} so every theme scope re-resolves the aliases`)
  }
  const seen = new Set()
  for (const t of parseComponentTokens(css)) {
    const at = `line ${t.line} ${t.name}`
    if (seen.has(t.name)) out.push(`${at}: duplicate`)
    seen.add(t.name)
    if (!COMPONENT_NAME.test(t.name)) { out.push(`${at}: name must be --atlas-(${COMPONENTS.join("|")})-<…>`); continue }
    if (t.name === CARD_EXCEPTION.name) {
      if (t.value !== CARD_EXCEPTION.value) out.push(`${at}: the approved exception must keep exactly ${CARD_EXCEPTION.value}`)
      continue
    }
    const alias = t.value.match(ALIAS)
    if (!alias) { out.push(`${at}: must be var(--atlas-<semantic>), got "${t.value}"`); continue }
    if (PRIMITIVE.test(alias[1])) out.push(`${at}: aliases a primitive (${alias[1]}) — use a semantic token`)
    else if (COMPONENT_PREFIX.test(alias[1])) out.push(`${at}: aliases another component token (${alias[1]}) — alias a semantic token`)
  }
  // no component token may be defined anywhere else in the file
  const outside = css.slice(0, css.indexOf(BEGIN)) + css.slice(css.indexOf(END) + END.length)
  for (const m of stripComments(outside).matchAll(new RegExp(`(--atlas-(?:${COMPONENTS.join("|")})-[\\w-]+)\\s*:`, "g"))) {
    out.push(`${m[1]} is defined outside the component-token block`)
  }
  return out
}

const title = (c) => c[0].toUpperCase() + c.slice(1)

export function renderComponentSection(css) {
  const tokens = parseComponentTokens(css)
  if (!tokens.length) return ""
  const lines = [
    SECTION_BEGIN,
    "",
    "## Component tokens (Atlas implementation tokens)",
    "",
    "These name the visual decisions inside Atlas components. They exist for implementing and documenting Atlas components, and every one aliases a semantic token above. Product code and prototypes use the semantic tokens; reach for a component token only when styling or wrapping an Atlas component.",
  ]
  for (const c of COMPONENTS) {
    const mine = tokens.filter((t) => t.name.startsWith(`--atlas-${c}-`))
    if (!mine.length) continue
    lines.push("", `### ${title(c)}`, mine.map((t) => {
      const alias = t.value.match(ALIAS)
      return `\`${t.name.slice(8)}\` → ${alias ? `\`${alias[1].slice(8)}\`` : `\`${t.value}\``}`
    }).join(" · "))
  }
  lines.push(SECTION_END)
  return lines.join("\n")
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: PASS, 15 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/component-tokens.mjs scripts/tests/component-tokens.test.mjs
git commit -m "feat(tokens): component-token parser and linter

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: token-lint rule

**Files:**
- Modify: `packages/governance/token-lint.mjs` (add an import near the top, add the check before `// ─── Report`)

**Interfaces:**
- Consumes: `lintComponentTokens(css) → string[]` from Task 1.
- Produces: rule id `component-token-alias` in token-lint output; exit 1 when the CSS block violates the rule. Absent block is **not** a violation until Task 5 lands (guarded below).

- [ ] **Step 1: Add the guarded check**

In `packages/governance/token-lint.mjs`, after `import { fileURLToPath } from "url"` add:

```js
import { BEGIN, lintComponentTokens } from "../../scripts/lib/component-tokens.mjs"
```

Immediately before the `// ─── Report` comment add:

```js
// ─── Component tokens (alias-only rule) ─────────────────────────────────────

const TOKEN_CSS_PATH = path.join(ROOT, "packages/tokens/atlas.tokens.css")
if (fs.existsSync(TOKEN_CSS_PATH)) {
  const tokenCss = fs.readFileSync(TOKEN_CSS_PATH, "utf8")
  // the layer is optional until the block exists; once present it is always checked
  if (tokenCss.includes(BEGIN)) {
    for (const message of lintComponentTokens(tokenCss)) {
      violations.push({ file: "packages/tokens/atlas.tokens.css", line: 0, rule: "component-token-alias", text: message })
    }
  }
}
```

Also add rule 5 to the header comment list: ` *   5. Component tokens alias semantic tokens (the one exception is --atlas-card-filled-background-hover)`.

- [ ] **Step 2: Prove it catches a violation, then passes on the real tree**

```bash
cp packages/tokens/atlas.tokens.css /tmp/claude-501/tok.bak
printf '\n/* BEGIN:component-tokens */\n:root, [data-theme="dark"], .dark {\n  --atlas-button-primary-background: var(--atlas-color-brand-500);\n}\n/* END:component-tokens */\n' >> packages/tokens/atlas.tokens.css
node packages/governance/token-lint.mjs; echo "exit=$?"
cp /tmp/claude-501/tok.bak packages/tokens/atlas.tokens.css
node packages/governance/token-lint.mjs; echo "exit=$?"
git diff --stat packages/tokens
```
Expected: first run prints `[component-token-alias] … aliases a primitive` and `exit=1`; second prints `✅ Token lint: 0 violations`, `exit=0`; the diff stat shows nothing under `packages/tokens`.

- [ ] **Step 3: Commit**

```bash
git add packages/governance/token-lint.mjs
git commit -m "feat(governance): token-lint rejects component tokens that do not alias semantic tokens

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `atlas/tokens.md` section

**Files:**
- Modify: `scripts/atlas-sync.mjs` (import; the `tokens.md` loop at the `for (const rel of ["atlas/tokens.md", "atlas/README.md"])` block)
- Test: `scripts/tests/atlas-sync.test.mjs` (append)

**Interfaces:**
- Consumes: `renderComponentSection`, `SECTION_BEGIN`, `SECTION_END`, `BEGIN` from Task 1.
- Produces: a generated, marker-delimited section in `atlas/tokens.md`; no section and no churn when the CSS has no block.

- [ ] **Step 1: Write the failing test** (append to `scripts/tests/atlas-sync.test.mjs`)

```js
test("tokens.md gets a labelled component-token section, and a second sync writes nothing", () => {
  const dir = copyInputs()
  try {
    const cssPath = path.join(dir, "packages/tokens/atlas.tokens.css")
    const css = fs.readFileSync(cssPath, "utf8")
    const at = css.indexOf("/* ─────────────── RTL")
    assert.ok(at > 0, "RTL marker moved; update this test")
    const block = '/* BEGIN:component-tokens */\n:root,\n[data-theme="dark"],\n.dark {\n  --atlas-button-primary-background: var(--atlas-primary);\n}\n/* END:component-tokens */\n\n'
    fs.writeFileSync(cssPath, css.slice(0, at) + block + css.slice(at))

    sync(dir)
    const md = fs.readFileSync(path.join(dir, "atlas/tokens.md"), "utf8")
    assert.match(md, /<!-- BEGIN:generated-component-tokens -->/)
    assert.match(md, /Atlas implementation tokens/)
    assert.match(md, /`button-primary-background` → `primary`/)
    assert.equal(writtenCount(sync(dir)), 0)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test("tokens.md has no component-token section while the CSS has no block", () => {
  const dir = copyInputs()
  try {
    sync(dir)
    assert.doesNotMatch(fs.readFileSync(path.join(dir, "atlas/tokens.md"), "utf8"), /generated-component-tokens/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})
```

- [ ] **Step 2: Run to verify the first fails**

Run: `node --test scripts/tests/atlas-sync.test.mjs`
Expected: the new "labelled component-token section" test FAILS (no `generated-component-tokens` in `tokens.md`); the existing tests pass.

- [ ] **Step 3: Implement**

Add near the other imports at the top of `scripts/atlas-sync.mjs`:

```js
import { renderComponentSection, SECTION_BEGIN, SECTION_END } from "./lib/component-tokens.mjs"
```

In the `for (const rel of ["atlas/tokens.md", "atlas/README.md"])` loop, extend the `tokens.md` branch:

```js
  if (rel === "atlas/tokens.md") {
    body = upsertSection(body, LAYOUT_BEGIN, LAYOUT_END, layoutSection)
    const componentSection = renderComponentSection(read(TOKENS_CSS))
    if (componentSection) body = upsertSection(body, SECTION_BEGIN, SECTION_END, componentSection)
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/tests/*.test.mjs`
Expected: all pass (the previous 12 plus 17 new), 0 fail.

- [ ] **Step 5: Confirm the real tree is unchanged, then commit**

```bash
node scripts/atlas-sync.mjs --check | grep -E "would write|written"
git add scripts/atlas-sync.mjs scripts/tests/atlas-sync.test.mjs
git commit -m "feat(atlas-sync): render component tokens into atlas/tokens.md as implementation tokens

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
Expected: `would write 0` (no block exists yet).

---

### Gate A — owner approves Figma writes

Stop here. Tasks 4–7 write to Figma and change tokens and components. The owner reviews this plan and says "go" before Task 4 step 2. Task 4 step 1 is read-only and may run earlier.

---

### Task 4: Figma — `Atlas/Component` collection and rebinding

**Files:** none in the repo; Figma file `cKYhfaHLCoyMHi9nKr63Ig`. Scratch output goes to the scratchpad directory only.

**Known facts (read-only discovery, 2026-10-09):** collections `Atlas/Primitives` (199, mode Default), `Atlas/Semantic` (47, modes Light/Dark), `Atlas/Layout`, `Atlas/Responsive Type`. Semantic variables carry `codeSyntax.WEB = var(--atlas-<name>)`. Button set `19:2` has 288 variants (6 × 4 × 2 × 6); its fills bind semantic variables directly and padding/radius bind Primitives variables. Component sets: Button `19:2`, Input `43:111`, Card `110:24`.

**Interfaces:**
- Produces: a collection `Atlas/Component` (single mode `Default`), one variable per token named `<component>/<rest>` (e.g. `button/primary-background-hover`) with `codeSyntax.WEB = var(--atlas-<component>-<rest>)`, type COLOR or FLOAT, each aliasing the target variable found by matching `codeSyntax.WEB` of the existing variables.

- [ ] **Step 1: Read-only baseline — record resolved values of every variant (Light and Dark)**

Run each set with `use_figma` (`skillNames: "figma-use"`), once per set id (`19:2`, `43:111`, `110:24`). Save the returned JSON to `<scratchpad>/figma-before-<id>.json`.

```js
const SET_ID = "REPLACE_WITH_SET_ID" // the only edit per run: 19:2, 43:111 or 110:24
const set = await figma.getNodeByIdAsync(SET_ID)
const cols = await figma.variables.getLocalVariableCollectionsAsync()
const semantic = cols.find((c) => c.name === "Atlas/Semantic")
const modeId = (name) => semantic.modes.find((m) => m.name === name).modeId

async function resolve(variableId, modeName, depth = 0) {
  const v = await figma.variables.getVariableByIdAsync(variableId)
  const col = cols.find((c) => c.id === v.variableCollectionId)
  const mid = col.id === semantic.id ? modeId(modeName) : col.modes[0].modeId
  const val = v.valuesByMode[mid]
  if (val && val.type === "VARIABLE_ALIAS" && depth < 8) return resolve(val.id, modeName, depth + 1)
  return val
}
const round = (c) => c && typeof c === "object" && "r" in c ? [c.r, c.g, c.b].map((x) => Math.round(x * 255)).join(",") : c

const rows = {}
for (const node of set.children) {
  const bv = node.boundVariables || {}
  const entry = {}
  for (const prop of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "itemSpacing", "topLeftRadius", "height"]) {
    const b = bv[prop]
    if (b) entry[prop] = { bound: b.id, light: await resolve(b.id, "Light") }
  }
  for (const kind of ["fills", "strokes"]) {
    const list = node[kind] || []
    for (let i = 0; i < list.length; i++) {
      const b = list[i].boundVariables && list[i].boundVariables.color
      if (b) entry[`${kind}.${i}`] = { bound: b.id, light: round(await resolve(b.id, "Light")), dark: round(await resolve(b.id, "Dark")) }
    }
  }
  rows[node.name] = entry
}
return { setId: SET_ID, count: set.children.length, rows }
```
Expected: `count` 288 (Button), the Input and Card counts, and no error. If the return exceeds the 20 KB limit, filter `set.children` by `Variant=` into several calls and save each part; the later diff step uses the same split.

- [ ] **Step 2: Create the collection (idempotent; stops if it already exists)**

Inventory below is the authoritative list; it must equal the CSS block in Task 5 (a later step diffs them). Run with `use_figma`.

```js
const INVENTORY = {
  // name (after "--atlas-") : semantic/primitive target name (after "--atlas-"), kind
  "button-primary-background": ["primary", "c"], "button-primary-background-hover": ["primary-hover", "c"],
  "button-primary-background-active": ["primary-active", "c"], "button-primary-foreground": ["primary-foreground", "t"],
  "button-secondary-background": ["background-muted", "c"], "button-secondary-background-hover": ["background-subtle", "c"],
  "button-secondary-background-active": ["background-subtle", "c"], "button-secondary-foreground": ["foreground", "t"],
  "button-outline-foreground": ["foreground", "t"], "button-outline-border": ["border-strong", "c"],
  "button-outline-background-hover": ["background-subtle", "c"], "button-outline-background-active": ["background-muted", "c"],
  "button-ghost-foreground": ["foreground", "t"], "button-ghost-background-hover": ["background-subtle", "c"],
  "button-ghost-background-active": ["background-muted", "c"],
  "button-destructive-background": ["danger", "c"], "button-destructive-background-hover": ["danger-hover", "c"],
  "button-destructive-background-active": ["danger-hover", "c"], "button-destructive-foreground": ["danger-foreground", "t"],
  "button-link-foreground": ["primary", "t"], "button-link-foreground-hover": ["primary-hover", "t"],
  "button-link-foreground-active": ["primary-active", "t"], "button-foreground-disabled": ["foreground-disabled", "t"],
  "button-radius": ["radius-md", "r"], "button-gap": ["spacing-2", "g"], "button-size-xs-gap": ["spacing-1", "g"],
  "button-size-xs-height": ["spacing-6", "h"], "button-size-xs-padding-inline": ["spacing-2", "g"], "button-size-xs-font-size": ["font-size-xs", "f"],
  "button-size-sm-height": ["spacing-8", "h"], "button-size-sm-padding-inline": ["spacing-3", "g"], "button-size-sm-font-size": ["font-size-sm", "f"],
  "button-size-md-height": ["spacing-10", "h"], "button-size-md-padding-inline": ["spacing-4", "g"], "button-size-md-font-size": ["font-size-base", "f"],
  "button-size-lg-height": ["spacing-12", "h"], "button-size-lg-padding-inline": ["spacing-6", "g"], "button-size-lg-font-size": ["font-size-base", "f"],

  "input-foreground": ["foreground", "t"], "input-background": ["background", "c"], "input-border": ["border", "c"],
  "input-border-hover": ["border-strong", "c"], "input-border-focus": ["primary", "c"], "input-border-invalid": ["danger", "c"],
  "input-placeholder": ["foreground-muted", "t"], "input-background-disabled": ["background-muted", "c"],
  "input-foreground-disabled": ["foreground-disabled", "t"], "input-filled-background": ["background-muted", "c"],
  "input-filled-background-hover": ["background-subtle", "c"], "input-filled-background-focus": ["background", "c"],
  "input-icon-foreground": ["foreground-muted", "t"], "input-affix-foreground": ["foreground-muted", "t"],
  "input-radius": ["radius-md", "r"], "input-icon-size": ["spacing-5", "h"], "input-adornment-padding": ["spacing-10", "g"],
  "input-size-sm-height": ["spacing-8", "h"], "input-size-sm-padding-inline": ["spacing-3", "g"], "input-size-sm-font-size": ["font-size-sm", "f"],
  "input-size-md-height": ["spacing-10", "h"], "input-size-md-padding-inline": ["spacing-3", "g"], "input-size-md-font-size": ["font-size-base", "f"],
  "input-size-lg-height": ["spacing-12", "h"], "input-size-lg-padding-inline": ["spacing-4", "g"], "input-size-lg-font-size": ["font-size-base", "f"],

  "card-default-background": ["background", "c"], "card-default-border": ["border", "c"],
  "card-elevated-background": ["surface-raised", "c"],
  "card-outlined-background": ["background", "c"], "card-outlined-border": ["border-strong", "c"],
  "card-outlined-background-hover": ["background-subtle", "c"],
  "card-filled-background": ["background-muted", "c"],
  "card-selected-border": ["primary", "c"], "card-selected-background": ["background-subtle", "c"],
  "card-title-foreground": ["foreground", "t"], "card-description-foreground": ["foreground-muted", "t"],
  "card-radius": ["radius-lg", "r"],
  "card-size-sm-padding": ["spacing-3", "g"], "card-size-sm-gap": ["spacing-2", "g"],
  "card-size-md-padding": ["spacing-4", "g"], "card-size-md-gap": ["spacing-3", "g"],
  "card-size-lg-padding": ["spacing-6", "g"], "card-size-lg-gap": ["spacing-4", "g"],
}
// Elevation tokens and the one exception are handled separately (see below).

const SCOPES = { c: ["ALL_FILLS", "STROKE_COLOR"], t: ["TEXT_FILL"], r: ["CORNER_RADIUS"], g: ["GAP"], h: ["WIDTH_HEIGHT"], f: ["FONT_SIZE"] }

const existing = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === "Atlas/Component")
if (existing) return { stopped: "Atlas/Component already exists", id: existing.id, variables: existing.variableIds.length }

const all = await figma.variables.getLocalVariablesAsync()
const byCode = new Map(all.map((v) => [v.codeSyntax && v.codeSyntax.WEB, v]))
const col = figma.variables.createVariableCollection("Atlas/Component")
const modeId = col.modes[0].modeId
col.renameMode(modeId, "Default")

const created = [], missing = []
for (const [name, [target, kind]] of Object.entries(INVENTORY)) {
  const t = byCode.get(`var(--atlas-${target})`)
  if (!t) { missing.push([name, target]); continue }
  const slash = name.indexOf("-")
  const figmaName = `${name.slice(0, slash)}/${name.slice(slash + 1)}`
  const v = figma.variables.createVariable(figmaName, col, t.resolvedType)
  v.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: t.id })
  v.setVariableCodeSyntax("WEB", `var(--atlas-${name})`)
  v.scopes = SCOPES[kind]
  created.push(v.id)
}
return { collectionId: col.id, created: created.length, missing }
```
Expected: `created` equals the inventory size and `missing` is `[]`. Any entry in `missing` means a target name does not exist in Figma: stop and report the name (a Figma↔code naming gap), do not invent a variable.

**Elevation and the exception (Figma):** `--atlas-card-elevated-shadow: var(--atlas-shadow-md)`, `--atlas-card-elevated-shadow-hover: var(--atlas-shadow-lg)` are effect styles in Figma, not variables; they are **code-only tokens** in Task 5 and are recorded in the Figma collection's description. `--atlas-card-filled-background-hover` (the exception): first run step 3's lookup of what Card `Variant=filled, State=hover` binds today. If it binds a semantic variable, create `card/filled-background-hover` as an alias of that variable and log a discrepancy (`DISC-NNN`: code uses `color-mix(...)`, Figma draws `<variable>`); if it binds nothing, do not create the variable and log the same discrepancy. This is an existing Figma↔code difference; it must be surfaced, not hidden.

- [ ] **Step 3: Rebind dry run (writes nothing)**

For each set id run with `DRY = true`. The resolver binds a node property to the unique component token whose target equals the currently bound variable **and** whose name matches the node's `Variant` (and `State` suffix `-hover`/`-active`/`-focus`/`-disabled` when the property is a state colour). Any binding with zero or several candidates is reported, not changed.

```js
const SET_ID = "REPLACE_WITH_SET_ID"
const DRY = true
const COMPONENT = { "19:2": "button", "43:111": "input", "110:24": "card" }[SET_ID]
const set = await figma.getNodeByIdAsync(SET_ID)
const all = await figma.variables.getLocalVariablesAsync()
const comp = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === "Atlas/Component")
const tokens = []
for (const id of comp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id)
  if (!v.name.startsWith(`${COMPONENT}/`)) continue
  const alias = v.valuesByMode[comp.modes[0].modeId]
  tokens.push({ v, name: v.name.slice(COMPONENT.length + 1), target: alias.id })
}
const props = (n) => Object.fromEntries(n.name.split(", ").map((p) => p.split("=")))
const stateSuffix = (state) => ({ hover: "-hover", active: "-active", "focus-visible": "-focus", focus: "-focus", disabled: "-disabled", invalid: "-invalid", error: "-invalid" }[state] || "")

function pick(node, boundId, role) {
  const p = props(node)
  const variant = (p.Variant || "").toLowerCase()
  const suffix = stateSuffix((p.State || "").toLowerCase())
  let cands = tokens.filter((t) => t.target === boundId && !/^size-/.test(t.name))
  const byVariant = cands.filter((t) => t.name.startsWith(`${variant}-`))
  if (byVariant.length) cands = byVariant
  if (role === "fill" || role === "stroke") {
    const stateful = cands.filter((t) => (suffix ? t.name.endsWith(suffix) : !/-(hover|active|focus|disabled|invalid)$/.test(t.name)))
    if (stateful.length) cands = stateful
  }
  return cands
}

const changed = [], ambiguous = [], unmatched = []
for (const node of set.children) {
  for (const kind of ["fills", "strokes"]) {
    const list = [...(node[kind] || [])]
    let dirty = false
    for (let i = 0; i < list.length; i++) {
      const b = list[i].boundVariables && list[i].boundVariables.color
      if (!b) continue
      const c = pick(node, b.id, kind === "fills" ? "fill" : "stroke")
      if (c.length === 1) {
        if (!DRY) list[i] = figma.variables.setBoundVariableForPaint(list[i], "color", c[0].v)
        dirty = true; changed.push([node.name, `${kind}.${i}`, c[0].v.name])
      } else (c.length ? ambiguous : unmatched).push([node.name, `${kind}.${i}`, c.map((x) => x.v.name)])
    }
    if (dirty && !DRY) node[kind] = list
  }
}
return { setId: SET_ID, dry: DRY, changed: changed.length, ambiguous: ambiguous.slice(0, 30), unmatched: unmatched.slice(0, 30), sample: changed.slice(0, 12) }
```
Expected: review the report with the owner. `ambiguous` and `unmatched` rows are resolved by hand (extend `pick`, or leave those bindings on semantic tokens) before step 4. Size bindings (padding, radius, height, font size, gap) are rebound the same way after the colour pass: replace the paint loop with `node.setBoundVariable(prop, token)` for the properties that are already bound, matching on target and the size name from `Size=`. If a property (for example `height`) is not bound today, leave it unbound: do not add new bindings, only swap existing ones.

- [ ] **Step 4: Apply, one set at a time**

Set `DRY = false` and run for `19:2`, then `43:111`, then `110:24`. Save each return.
Expected: `changed` equals the dry-run `changed`.

- [ ] **Step 5: Re-run the Step 1 baseline script into `<scratchpad>/figma-after-<id>.json` and diff**

```bash
for id in 19:2 43:111 110:24; do
  diff <(jq -S '.rows | map_values(map_values(del(.bound)))' "$SCRATCH/figma-before-$id.json") \
       <(jq -S '.rows | map_values(map_values(del(.bound)))' "$SCRATCH/figma-after-$id.json") && echo "$id identical"
done
```
Expected: `19:2 identical`, `43:111 identical`, `110:24 identical` (resolved Light and Dark values are unchanged; only the bound variable ids differ, which `del(.bound)` removes). Any diff: stop; fix or revert that set's bindings before continuing.

- [ ] **Step 6: Visual check**

`get_screenshot` for one variant row of each set in Light and in Dark mode; compare with the pre-change look. Expected: indistinguishable.

- [ ] **Step 7: Owner approval of Figma** (gate 2). Record the new collection in `atlas/state/decisions.json` in Task 7, not now.

---

### Task 5: CSS block (tokens only; components unchanged)

**Files:**
- Modify: `packages/tokens/atlas.tokens.css` — insert immediately before the `/* ─────────────── RTL ─────────────── */` comment (after the dark theme block)
- Test: `scripts/tests/component-tokens.test.mjs` (append)

**Interfaces:**
- Consumes: Task 1 lint; the Figma inventory from Task 4 (names and targets are identical).
- Produces: all component tokens available to the module CSS files in Task 6.

- [ ] **Step 1: Add the repo-level tests (they fail until the block exists)**

Append to `scripts/tests/component-tokens.test.mjs`:

```js
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const REAL_CSS = fs.readFileSync(path.join(REPO, "packages/tokens/atlas.tokens.css"), "utf8")

test("the real token CSS has a valid component-token block", () => {
  assert.deepEqual(lintComponentTokens(REAL_CSS), [])
  assert.ok(parseComponentTokens(REAL_CSS).length >= 80)
})

test("the real block keeps the exception comment beside the exception token", () => {
  const i = REAL_CSS.indexOf(CARD_EXCEPTION.name)
  assert.ok(i > 0)
  assert.match(REAL_CSS.slice(Math.max(0, i - 400), i), /approved exception/)
})

test("every semantic alias target in the real block is defined in the token file", () => {
  const defined = new Set([...REAL_CSS.matchAll(/(--atlas-[\w-]+)\s*:/g)].map((m) => m[1]))
  for (const t of parseComponentTokens(REAL_CSS)) {
    const target = t.value.match(/^var\((--atlas-[\w-]+)\)$/)
    if (target) assert.ok(defined.has(target[1]), `${t.name} aliases undefined ${target[1]}`)
  }
})
```

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: the three new tests FAIL (`no component-token block`).

- [ ] **Step 2: Insert the block**

```css
/* ─────────────── Component tokens (Atlas implementation tokens) ───────────────
   For implementing and documenting Atlas components. Every token aliases a semantic
   token; product code uses the semantic tokens instead. Declared on the same selectors
   as the theme blocks so a .dark subtree re-resolves each alias.
   Naming: colour/state  --atlas-<component>-<variant>-<property>[-<state>]
           size          --atlas-<component>-size-<size>-<property>
   Spec: docs/superpowers/specs/2026-10-09-component-tokens-design.md */
/* BEGIN:component-tokens */
:root,
[data-theme="dark"],
.dark {
  /* Button · colour */
  --atlas-button-primary-background: var(--atlas-primary);
  --atlas-button-primary-background-hover: var(--atlas-primary-hover);
  --atlas-button-primary-background-active: var(--atlas-primary-active);
  --atlas-button-primary-foreground: var(--atlas-primary-foreground);
  --atlas-button-secondary-background: var(--atlas-background-muted);
  --atlas-button-secondary-background-hover: var(--atlas-background-subtle);
  --atlas-button-secondary-background-active: var(--atlas-background-subtle);
  --atlas-button-secondary-foreground: var(--atlas-foreground);
  --atlas-button-outline-foreground: var(--atlas-foreground);
  --atlas-button-outline-border: var(--atlas-border-strong);
  --atlas-button-outline-background-hover: var(--atlas-background-subtle);
  --atlas-button-outline-background-active: var(--atlas-background-muted);
  --atlas-button-ghost-foreground: var(--atlas-foreground);
  --atlas-button-ghost-background-hover: var(--atlas-background-subtle);
  --atlas-button-ghost-background-active: var(--atlas-background-muted);
  --atlas-button-destructive-background: var(--atlas-danger);
  --atlas-button-destructive-background-hover: var(--atlas-danger-hover);
  --atlas-button-destructive-background-active: var(--atlas-danger-hover);
  --atlas-button-destructive-foreground: var(--atlas-danger-foreground);
  --atlas-button-link-foreground: var(--atlas-primary);
  --atlas-button-link-foreground-hover: var(--atlas-primary-hover);
  --atlas-button-link-foreground-active: var(--atlas-primary-active);
  --atlas-button-foreground-disabled: var(--atlas-foreground-disabled);
  /* Button · size and shape */
  --atlas-button-radius: var(--atlas-radius-md);
  --atlas-button-gap: var(--atlas-spacing-2);
  --atlas-button-size-xs-gap: var(--atlas-spacing-1);
  --atlas-button-size-xs-height: var(--atlas-spacing-6);
  --atlas-button-size-xs-padding-inline: var(--atlas-spacing-2);
  --atlas-button-size-xs-font-size: var(--atlas-font-size-xs);
  --atlas-button-size-sm-height: var(--atlas-spacing-8);
  --atlas-button-size-sm-padding-inline: var(--atlas-spacing-3);
  --atlas-button-size-sm-font-size: var(--atlas-font-size-sm);
  --atlas-button-size-md-height: var(--atlas-spacing-10);
  --atlas-button-size-md-padding-inline: var(--atlas-spacing-4);
  --atlas-button-size-md-font-size: var(--atlas-font-size-base);
  --atlas-button-size-lg-height: var(--atlas-spacing-12);
  --atlas-button-size-lg-padding-inline: var(--atlas-spacing-6);
  --atlas-button-size-lg-font-size: var(--atlas-font-size-base);

  /* Input · colour */
  --atlas-input-foreground: var(--atlas-foreground);
  --atlas-input-background: var(--atlas-background);
  --atlas-input-border: var(--atlas-border);
  --atlas-input-border-hover: var(--atlas-border-strong);
  --atlas-input-border-focus: var(--atlas-primary);
  --atlas-input-border-invalid: var(--atlas-danger);
  --atlas-input-placeholder: var(--atlas-foreground-muted);
  --atlas-input-background-disabled: var(--atlas-background-muted);
  --atlas-input-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-input-filled-background: var(--atlas-background-muted);
  --atlas-input-filled-background-hover: var(--atlas-background-subtle);
  --atlas-input-filled-background-focus: var(--atlas-background);
  --atlas-input-icon-foreground: var(--atlas-foreground-muted);
  --atlas-input-affix-foreground: var(--atlas-foreground-muted);
  /* Input · size and shape */
  --atlas-input-radius: var(--atlas-radius-md);
  --atlas-input-icon-size: var(--atlas-spacing-5);
  --atlas-input-adornment-padding: var(--atlas-spacing-10);
  --atlas-input-size-sm-height: var(--atlas-spacing-8);
  --atlas-input-size-sm-padding-inline: var(--atlas-spacing-3);
  --atlas-input-size-sm-font-size: var(--atlas-font-size-sm);
  --atlas-input-size-md-height: var(--atlas-spacing-10);
  --atlas-input-size-md-padding-inline: var(--atlas-spacing-3);
  --atlas-input-size-md-font-size: var(--atlas-font-size-base);
  --atlas-input-size-lg-height: var(--atlas-spacing-12);
  --atlas-input-size-lg-padding-inline: var(--atlas-spacing-4);
  --atlas-input-size-lg-font-size: var(--atlas-font-size-base);

  /* Card · colour and elevation */
  --atlas-card-default-background: var(--atlas-background);
  --atlas-card-default-border: var(--atlas-border);
  --atlas-card-elevated-background: var(--atlas-surface-raised);
  --atlas-card-elevated-shadow: var(--atlas-shadow-md);
  --atlas-card-elevated-shadow-hover: var(--atlas-shadow-lg);
  --atlas-card-outlined-background: var(--atlas-background);
  --atlas-card-outlined-border: var(--atlas-border-strong);
  --atlas-card-outlined-background-hover: var(--atlas-background-subtle);
  --atlas-card-filled-background: var(--atlas-background-muted);
  /* approved exception (spec 2026-10-09-component-tokens-design.md): the only component token that is
     not an alias. It preserves the existing computed hover value until a semantic token is approved. */
  --atlas-card-filled-background-hover: color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0));
  --atlas-card-selected-border: var(--atlas-primary);
  --atlas-card-selected-background: var(--atlas-background-subtle);
  --atlas-card-title-foreground: var(--atlas-foreground);
  --atlas-card-description-foreground: var(--atlas-foreground-muted);
  /* Card · size and shape */
  --atlas-card-radius: var(--atlas-radius-lg);
  --atlas-card-size-sm-padding: var(--atlas-spacing-3);
  --atlas-card-size-sm-gap: var(--atlas-spacing-2);
  --atlas-card-size-md-padding: var(--atlas-spacing-4);
  --atlas-card-size-md-gap: var(--atlas-spacing-3);
  --atlas-card-size-lg-padding: var(--atlas-spacing-6);
  --atlas-card-size-lg-gap: var(--atlas-spacing-4);
}
/* END:component-tokens */

```

- [ ] **Step 3: Verify in the required order**

```bash
node scripts/convert-tokens.mjs && git diff --exit-code packages/ui-native/tokens/atlas.tokens.ts && echo "native tokens unchanged"   # 1 token build
node packages/governance/token-lint.mjs                                                                                          # 2 token-lint
npx tsc --noEmit                                                                                                                 # 3 typecheck
npx vitest run                                                                                                                   # 4 vitest
npx eslint packages/ui-web/src/ --ext .ts,.tsx --max-warnings=7                                                                  # 5 ESLint
node --test scripts/tests/*.test.mjs                                                                                             # (script tests)
node scripts/atlas-sync.mjs && npm run atlas:verify -- --allow-new-token                                                         # 6 atlas:verify
PW_CHROMIUM=<path to installed headless chromium> npm run test:visual                                                            # 7 visual regression (local baselines)
```
Expected: `native tokens unchanged`; `✅ Token lint: 0 violations`; tsc silent; 1059 vitest pass; ESLint exit 0; script tests pass including the three new ones; `atlas:verify` 12 pass, 0 fail; visual regression `2 passed` (no component CSS changed yet, so zero pixel change). The one extra passing signal to look for: `atlas/tokens.md` now ends with the `## Component tokens (Atlas implementation tokens)` section.

- [ ] **Step 4: Commit tokens and the regenerated snapshot**

```bash
git add packages/tokens/atlas.tokens.css scripts/tests/component-tokens.test.mjs atlas
git commit -m "feat(tokens): add aliased component-token layer for Button, Input and Card

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Switch the three components to the new tokens

Do one component per sub-task, commit each, and run the visual check after each. Replacements are literal: in each file, in the stated rule, replace the left token with the right token. Do not change any other line, any selector, or any logical property.

- [ ] **Step 1: Button** — `packages/ui-web/src/primitives/Button/Button.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.btn` | `gap` | `--atlas-spacing-2` | `--atlas-button-gap` |
| `.btn` | `border-radius` | `--atlas-radius-md` | `--atlas-button-radius` |
| `.btn:disabled, .btn[aria-disabled="true"]` | `color` | `--atlas-foreground-disabled` | `--atlas-button-foreground-disabled` |
| `.primary` | `background-color`, `color` | `--atlas-primary`, `--atlas-primary-foreground` | `--atlas-button-primary-background`, `--atlas-button-primary-foreground` |
| `.primary:hover…` / `:active…` | `background-color` | `--atlas-primary-hover` / `--atlas-primary-active` | `--atlas-button-primary-background-hover` / `-active` |
| `.secondary` | `background-color`, `color` | `--atlas-background-muted`, `--atlas-foreground` | `--atlas-button-secondary-background`, `--atlas-button-secondary-foreground` |
| `.secondary:hover…` / `:active…` | `background-color` | `--atlas-background-subtle` (both) | `--atlas-button-secondary-background-hover` / `-active` |
| `.outline` | `color`, `border-color` | `--atlas-foreground`, `--atlas-border-strong` | `--atlas-button-outline-foreground`, `--atlas-button-outline-border` |
| `.outline:hover…` / `:active…` | `background-color` | `--atlas-background-subtle` / `--atlas-background-muted` | `--atlas-button-outline-background-hover` / `-active` |
| `.ghost` | `color` | `--atlas-foreground` | `--atlas-button-ghost-foreground` |
| `.ghost:hover…` / `:active…` | `background-color` | `--atlas-background-subtle` / `--atlas-background-muted` | `--atlas-button-ghost-background-hover` / `-active` |
| `.destructive` | `background-color`, `color` | `--atlas-danger`, `--atlas-danger-foreground` | `--atlas-button-destructive-background`, `--atlas-button-destructive-foreground` |
| `.destructive:hover…` / `:active…` | `background-color` | `--atlas-danger-hover` (both) | `--atlas-button-destructive-background-hover` / `-active` |
| `.link` | `color` | `--atlas-primary` | `--atlas-button-link-foreground` |
| `.link:hover…` / `:active…` | `color` | `--atlas-primary-hover` / `--atlas-primary-active` | `--atlas-button-link-foreground-hover` / `-active` |
| `.xs` | `height`, `padding-inline`, `gap`, `font-size` | `--atlas-spacing-6`, `--atlas-spacing-2`, `--atlas-spacing-1`, `--atlas-font-size-xs` | `--atlas-button-size-xs-height`, `-padding-inline`, `-gap`, `-font-size` |
| `.sm` | `height`, `padding-inline`, `font-size` | `--atlas-spacing-8`, `--atlas-spacing-3`, `--atlas-font-size-sm` | `--atlas-button-size-sm-height`, `-padding-inline`, `-font-size` |
| `.md` | same three | `--atlas-spacing-10`, `--atlas-spacing-4`, `--atlas-font-size-base` | `--atlas-button-size-md-height`, `-padding-inline`, `-font-size` |
| `.lg` | same three | `--atlas-spacing-12`, `--atlas-spacing-6`, `--atlas-font-size-base` | `--atlas-button-size-lg-height`, `-padding-inline`, `-font-size` |
| `.xs.icon` / `.sm.icon` / `.md.icon` / `.lg.icon` | `width` | `--atlas-spacing-6/8/10/12` | `--atlas-button-size-<size>-height` |

Left unchanged: focus ring, `border-width`, transition durations/easings, `opacity-disabled`, the `@media (pointer: coarse)` touch rules, spinner rules.

Run the full verification order from Task 5 step 3, then `git diff --stat` to confirm only this file changed, then commit:
`git commit -m "refactor(button): use component tokens (no visual change)"` (with the trailer).
Expected: visual regression `2 passed` against the unchanged baselines.

- [ ] **Step 2: Input** — `packages/ui-web/src/primitives/Input/Input.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.input` | `color`, `background-color`, `border` colour, `border-radius` | `--atlas-foreground`, `--atlas-background`, `--atlas-border`, `--atlas-radius-md` | `--atlas-input-foreground`, `--atlas-input-background`, `--atlas-input-border`, `--atlas-input-radius` |
| `.input::placeholder` | `color` | `--atlas-foreground-muted` | `--atlas-input-placeholder` |
| `.input:hover:not(…)` | `border-color` | `--atlas-border-strong` | `--atlas-input-border-hover` |
| `.input:focus-visible` | `border-color` | `--atlas-primary` | `--atlas-input-border-focus` |
| `.input:disabled` | `background-color`, `color` | `--atlas-background-muted`, `--atlas-foreground-disabled` | `--atlas-input-background-disabled`, `--atlas-input-foreground-disabled` |
| `.input[aria-invalid="true"]` | `border-color` | `--atlas-danger` | `--atlas-input-border-invalid` |
| `.sm` / `.md` / `.lg` | `height`, `padding-inline`, `font-size` | `--atlas-spacing-8/10/12`, `--atlas-spacing-3/3/4`, `--atlas-font-size-sm/base/base` | `--atlas-input-size-<size>-height`, `-padding-inline`, `-font-size` |
| `.default:has(…)`, `.filled:has(…)` | `border-radius` | `--atlas-radius-md` | `--atlas-input-radius` |
| `.filled .input` | `background-color` | `--atlas-background-muted` | `--atlas-input-filled-background` |
| `.filled .input:hover…` | `background-color` | `--atlas-background-subtle` | `--atlas-input-filled-background-hover` |
| `.filled .input:focus-visible` | `background-color`, `border-block-end-color` | `--atlas-background`, `--atlas-primary` | `--atlas-input-filled-background-focus`, `--atlas-input-border-focus` |
| `.filled .input[aria-invalid]`, `.unstyled .input[aria-invalid]` | `border-block-end-color` | `--atlas-danger` | `--atlas-input-border-invalid` |
| `.filled .input:disabled` | `background-color` | `--atlas-background-muted` | `--atlas-input-background-disabled` |
| `.filled .input` radii | `border-start-*-radius` | `--atlas-radius-md` | `--atlas-input-radius` |
| `.unstyled .input:focus-visible` | `border-block-end-color` | `--atlas-primary` | `--atlas-input-border-focus` |
| `.icon` | `color`, `width`, `height` | `--atlas-foreground-muted`, `--atlas-spacing-5` ×2 | `--atlas-input-icon-foreground`, `--atlas-input-icon-size` ×2 |
| `.affix` | `color` | `--atlas-foreground-muted` | `--atlas-input-affix-foreground` |
| `.wrapper[data-leading-icon] .input`, `[data-trailing-icon]`, `[data-prefix]`, `[data-suffix]` | `padding-inline-start/end` | `--atlas-spacing-10` | `--atlas-input-adornment-padding` |

Left unchanged: focus outline, `border-width`, `border-radius: var(--atlas-radius-none)`, icon offsets (`inset-inline-*`), spinner rules, the keyframe `color-mix`, `@media` rules.

Run the verification order, commit `refactor(input): use component tokens (no visual change)`.

- [ ] **Step 3: Card** — `packages/ui-web/src/compositions/Card/Card.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.card` | `border-radius`, `--_card-padding`, `--_card-gap` | `--atlas-radius-lg`, `--atlas-spacing-4`, `--atlas-spacing-3` | `--atlas-card-radius`, `--atlas-card-size-md-padding`, `--atlas-card-size-md-gap` |
| `.sm` | `--_card-padding`, `--_card-gap` | `--atlas-spacing-3`, `--atlas-spacing-2` | `--atlas-card-size-sm-padding`, `--atlas-card-size-sm-gap` |
| `.lg` | `--_card-padding`, `--_card-gap` | `--atlas-spacing-6`, `--atlas-spacing-4` | `--atlas-card-size-lg-padding`, `--atlas-card-size-lg-gap` |
| `.default` | `background-color`, `border` colour | `--atlas-background`, `--atlas-border` | `--atlas-card-default-background`, `--atlas-card-default-border` |
| `.elevated` | `background-color`, `box-shadow` | `--atlas-surface-raised`, `--atlas-shadow-md` | `--atlas-card-elevated-background`, `--atlas-card-elevated-shadow` |
| `.outlined` | `background-color`, `border` colour | `--atlas-background`, `--atlas-border-strong` | `--atlas-card-outlined-background`, `--atlas-card-outlined-border` |
| `.filled` | `background-color` | `--atlas-background-muted` | `--atlas-card-filled-background` |
| `.selected.outlined` | `border-color`, `background-color` | `--atlas-primary`, `--atlas-background-subtle` | `--atlas-card-selected-border`, `--atlas-card-selected-background` |
| `.selected.filled` | `border` colour, `background-color` | `--atlas-primary`, `--atlas-background-subtle` | `--atlas-card-selected-border`, `--atlas-card-selected-background` |
| `.interactive.outlined:hover` | `background-color` | `--atlas-background-subtle` | `--atlas-card-outlined-background-hover` |
| `.interactive.filled:hover` | `background-color` (the winning, second declaration) | `color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0))` | `var(--atlas-card-filled-background-hover)` |
| `.interactive.filled:hover` | first (overridden) `background-color` | `--atlas-background-subtle` | leave as is (dead declaration; removing it is a refactor, out of scope) |
| `.interactive.elevated:hover` | `box-shadow` | `--atlas-shadow-lg` | `--atlas-card-elevated-shadow-hover` |
| `.title` | `color` | `--atlas-foreground` | `--atlas-card-title-foreground` |
| `.description` | `color` | `--atlas-foreground-muted` | `--atlas-card-description-foreground` |

Left unchanged: header/footer gaps, typography tokens, focus ring, transitions, `opacity-disabled`.

Run the verification order, commit `refactor(card): use component tokens (no visual change)`.

---

### Task 7: Final verification, snapshot, decision record, PR

**Files:**
- Modify: `atlas/state/decisions.json` (append DEC-053)
- Regenerated: `atlas/**` via `atlas:sync`

- [ ] **Step 1: Re-sync the snapshot** (component metadata `tokensUsed` now lists the component tokens)

```bash
node scripts/atlas-sync.mjs
node scripts/atlas-sync.mjs --check | grep -E "would write|written"
git diff --stat atlas | tail -3
```
Expected: the second command prints `would write 0`; the diff touches `atlas/tokens.md`, `atlas/metadata/{Button,Input,Card}.json` and the stamped files only.

- [ ] **Step 2: Record DEC-053**

Append to the `decisions` array in `atlas/state/decisions.json` (match the field names of DEC-052: `id`, `topic`, `decision`):

```json
{
  "id": "DEC-053",
  "topic": "Component tokens for Button, Input and Card: aliased layer",
  "decision": "Adds an aliased component-token layer (user, 2026-10-09; spec docs/superpowers/specs/2026-10-09-component-tokens-design.md). Colour (per variant and state) and size/shape tokens for Button, Input and Card: --atlas-<component>-<variant>-<property>[-<state>] and --atlas-<component>-size-<size>-<property>. Every token aliases a semantic token; the single exception is --atlas-card-filled-background-hover, which keeps the existing color-mix value until a semantic token is approved. The block is declared on :root, [data-theme=dark] and .dark so each theme scope re-resolves. Figma: collection Atlas/Component (single mode, aliases of Atlas/Semantic and Atlas/Primitives variables), component sets rebound with identical resolved Light and Dark values. Component tokens are for implementing Atlas components; atlas/tokens.md labels them Atlas implementation tokens and product code keeps using semantic tokens. token-lint rejects a component token that aliases a primitive, another component token or a literal. Native is out of scope and its generated token file is unchanged. Zero visual change: visual regression baselines are untouched."
}
```

- [ ] **Step 3: Full verification in the required order**

```bash
node scripts/convert-tokens.mjs && git diff --exit-code packages/ui-native/tokens/atlas.tokens.ts   # 1 token build
node packages/governance/token-lint.mjs                                                               # 2 token-lint
npx tsc --noEmit                                                                                      # 3 typecheck
npx vitest run                                                                                        # 4 vitest
npx eslint packages/ui-web/src/ --ext .ts,.tsx --max-warnings=7                                       # 5 ESLint
node --test scripts/tests/*.test.mjs                                                                  # script tests
npm run atlas:verify -- --base main --allow-new-token                                                 # 6 atlas:verify
PW_CHROMIUM=<installed headless chromium> npm run test:visual && git status --short tests/visual      # 7 visual regression, no snapshot changes
```
Expected: every step exits 0; `atlas:verify` 12 pass 0 fail; Playwright `2 passed`; `git status` shows nothing under `tests/visual`.

- [ ] **Step 4: Commit, push, open the PR with the approval label**

```bash
git add atlas
git commit -m "docs(atlas): resync snapshot and record DEC-053 (component tokens)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --base main --title "feat(tokens): component tokens for Button, Input and Card" \
  --label atlas-approved-new \
  --body "Aliased component-token layer (spec docs/superpowers/specs/2026-10-09-component-tokens-design.md, plan docs/superpowers/plans/2026-10-09-component-tokens.md). Zero visual change: Visual Regression baselines unchanged. Native untouched. The atlas-approved-new label is intentional: these are new token names approved by the owner.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```
Expected: the PR is created; the `Atlas Verify`, `Lint` and `Visual Regression` checks pass (Atlas Verify only because of the label). Create the `atlas-approved-new` label first if it does not exist (`gh label create atlas-approved-new --color 0E8A16`). Owner reviews and merges (gate 4).

---

## Self-review

- **Spec coverage:** aliasing rule and Card exception (Task 1 lint + Task 5 block with comment); audience and labelled section (Task 1 render, Task 3); naming split (Task 5 block and Global Constraints); `atlas-approved-new` label (Task 7); native out of scope with converter-unchanged proof (Task 5 step 3, Task 7 step 3); Figma-first four gates (Gate A, Task 4); zero-pixel criterion (Tasks 5–7); `.dark` re-resolution (selector rule, Task 1 test); verification order (Global Constraints, Tasks 5 and 7).
- **Deviations from the spec, with reasons:** (1) the spec listed `convert-tokens.mjs` as a file to update; it needs no change, because it only extracts `var(--atlas-color-*)` aliases from the first `:root {` block and the component block's selector starts `:root,`; a test step proves the native file is unchanged. (2) The spec's inventory counts were approximate; the exact list is 38 Button, 26 Input and 21 Card tokens (85), plus `button-gap` and the two Card elevation shadow tokens being code-only. (3) Elevation shadows are effect styles in Figma, so `card-elevated-shadow*` exist in CSS only; this is stated in Task 4.
- **Placeholder scan:** the Figma scripts contain one explicit per-run edit (`SET_ID`), which is the point of the step, not a gap; the verify steps contain one environment-specific value (`PW_CHROMIUM` path of the locally installed Chromium).
- **Type and name consistency:** the token names in Task 4's `INVENTORY`, Task 5's CSS block and the Task 6 tables are the same strings; `lintComponentTokens`, `renderComponentSection`, `SECTION_BEGIN` and `SECTION_END` are named identically in Tasks 1, 2 and 3.
- **Open risk:** Task 4's colour resolver is heuristic (target match plus variant and state suffix). It deliberately reports ambiguous or unmatched bindings instead of changing them, and Step 5's before/after diff of resolved Light and Dark values is the safety net.
