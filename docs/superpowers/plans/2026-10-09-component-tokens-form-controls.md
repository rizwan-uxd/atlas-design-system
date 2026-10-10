# Component Tokens for Form Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 125 aliased component tokens for Textarea, Checkbox, Switch, RadioGroup and Select to Figma and code, retiring three dark-mode `color-mix` overrides.

**Architecture:** Extend the existing component-token layer: allow five new prefixes in `scripts/lib/component-tokens.mjs`, append the token block (below) to the `BEGIN/END:component-tokens` block in `packages/tokens/atlas.tokens.css`, add the same variables to the Figma `Atlas/Component` collection and rebind the five component sets, then switch the five `.module.css` files to the tokens. Gate order is Figma first, then code.

**Tech Stack:** Node ESM (`node --test`), CSS custom properties, Figma Plugin API (`use_figma`), Playwright visual regression, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-component-tokens-form-controls-design.md` (approved 2026-10-09). **Builds on:** `docs/superpowers/plans/2026-10-09-component-tokens.md` (Button, Input, Card; already merged).

## Global Constraints

- Every new token's value is exactly `var(--atlas-<semantic>)`. Never `--atlas-color-*`, a primitive ramp, a literal, `color-mix`, or another component token. No exceptions.
- Naming: colour/state `--atlas-<component>-<variant>-<property>[-<state>]`; size `--atlas-<component>-size-<size>-<property>`; non-size shape `--atlas-<component>-<property>`. New component prefixes: `textarea`, `checkbox`, `switch`, `radio`, `select`.
- Approved `color-mix` decision (DEC-055): Textarea filled hover and Switch off-track hover/active alias `--atlas-background-hovered` in both themes and their dark `color-mix` overrides are deleted. Light pixels do not change (`background-hovered` = `background-subtle` = neutral-50). Dark pixels change in exactly those three states. The Checkbox/Radio dark card-checked `color-mix` rule and the raw `--atlas-primary-subtle` card-checked background stay as they are (no token).
- Not tokenised: Textarea `min-height` (`calc`), Switch track width (`calc`) and thumb travel, focus ring, transitions, `opacity-disabled`, border widths, `--_icon-size`.
- Block selector stays `:root, [data-theme="dark"], .dark`. Native (`packages/ui-native`) is not touched; the generated native token file stays byte-identical.
- Figma wins on any disagreement; Figma is built and approved before CSS changes. Never hand-edit `atlas/` (regenerate with `atlas:sync`).
- The PR carries the `atlas-approved-new` label. Do not bypass the "no new tokens" check any other way.
- Verification order (every verify step follows it): token build → token-lint → typecheck → vitest → ESLint → `atlas:verify` → visual regression.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Reference: the token block (single definition)

Task 2 (Figma) and Task 3 (CSS) both use exactly this text. It goes inside the existing block, immediately before the `}` that precedes `/* END:component-tokens */`.

```css
  /* Textarea · colour */
  --atlas-textarea-foreground: var(--atlas-foreground);
  --atlas-textarea-background: var(--atlas-background);
  --atlas-textarea-border: var(--atlas-border);
  --atlas-textarea-border-hover: var(--atlas-border-strong);
  --atlas-textarea-border-focus: var(--atlas-primary);
  --atlas-textarea-border-invalid: var(--atlas-danger);
  --atlas-textarea-placeholder: var(--atlas-foreground-muted);
  --atlas-textarea-background-disabled: var(--atlas-background-muted);
  --atlas-textarea-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-textarea-filled-background: var(--atlas-background-muted);
  --atlas-textarea-filled-background-hover: var(--atlas-background-hovered);
  --atlas-textarea-filled-background-focus: var(--atlas-background);
  --atlas-textarea-counter-foreground: var(--atlas-foreground-muted);
  --atlas-textarea-counter-foreground-over: var(--atlas-danger);
  /* Textarea · size and shape */
  --atlas-textarea-radius: var(--atlas-radius-md);
  --atlas-textarea-size-sm-padding-block: var(--atlas-spacing-2);
  --atlas-textarea-size-sm-padding-inline: var(--atlas-spacing-3);
  --atlas-textarea-size-sm-font-size: var(--atlas-font-size-sm);
  --atlas-textarea-size-md-padding-block: var(--atlas-spacing-3);
  --atlas-textarea-size-md-padding-inline: var(--atlas-spacing-3);
  --atlas-textarea-size-lg-padding-block: var(--atlas-spacing-3);
  --atlas-textarea-size-lg-padding-inline: var(--atlas-spacing-4);

  /* Checkbox · colour */
  --atlas-checkbox-background: var(--atlas-background);
  --atlas-checkbox-border: var(--atlas-border-strong);
  --atlas-checkbox-foreground: var(--atlas-primary-foreground);
  --atlas-checkbox-background-hover: var(--atlas-background-subtle);
  --atlas-checkbox-border-hover: var(--atlas-foreground);
  --atlas-checkbox-checked-background: var(--atlas-primary);
  --atlas-checkbox-checked-background-hover: var(--atlas-primary-hover);
  --atlas-checkbox-background-disabled: var(--atlas-background-muted);
  --atlas-checkbox-border-disabled: var(--atlas-border);
  --atlas-checkbox-invalid-border: var(--atlas-danger);
  --atlas-checkbox-invalid-checked-background: var(--atlas-danger);
  --atlas-checkbox-invalid-checked-background-hover: var(--atlas-danger-hover);
  --atlas-checkbox-invalid-checked-foreground: var(--atlas-danger-foreground);
  --atlas-checkbox-label-foreground: var(--atlas-foreground);
  --atlas-checkbox-label-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-checkbox-description-foreground: var(--atlas-foreground-muted);
  --atlas-checkbox-description-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-checkbox-required-foreground: var(--atlas-danger);
  --atlas-checkbox-required-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-checkbox-card-border: var(--atlas-border-strong);
  --atlas-checkbox-card-background: var(--atlas-background);
  --atlas-checkbox-card-checked-border: var(--atlas-primary);
  --atlas-checkbox-card-invalid-border: var(--atlas-danger);
  /* Checkbox · size and shape */
  --atlas-checkbox-radius: var(--atlas-radius-sm);
  --atlas-checkbox-card-radius: var(--atlas-radius-md);
  --atlas-checkbox-gap: var(--atlas-spacing-3);
  --atlas-checkbox-size-sm-box: var(--atlas-spacing-4);
  --atlas-checkbox-size-md-box: var(--atlas-spacing-5);
  --atlas-checkbox-size-lg-box: var(--atlas-spacing-6);

  /* Switch · colour */
  --atlas-switch-track-background: var(--atlas-background-muted);
  --atlas-switch-track-background-hover: var(--atlas-background-hovered);
  --atlas-switch-track-background-active: var(--atlas-background-hovered);
  --atlas-switch-checked-track-background: var(--atlas-primary);
  --atlas-switch-checked-track-background-hover: var(--atlas-primary-hover);
  --atlas-switch-checked-track-background-active: var(--atlas-primary-active);
  --atlas-switch-thumb-background: var(--atlas-foreground-on-brand);
  --atlas-switch-label-foreground: var(--atlas-foreground);
  --atlas-switch-description-foreground: var(--atlas-foreground-muted);
  /* Switch · size and shape */
  --atlas-switch-gap: var(--atlas-spacing-3);
  --atlas-switch-size-sm-height: var(--atlas-spacing-4);
  --atlas-switch-size-md-height: var(--atlas-spacing-5);
  --atlas-switch-size-lg-height: var(--atlas-spacing-6);
  --atlas-switch-size-sm-thumb: var(--atlas-spacing-3);
  --atlas-switch-size-md-thumb: var(--atlas-spacing-4);
  --atlas-switch-size-lg-thumb: var(--atlas-spacing-5);

  /* Radio · colour */
  --atlas-radio-background: var(--atlas-background);
  --atlas-radio-border: var(--atlas-border-strong);
  --atlas-radio-foreground: var(--atlas-primary-foreground);
  --atlas-radio-background-hover: var(--atlas-background-subtle);
  --atlas-radio-border-hover: var(--atlas-foreground);
  --atlas-radio-checked-background: var(--atlas-primary);
  --atlas-radio-checked-border: var(--atlas-primary);
  --atlas-radio-checked-background-hover: var(--atlas-primary-hover);
  --atlas-radio-checked-border-hover: var(--atlas-primary-hover);
  --atlas-radio-background-disabled: var(--atlas-background-muted);
  --atlas-radio-border-disabled: var(--atlas-border);
  --atlas-radio-invalid-border: var(--atlas-danger);
  --atlas-radio-invalid-checked-background: var(--atlas-danger);
  --atlas-radio-invalid-checked-border: var(--atlas-danger);
  --atlas-radio-invalid-checked-foreground: var(--atlas-danger-foreground);
  --atlas-radio-invalid-checked-background-hover: var(--atlas-danger-hover);
  --atlas-radio-invalid-checked-border-hover: var(--atlas-danger-hover);
  --atlas-radio-label-foreground: var(--atlas-foreground);
  --atlas-radio-description-foreground: var(--atlas-foreground-muted);
  --atlas-radio-card-border: var(--atlas-border-strong);
  --atlas-radio-card-background: var(--atlas-surface);
  --atlas-radio-card-checked-border: var(--atlas-primary);
  --atlas-radio-card-invalid-border: var(--atlas-danger);
  /* Radio · size and shape */
  --atlas-radio-radius: var(--atlas-radius-full);
  --atlas-radio-card-radius: var(--atlas-radius-md);
  --atlas-radio-gap: var(--atlas-spacing-3);
  --atlas-radio-dot: var(--atlas-spacing-2);
  --atlas-radio-size-sm-control: var(--atlas-spacing-4);
  --atlas-radio-size-md-control: var(--atlas-spacing-5);

  /* Select · colour */
  --atlas-select-foreground: var(--atlas-foreground);
  --atlas-select-background: var(--atlas-background);
  --atlas-select-border: var(--atlas-border);
  --atlas-select-border-hover: var(--atlas-border-strong);
  --atlas-select-border-focus: var(--atlas-primary);
  --atlas-select-border-invalid: var(--atlas-danger);
  --atlas-select-background-disabled: var(--atlas-background-muted);
  --atlas-select-foreground-disabled: var(--atlas-foreground-disabled);
  --atlas-select-placeholder-foreground: var(--atlas-foreground-muted);
  --atlas-select-chevron-foreground: var(--atlas-foreground-muted);
  --atlas-select-content-background: var(--atlas-surface-overlay);
  --atlas-select-content-foreground: var(--atlas-foreground);
  --atlas-select-content-border: var(--atlas-border);
  --atlas-select-item-foreground: var(--atlas-foreground);
  --atlas-select-item-background-focus: var(--atlas-background-accent);
  --atlas-select-item-indicator-foreground: var(--atlas-primary);
  --atlas-select-label-foreground: var(--atlas-foreground-muted);
  /* Select · size and shape */
  --atlas-select-radius: var(--atlas-radius-md);
  --atlas-select-content-radius: var(--atlas-radius-md);
  --atlas-select-size-sm-height: var(--atlas-spacing-8);
  --atlas-select-size-sm-padding-inline-start: var(--atlas-spacing-3);
  --atlas-select-size-sm-padding-inline-end: var(--atlas-spacing-2);
  --atlas-select-size-sm-font-size: var(--atlas-font-size-sm);
  --atlas-select-size-sm-gap: var(--atlas-spacing-1);
  --atlas-select-size-md-height: var(--atlas-spacing-10);
  --atlas-select-size-md-padding-inline-start: var(--atlas-spacing-3);
  --atlas-select-size-md-padding-inline-end: var(--atlas-spacing-2);
  --atlas-select-size-md-font-size: var(--atlas-font-size-base);
  --atlas-select-size-md-gap: var(--atlas-spacing-1);
```

Counts: Textarea 22, Checkbox 29, Switch 16, Radio 29, Select 29 = 125.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/lib/component-tokens.mjs` (modify, line 6) | Allow the five new prefixes. |
| `scripts/tests/component-tokens.test.mjs` (modify, append) | Prefix tests, real-CSS inventory test, `color-mix` retirement guard. |
| `packages/tokens/atlas.tokens.css` (modify) | Append the token block. |
| `packages/ui-web/src/primitives/{Textarea,Checkbox,Switch,RadioGroup,Select}/*.module.css` (modify) | Switch to the tokens (Task 4). |
| `atlas/state/decisions.json` (modify, append) | DEC-055. |
| Figma `Atlas/Component` collection and five component sets | Task 2. |

---

### Task 1: Allow the new prefixes (TDD)

**Files:**
- Modify: `scripts/lib/component-tokens.mjs:6`
- Test: `scripts/tests/component-tokens.test.mjs`

**Interfaces:**
- Produces: `COMPONENTS` now `["button","input","card","textarea","checkbox","switch","radio","select"]`. `lintComponentTokens` accepts names with those prefixes. Nothing else in the lib changes.

- [ ] **Step 1: Write the failing tests** (append to `scripts/tests/component-tokens.test.mjs`)

```js
test("the five form-control prefixes are accepted", () => {
  for (const c of ["textarea", "checkbox", "switch", "radio", "select"]) {
    assert.deepEqual(lintComponentTokens(wrap(`  --atlas-${c}-border: var(--atlas-border);`)), [], c)
  }
})

test("a form-control token may not alias another component token", () => {
  const v = lintComponentTokens(wrap("  --atlas-select-border: var(--atlas-input-border);"))
  assert.match(v.join("\n"), /component token/)
})

test("form-control tokens render under their own heading", () => {
  const md = renderComponentSection(wrap("  --atlas-switch-gap: var(--atlas-spacing-3);"))
  assert.match(md, /### Switch/)
  assert.match(md, /`switch-gap` → `spacing-3`/)
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: FAIL on "the five form-control prefixes are accepted" with `name must be --atlas-(button|input|card)-<…>`.

- [ ] **Step 3: Implement**

In `scripts/lib/component-tokens.mjs`, replace line 6:

```js
export const COMPONENTS = ["button", "input", "card", "textarea", "checkbox", "switch", "radio", "select"]
```

- [ ] **Step 4: Run to verify they pass**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: all tests pass (the earlier "name outside the component prefixes" test still passes because it uses `badge`).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/component-tokens.mjs scripts/tests/component-tokens.test.mjs
git commit -m "feat(tokens): allow form-control component-token prefixes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Figma — extend `Atlas/Component` and rebind (gate 2)

**Files:** none in the repo; Figma file `cKYhfaHLCoyMHi9nKr63Ig`. Scratch output goes to the scratchpad directory only. Load the `figma-use` skill before every `use_figma` call.

**Interfaces:**
- Consumes: the token block above (paste it as `BLOCK`), and the existing `Atlas/Component` collection (single mode `Default`, created in the Button/Input/Card batch).
- Produces: 125 new variables named `<component>/<rest>` (for example `switch/track-background-hover`) with `codeSyntax.WEB = var(--atlas-<component>-<rest>)`, each aliasing the semantic variable whose `codeSyntax.WEB` equals the CSS value. Existing component-set bindings swapped to them where exactly one token fits.

- [ ] **Step 1: Discover the five component sets (read-only)**

```js
const names = ["Textarea", "Checkbox", "Switch", "RadioGroup", "Radio", "Select"]
const sets = figma.root.findAll((n) => n.type === "COMPONENT_SET" && names.includes(n.name))
return sets.map((s) => ({
  id: s.id, name: s.name, variants: s.children.length,
  props: Object.fromEntries(Object.entries(s.componentPropertyDefinitions).filter(([, d]) => d.type === "VARIANT").map(([k, d]) => [k, d.variantOptions])),
}))
```
Expected: one set per name (Radio may be named `Radio` or `RadioGroup`). Record the ids; the later steps use them as `SETS`. Stop and report if a set is missing: a missing set is a Figma gap to decide with the owner, not something to build here.

- [ ] **Step 2: Baseline — resolved values of every variant, Light and Dark**

Run once per set id, saving the JSON to `<scratchpad>/forms-before-<id>.json`.

```js
const SET_ID = "REPLACE_WITH_SET_ID" // the only edit per run
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
const FLOATS = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "itemSpacing", "topLeftRadius", "width", "height", "fontSize"]
const rows = {}
for (const variant of set.children) {
  const nodes = [variant, ...variant.findAll(() => true)]
  const entry = {}
  for (const [ix, node] of nodes.entries()) {
    const bv = node.boundVariables || {}
    for (const prop of FLOATS) {
      const b = bv[prop]
      if (b) entry[`${ix}.${prop}`] = { light: await resolve(b.id, "Light") }
    }
    for (const kind of ["fills", "strokes"]) {
      const list = node[kind] === figma.mixed ? [] : node[kind] || []
      for (let i = 0; i < list.length; i++) {
        const b = list[i].boundVariables && list[i].boundVariables.color
        if (b) entry[`${ix}.${kind}.${i}`] = { light: round(await resolve(b.id, "Light")), dark: round(await resolve(b.id, "Dark")) }
      }
    }
  }
  rows[variant.name] = entry
}
return { setId: SET_ID, count: set.children.length, rows }
```
Expected: `count` equals the variant count from Step 1 and no error. If the result exceeds the 20 KB return limit, split `set.children` by an index range (`set.children.slice(a, b)`) into several calls with the same split reused in Step 6.

- [ ] **Step 3: Create the variables (idempotent)**

Paste the CSS token block from the Reference section as `BLOCK`.

```js
const BLOCK = `PASTE THE TOKEN BLOCK FROM THE PLAN REFERENCE SECTION HERE`
const wanted = [...BLOCK.matchAll(/--atlas-([\w-]+):\s*var\(--atlas-([\w-]+)\);/g)].map((m) => ({ name: m[1], target: m[2] }))
const COMPS = ["textarea", "checkbox", "switch", "radio", "select"]
const cols = await figma.variables.getLocalVariableCollectionsAsync()
const comp = cols.find((c) => c.name === "Atlas/Component")
if (!comp) throw new Error("Atlas/Component collection not found: stop and report")
const all = await figma.variables.getLocalVariablesAsync()
const byWeb = new Map()
for (const v of all) {
  const web = v.codeSyntax && v.codeSyntax.WEB
  if (web && v.variableCollectionId !== comp.id) byWeb.set(web, v)
}
const existing = new Set(all.filter((v) => v.variableCollectionId === comp.id).map((v) => v.name))
const created = [], missing = []
for (const w of wanted) {
  const c = COMPS.find((x) => w.name.startsWith(`${x}-`))
  const figName = `${c}/${w.name.slice(c.length + 1)}`
  if (existing.has(figName)) continue
  const target = byWeb.get(`var(--atlas-${w.target})`)
  if (!target) { missing.push(w); continue }
  const v = figma.variables.createVariable(figName, comp, target.resolvedType)
  v.setValueForMode(comp.modes[0].modeId, figma.variables.createVariableAlias(target))
  v.setVariableCodeSyntax("WEB", `var(--atlas-${w.name})`)
  created.push(figName)
}
return { wanted: wanted.length, created: created.length, missing }
```
Expected: `wanted` 125, `created` 125 on the first run (0 on a re-run), `missing` empty. A non-empty `missing` means a semantic variable named in the block has no `codeSyntax.WEB` in Figma: stop and report that discrepancy; do not invent a variable.

- [ ] **Step 4: Rebind dry run (writes nothing)**

Run per set id with `DRY = true`. A node property is rebound only when exactly one token of that component aliases the currently bound variable after the variant/state filter; zero or several matches are reported and left unchanged.

```js
const SET_ID = "REPLACE_WITH_SET_ID"
const DRY = true
const set = await figma.getNodeByIdAsync(SET_ID)
const COMPONENT = { textarea: "textarea", checkbox: "checkbox", switch: "switch", radiogroup: "radio", radio: "radio", select: "select" }[set.name.toLowerCase()]
const comp = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === "Atlas/Component")
const tokens = []
for (const id of comp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id)
  if (!v.name.startsWith(`${COMPONENT}/`)) continue
  tokens.push({ v, words: v.name.slice(COMPONENT.length + 1).split(/[-/]/), target: v.valuesByMode[comp.modes[0].modeId].id })
}
// every word that is a variant option somewhere in this set, lower-cased, with synonyms
const SYN = { error: "invalid", "focus-visible": "focus", focused: "focus", checked: "checked", unchecked: "unchecked" }
const optionWords = new Set()
for (const d of Object.values(set.componentPropertyDefinitions)) {
  if (d.type === "VARIANT") d.variantOptions.forEach((o) => optionWords.add(SYN[o.toLowerCase()] || o.toLowerCase()))
}
const propWords = (variant) => new Set(Object.values(variant.variantProperties || {}).map((x) => SYN[String(x).toLowerCase()] || String(x).toLowerCase()))
function pick(variant, boundId) {
  const have = propWords(variant)
  return tokens.filter((t) => t.target === boundId && t.words.every((w) => !optionWords.has(w) || have.has(w)))
}
const changed = [], ambiguous = [], unmatched = []
for (const variant of set.children) {
  for (const node of [variant, ...variant.findAll(() => true)]) {
    for (const kind of ["fills", "strokes"]) {
      const list = node[kind] === figma.mixed ? [] : [...(node[kind] || [])]
      let dirty = false
      for (let i = 0; i < list.length; i++) {
        const b = list[i].boundVariables && list[i].boundVariables.color
        if (!b) continue
        const c = pick(variant, b.id)
        if (c.length === 1) {
          if (!DRY) list[i] = figma.variables.setBoundVariableForPaint(list[i], "color", c[0].v)
          dirty = true; changed.push([variant.name, node.name, `${kind}.${i}`, c[0].v.name])
        } else (c.length ? ambiguous : unmatched).push([variant.name, node.name, `${kind}.${i}`, c.map((x) => x.v.name)])
      }
      if (dirty && !DRY) node[kind] = list
    }
    for (const prop of ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "itemSpacing", "topLeftRadius", "width", "height"]) {
      const b = node.boundVariables && node.boundVariables[prop]
      if (!b) continue
      const c = pick(variant, b.id)
      if (c.length === 1) { if (!DRY) node.setBoundVariable(prop, c[0].v); changed.push([variant.name, node.name, prop, c[0].v.name]) }
      else (c.length ? ambiguous : unmatched).push([variant.name, node.name, prop, c.map((x) => x.v.name)])
    }
  }
}
return { setId: SET_ID, dry: DRY, changed: changed.length, ambiguous: ambiguous.slice(0, 30), unmatched: unmatched.slice(0, 30), sample: changed.slice(0, 12) }
```
Expected: a report. Show it to the owner. `ambiguous` and `unmatched` bindings stay on their semantic variables (that is allowed: not every binding needs a component token). Do not add bindings to properties that are unbound today.

- [ ] **Step 5: Apply one set at a time**

Re-run Step 4 with `DRY = false` for each set id, then take a screenshot of each set (`get_screenshot`) and confirm it looks unchanged.

- [ ] **Step 6: After-state diff**

Re-run Step 2 for each set, saving `<scratchpad>/forms-after-<id>.json`, then:

```bash
for f in <scratchpad>/forms-before-*.json; do
  node -e 'const a=require(process.argv[1]),b=require(process.argv[2]);const d=[];for(const k in a.rows)for(const p in a.rows[k]){const x=JSON.stringify(a.rows[k][p]),y=JSON.stringify((b.rows[k]||{})[p]);if(x!==y)d.push([k,p,x,y])}console.log(d.length?d:"identical")' "$f" "${f/before/after}"
done
```
Expected: `identical` for all five sets. Any diff means a rebind changed a resolved value: revert that binding and report it.

- [ ] **Step 7: Gate stop — owner approves the Figma state** (screenshots, binding counts, empty diff). Do not start Task 3 before this.

---

### Task 3: Add the CSS token block

**Files:**
- Modify: `packages/tokens/atlas.tokens.css` (inside the component-token block, before the closing `}` that precedes `/* END:component-tokens */`)
- Test: `scripts/tests/component-tokens.test.mjs`

**Interfaces:**
- Consumes: `COMPONENTS` from Task 1; the token block from the Reference section.
- Produces: 125 new `--atlas-{textarea,checkbox,switch,radio,select}-*` custom properties used by Task 4.

- [ ] **Step 1: Write the failing test** (append to `scripts/tests/component-tokens.test.mjs`)

```js
test("the real block defines the 125 form-control tokens", () => {
  const names = parseComponentTokens(REAL_CSS).map((x) => x.name)
  const counts = { textarea: 22, checkbox: 29, switch: 16, radio: 29, select: 29 }
  for (const [c, n] of Object.entries(counts)) {
    assert.equal(names.filter((x) => x.startsWith(`--atlas-${c}-`)).length, n, c)
  }
})

test("the approved colour-mix retirements alias background-hovered", () => {
  const val = (n) => parseComponentTokens(REAL_CSS).find((x) => x.name === n)?.value
  for (const n of ["--atlas-textarea-filled-background-hover", "--atlas-switch-track-background-hover", "--atlas-switch-track-background-active"]) {
    assert.equal(val(n), "var(--atlas-background-hovered)", n)
  }
})

test("no card-checked background token exists (stays untokenised)", () => {
  const names = parseComponentTokens(REAL_CSS).map((x) => x.name)
  assert.ok(!names.includes("--atlas-checkbox-card-checked-background"))
  assert.ok(!names.includes("--atlas-radio-card-checked-background"))
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: FAIL on the 125-token test (counts are 0).

- [ ] **Step 3: Implement**

Insert the Reference token block into `packages/tokens/atlas.tokens.css` immediately after the last Card line (`--atlas-card-size-lg-gap: var(--atlas-spacing-4);`) and before the `}`. Update the comment above the block only if it lists components by name.

- [ ] **Step 4: Verify** (full order)

```bash
node scripts/convert-tokens.mjs && git diff --exit-code packages/ui-native/tokens/atlas.tokens.ts   # 1 token build: native file unchanged
node packages/governance/token-lint.mjs                                                               # 2 token-lint
node --test scripts/tests/*.test.mjs                                                                  # script tests
npx tsc --noEmit                                                                                      # 3
npx vitest run                                                                                        # 4
```
Expected: every command exits 0, `token-lint` reports no `component-token-alias` violations (it also proves every alias target is defined), and the Task 3 tests pass. If `git diff --exit-code` shows a native diff, stop: the converter picked up a new token and the spec says native is unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/atlas.tokens.css scripts/tests/component-tokens.test.mjs
git commit -m "feat(tokens): add aliased component tokens for Textarea, Checkbox, Switch, Radio and Select

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Switch the five modules to the tokens

One component per sub-step, one commit each. Replacements are literal: in the named rule replace the old value with the new token and change nothing else. Paths are under `packages/ui-web/src/primitives/<Name>/<Name>.module.css`.

**Interfaces:** Consumes the Task 3 tokens. Produces no new names.

- [ ] **Step 1: Write the guard test first** (append to `scripts/tests/component-tokens.test.mjs`; it fails until all sub-steps are done)

```js
const MODULE = (n) => fs.readFileSync(path.join(REPO, `packages/ui-web/src/primitives/${n}/${n}.module.css`), "utf8")
const stripCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "")

test("Textarea and Switch no longer use color-mix", () => {
  for (const n of ["Textarea", "Switch"]) assert.doesNotMatch(stripCss(MODULE(n)), /color-mix/, n)
})

test("Checkbox and RadioGroup keep only the dark card-checked color-mix", () => {
  for (const n of ["Checkbox", "RadioGroup"]) {
    const hits = stripCss(MODULE(n)).match(/color-mix/g) || []
    assert.equal(hits.length, 1, n)
    assert.match(stripCss(MODULE(n)), /\[data-theme="dark"\][^{]*\[data-checked\][^{]*\{[^}]*color-mix/, n)
  }
})

test("each switched module references its component tokens", () => {
  const prefix = { Textarea: "textarea", Checkbox: "checkbox", Switch: "switch", RadioGroup: "radio", Select: "select" }
  for (const [n, p] of Object.entries(prefix)) {
    assert.match(stripCss(MODULE(n)), new RegExp(`var\\(--atlas-${p}-`), n)
  }
})
```
Run: `node --test scripts/tests/component-tokens.test.mjs` — Expected: the three new tests FAIL.

- [ ] **Step 2: Textarea** — `Textarea/Textarea.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.textarea` | `color`, `background-color`, border colour, `border-radius` | `--atlas-foreground`, `--atlas-background`, `--atlas-border`, `--atlas-radius-md` | `--atlas-textarea-foreground`, `-background`, `-border`, `-radius` |
| `.textarea::placeholder` | `color` | `--atlas-foreground-muted` | `--atlas-textarea-placeholder` |
| `.textarea:hover:not(…)` | `border-color` | `--atlas-border-strong` | `--atlas-textarea-border-hover` |
| `.textarea:focus-visible`, `.unstyled .textarea:focus-visible` | `border-color` | `--atlas-primary` | `--atlas-textarea-border-focus` |
| `.textarea:disabled` | `background-color`, `color` | `--atlas-background-muted`, `--atlas-foreground-disabled` | `--atlas-textarea-background-disabled`, `-foreground-disabled` |
| `.textarea[aria-invalid="true"]`, `.unstyled .textarea[aria-invalid="true"]` | `border-color` | `--atlas-danger` | `--atlas-textarea-border-invalid` |
| `.sm` | `padding-block`, `padding-inline`, `font-size` | `--atlas-spacing-2`, `--atlas-spacing-3`, `--atlas-font-size-sm` | `--atlas-textarea-size-sm-padding-block`, `-padding-inline`, `-font-size` |
| `.md` | `padding-block`, `padding-inline` | `--atlas-spacing-3`, `--atlas-spacing-3` | `--atlas-textarea-size-md-padding-block`, `-padding-inline` |
| `.lg` | `padding-block`, `padding-inline` | `--atlas-spacing-3`, `--atlas-spacing-4` | `--atlas-textarea-size-lg-padding-block`, `-padding-inline` |
| `.filled .textarea` | `background-color`; `border-start-start-radius`, `border-start-end-radius` | `--atlas-background-muted`; `--atlas-radius-md` | `--atlas-textarea-filled-background`; `--atlas-textarea-radius` |
| `.filled .textarea:hover:not(…)` | `background-color` | `--atlas-background-subtle` | `--atlas-textarea-filled-background-hover` |
| `.filled .textarea:focus-visible` | `background-color`, `border-block-end-color` | `--atlas-background`, `--atlas-primary` | `--atlas-textarea-filled-background-focus`, `--atlas-textarea-border-focus` |
| `.filled .textarea[aria-invalid="true"]` | `border-block-end-color` | `--atlas-danger` | `--atlas-textarea-border-invalid` |
| `.filled .textarea:disabled` | `background-color` | `--atlas-background-muted` | `--atlas-textarea-background-disabled` |
| `.counter` | `color` | `--atlas-foreground-muted` | `--atlas-textarea-counter-foreground` |
| `.counterOver` | `color` | `--atlas-danger` | `--atlas-textarea-counter-foreground-over` |

Delete the whole rule `[data-theme="dark"] .filled .textarea:hover:not(:disabled):not([readonly]) { … color-mix … }` and its comment block. Left unchanged: `min-height` calcs, `radius-none` rules, the counter `inset-*` offsets, focus outline, transitions, `opacity-disabled`.

Verify with the Task 3 Step 4 order plus `npx eslint packages/ui-web/src/ --max-warnings=7`. Commit: `refactor(textarea): use component tokens; filled hover aliases background-hovered`.

- [ ] **Step 3: Checkbox** — `Checkbox/Checkbox.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.root` | `gap` | `--atlas-spacing-3` | `--atlas-checkbox-gap` |
| `.box` | `border-radius`, border colour, `background-color`, `color` | `--atlas-radius-sm`, `--atlas-border-strong`, `--atlas-background`, `--atlas-primary-foreground` | `--atlas-checkbox-radius`, `-border`, `-background`, `-foreground` |
| `.sm` / `.md` / `.lg` | `width`, `height` | `--atlas-spacing-4` / `-5` / `-6` | `--atlas-checkbox-size-<size>-box` |
| `.box[data-state="checked"], .box[data-state="indeterminate"]` | `background-color` | `--atlas-primary` | `--atlas-checkbox-checked-background` |
| `.box:hover…[data-state="unchecked"]`, `.box:active…[data-state="unchecked"]` | `background-color`, `border-color` | `--atlas-background-subtle`, `--atlas-foreground` | `--atlas-checkbox-background-hover`, `--atlas-checkbox-border-hover` |
| `.box:hover…` / `.box:active…` with `checked` / `indeterminate` | `background-color` | `--atlas-primary-hover` | `--atlas-checkbox-checked-background-hover` |
| `.box[data-disabled][data-state="unchecked"]` | `background-color`, `border-color` | `--atlas-background-muted`, `--atlas-border` | `--atlas-checkbox-background-disabled`, `-border-disabled` |
| `.box[data-invalid][data-state="unchecked"]` | `border-color` | `--atlas-danger` | `--atlas-checkbox-invalid-border` |
| `.box[data-invalid][data-state="unchecked"]:hover…` | `background-color` | `--atlas-background-subtle` | `--atlas-checkbox-background-hover` |
| `.box[data-invalid]` checked/indeterminate | `background-color`, `color` | `--atlas-danger`, `--atlas-danger-foreground` | `--atlas-checkbox-invalid-checked-background`, `-invalid-checked-foreground` |
| `.box[data-invalid]` checked/indeterminate `:hover…` | `background-color` | `var(--atlas-danger-hover, var(--atlas-danger))` | `var(--atlas-checkbox-invalid-checked-background-hover)` |
| `.label` | `color` | `--atlas-foreground` | `--atlas-checkbox-label-foreground` |
| `.root[data-disabled] .label` | `color` | `--atlas-foreground-disabled` | `--atlas-checkbox-label-foreground-disabled` |
| `.description` | `color` | `--atlas-foreground-muted` | `--atlas-checkbox-description-foreground` |
| `.root[data-disabled] .description` | `color` | `--atlas-foreground-disabled` | `--atlas-checkbox-description-foreground-disabled` |
| `.requiredMarker` | `color` | `--atlas-danger` | `--atlas-checkbox-required-foreground` |
| `.root[data-disabled] .requiredMarker` | `color` | `--atlas-foreground-disabled` | `--atlas-checkbox-required-foreground-disabled` |
| `.card` | border colour, `border-radius`, `background-color` | `--atlas-border-strong`, `--atlas-radius-md`, `--atlas-background` | `--atlas-checkbox-card-border`, `-card-radius`, `-card-background` |
| `.card[data-checked]` | `border-color` | `--atlas-primary` | `--atlas-checkbox-card-checked-border` |
| `.card[data-invalid]` | `border-color` | `--atlas-danger` | `--atlas-checkbox-card-invalid-border` |

Left unchanged: `.card[data-checked] { background-color: var(--atlas-primary-subtle) }` and the dark `color-mix` rule (approved, untokenised), `--_icon-size`, `.content` gap, `.card` padding, `.labelSm/.labelLg` font sizes, `margin-inline-start`, focus outline, transitions, `opacity-disabled`.

Verify as in Step 2. Commit: `refactor(checkbox): use component tokens`.

- [ ] **Step 4: Switch** — `Switch/Switch.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.root` | `gap` | `--atlas-spacing-3` | `--atlas-switch-gap` |
| `.track` | `background-color` | `--atlas-background-muted` | `--atlas-switch-track-background` |
| `.track[data-state="checked"]` | `background-color` | `--atlas-primary` | `--atlas-switch-checked-track-background` |
| `.track:hover…[data-state="unchecked"]` | `background-color` | `--atlas-background-subtle` | `--atlas-switch-track-background-hover` |
| `.track:hover…[data-state="checked"]` | `background-color` | `--atlas-primary-hover` | `--atlas-switch-checked-track-background-hover` |
| `.track:active…[data-state="unchecked"]` | `background-color` | `--atlas-background-subtle` | `--atlas-switch-track-background-active` |
| `.track:active…[data-state="checked"]` | `background-color` | `--atlas-primary-active` | `--atlas-switch-checked-track-background-active` |
| `.sm` / `.md` / `.lg` | `height` | `--atlas-spacing-4` / `-5` / `-6` | `--atlas-switch-size-<size>-height` |
| `.sm .thumb` / `.md .thumb` / `.lg .thumb` | `width`, `height` | `--atlas-spacing-3` / `-4` / `-5` | `--atlas-switch-size-<size>-thumb` |
| `.thumb` | `background-color` | `--atlas-foreground-on-brand` | `--atlas-switch-thumb-background` |
| `.label` | `color` | `--atlas-foreground` | `--atlas-switch-label-foreground` |
| `.description` | `color` | `--atlas-foreground-muted` | `--atlas-switch-description-foreground` |

Delete both dark rules `[data-theme="dark"] .track:hover:not([data-disabled])[data-state="unchecked"] { … }` and `[data-theme="dark"] .track:active:not([data-disabled])[data-state="unchecked"] { … }` together with the comment blocks that explain the `color-mix` override. Left unchanged: track `width` calcs, `border-radius: var(--atlas-radius-full)` on track and thumb, thumb `inset-*` offsets, `translateX` travel (LTR and RTL), `.content` gap, label/description font sizes.

Verify as in Step 2. Commit: `refactor(switch): use component tokens; off-track hover and active alias background-hovered`.

- [ ] **Step 5: RadioGroup** — `RadioGroup/RadioGroup.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.root` | `gap` | `--atlas-spacing-3` | `--atlas-radio-gap` |
| `.input` | border colour, `border-radius`, `background-color`, `color` | `--atlas-border-strong`, `--atlas-radius-full`, `--atlas-background`, `--atlas-primary-foreground` | `--atlas-radio-border`, `-radius`, `-background`, `-foreground` |
| `.input::before` | `inline-size`, `block-size` | `--atlas-spacing-2` | `--atlas-radio-dot` |
| `.root[data-size="sm"] .input` / `md` | `inline-size`, `block-size` | `--atlas-spacing-4` / `-5` | `--atlas-radio-size-<size>-control` |
| `.input:checked` | `background-color`, `border-color` | `--atlas-primary` | `--atlas-radio-checked-background`, `--atlas-radio-checked-border` |
| `.root:hover .input:not(:disabled):not(:checked)` | `background-color`, `border-color` | `--atlas-background-subtle`, `--atlas-foreground` | `--atlas-radio-background-hover`, `--atlas-radio-border-hover` |
| `.root:hover .input:not(:disabled):checked` | `background-color`, `border-color` | `--atlas-primary-hover` | `--atlas-radio-checked-background-hover`, `--atlas-radio-checked-border-hover` |
| `.input[aria-invalid="true"]`, `.root:hover .input[aria-invalid="true"]:not(:disabled):not(:checked)` | `border-color` | `--atlas-danger` | `--atlas-radio-invalid-border` |
| `.input[aria-invalid="true"]:checked` | `background-color`, `border-color`, `color` | `--atlas-danger`, `--atlas-danger`, `--atlas-danger-foreground` | `--atlas-radio-invalid-checked-background`, `-invalid-checked-border`, `-invalid-checked-foreground` |
| `.root:hover .input[aria-invalid="true"]:not(:disabled):checked` | `background-color`, `border-color` | `--atlas-danger-hover` | `--atlas-radio-invalid-checked-background-hover`, `-invalid-checked-border-hover` |
| `.input:disabled:not(:checked)` | `background-color`, `border-color` | `--atlas-background-muted`, `--atlas-border` | `--atlas-radio-background-disabled`, `--atlas-radio-border-disabled` |
| `.label` | `color` | `--atlas-foreground` | `--atlas-radio-label-foreground` |
| `.description` | `color` | `--atlas-foreground-muted` | `--atlas-radio-description-foreground` |
| `.root[data-variant="card"]` | border colour, `border-radius`, `background-color` | `--atlas-border-strong`, `--atlas-radius-md`, `--atlas-surface` | `--atlas-radio-card-border`, `-card-radius`, `-card-background` |
| `.root[data-variant="card"][data-checked]` | `border-color` | `--atlas-primary` | `--atlas-radio-card-checked-border` |
| `.root[data-variant="card"][data-invalid]` | `border-color` | `--atlas-danger` | `--atlas-radio-card-invalid-border` |

Left unchanged: `.group` gaps, `.input` `margin-block`, `.content` gap, card padding, the card-checked `primary-subtle` background and its dark `color-mix` rule (approved, untokenised), label/description font sizes.

Verify as in Step 2. Commit: `refactor(radio): use component tokens`.

- [ ] **Step 6: Select** — `Select/Select.module.css`

| Rule | Property | Old | New |
|---|---|---|---|
| `.trigger` | `color`, `background-color`, border colour, `border-radius` | `--atlas-foreground`, `--atlas-background`, `--atlas-border`, `--atlas-radius-md` | `--atlas-select-foreground`, `-background`, `-border`, `-radius` |
| `.trigger:hover:not(…)` | `border-color` | `--atlas-border-strong` | `--atlas-select-border-hover` |
| `.trigger:focus-visible` | `border-color` | `--atlas-primary` | `--atlas-select-border-focus` |
| `.trigger:disabled` | `background-color`, `color` | `--atlas-background-muted`, `--atlas-foreground-disabled` | `--atlas-select-background-disabled`, `-foreground-disabled` |
| `.trigger[aria-invalid="true"]`, `.trigger[aria-invalid="true"]:focus-visible` | `border-color` | `--atlas-danger` | `--atlas-select-border-invalid` |
| `.sm` / `.md` | `height`, `padding-inline-start`, `padding-inline-end`, `font-size`, `gap` | `--atlas-spacing-8`/`-10`, `-3`, `-2`, `--atlas-font-size-sm`/`-base`, `--atlas-spacing-1` | `--atlas-select-size-<size>-height`, `-padding-inline-start`, `-padding-inline-end`, `-font-size`, `-gap` |
| `.placeholder` | `color` | `--atlas-foreground-muted` | `--atlas-select-placeholder-foreground` |
| `.chevron` | `color` | `--atlas-foreground-muted` | `--atlas-select-chevron-foreground` |
| `.content` | `background-color`, `color`, border colour, `border-radius` | `--atlas-surface-overlay`, `--atlas-foreground`, `--atlas-border`, `--atlas-radius-md` | `--atlas-select-content-background`, `-content-foreground`, `-content-border`, `-content-radius` |
| `.item` | `color` | `--atlas-foreground` | `--atlas-select-item-foreground` |
| `.item:focus:not([data-disabled])` | `background-color` | `--atlas-background-accent` | `--atlas-select-item-background-focus` |
| `.indicator` | `color` | `--atlas-primary` | `--atlas-select-item-indicator-foreground` |
| `.label` | `color` | `--atlas-foreground-muted` | `--atlas-select-label-foreground` |

Left unchanged: `.content` `max-block-size`, padding and margins, `.item` padding and `radius-sm`, `.label` padding and font size, `.separator`, focus outline, transitions, `opacity-disabled`.

Verify as in Step 2. Commit: `refactor(select): use component tokens`.

- [ ] **Step 7: Run the guard tests**

Run: `node --test scripts/tests/component-tokens.test.mjs`
Expected: all pass, including the three guard tests from Step 1.

---

### Task 5: Snapshot, decision record, full verification, PR

**Files:**
- Modify: `atlas/state/decisions.json` (append DEC-055)
- Regenerated: `atlas/**` via `atlas:sync`

- [ ] **Step 1: Record DEC-055** — append to the `decisions` array, matching the field names of DEC-054 (`id`, `topic`, `decision`, `date`):

```json
{
  "id": "DEC-055",
  "topic": "Component tokens for Textarea, Checkbox, Switch, RadioGroup and Select",
  "decision": "Extends the aliased component-token layer (owner, 2026-10-09; spec docs/superpowers/specs/2026-10-09-component-tokens-form-controls-design.md). 125 tokens: Textarea 22, Checkbox 29, Switch 16, Radio 29, Select 29, same naming as DEC-053 and aliases only. Retires three dark-mode color-mix overrides by aliasing --atlas-background-hovered in both themes: Textarea filled hover, Switch off-track hover and active (light pixels unchanged because background-hovered equals background-subtle there; dark pixels change in those three states). The Checkbox and Radio card-checked background keeps its raw --atlas-primary-subtle value and dark color-mix rule, with no component token, until a semantic token is approved. Not tokenised: Textarea min-height and Switch track width (calc), thumb travel, focus ring, motion, opacity-disabled. Figma: Atlas/Component extended and the five component sets rebound where exactly one token matched; resolved Light and Dark values verified identical before and after. Native untouched.",
  "date": "2026-10-09"
}
```

- [ ] **Step 2: Re-sync the snapshot**

```bash
node scripts/atlas-sync.mjs
node scripts/atlas-sync.mjs --check | grep -E "would write|written"
git diff --stat atlas | tail -3
```
Expected: the second command prints `would write 0`; the diff touches `atlas/tokens.md`, `atlas/metadata/{Textarea,Checkbox,Switch,RadioGroup,Select}.json` and stamped files only.

- [ ] **Step 3: Full verification in order**

```bash
node scripts/convert-tokens.mjs && git diff --exit-code packages/ui-native/tokens/atlas.tokens.ts   # 1 token build
node packages/governance/token-lint.mjs                                                               # 2 token-lint
npx tsc --noEmit                                                                                      # 3 typecheck
npx vitest run                                                                                        # 4 vitest
npx eslint packages/ui-web/src/ --max-warnings=7                                                      # 5 ESLint
node --test scripts/tests/*.test.mjs                                                                  # script tests
npm run atlas:verify -- --base main --allow-new-token                                                 # 6 atlas:verify
npm run test:visual && git status --short tests/visual                                                # 7 visual regression
```
Expected: every step exits 0; `git status` shows nothing under `tests/visual`. The sandbox screenshots do not capture hover states, so the three dark-mode retirements are proven by the Task 4 guard tests and by Task 3's value assertions, not by pixels. If the visual run reports a diff in Textarea, Switch, Checkbox, Radio or Select, stop: that is an unintended change.

- [ ] **Step 4: Commit, push, open the PR**

```bash
git add atlas
git commit -m "docs(atlas): resync snapshot and record DEC-055 (form-control component tokens)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --base main --title "feat(tokens): component tokens for Textarea, Checkbox, Switch, Radio and Select" \
  --label atlas-approved-new \
  --body "125 aliased component tokens (spec docs/superpowers/specs/2026-10-09-component-tokens-form-controls-design.md, plan docs/superpowers/plans/2026-10-09-component-tokens-form-controls.md). Light mode: no pixel change. Dark mode: Textarea filled hover and Switch off-track hover/active now use background-hovered (approved, DEC-055). Card-checked color-mix stays untokenised. Native untouched. The atlas-approved-new label is intentional: these are new token names approved by the owner.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```
Expected: PR created; `Atlas Verify`, `Lint` and `Visual Regression` pass. Per the owner's rule, do not push CI fixes without asking if Auto-fix is off. The owner reviews and merges (gate 4).

---

## Self-review

- **Spec coverage:** five components and 125 tokens (Reference block, Task 3 counts); aliases-only (Global Constraints, lint in Task 3 Step 4); approved `color-mix` retirements (Task 3 value test, Task 4 Steps 2 and 4, Task 4 guard); card-checked left untokenised (Reference block omits both tokens, Task 3 test, Task 4 Steps 3 and 5); prefixes in lint (Task 1); Figma first with before/after diff (Task 2); four gates and owner stop (Task 2 Step 7, Task 5 Step 4); `atlas-approved-new` label (Task 5); native out of scope (Task 3 Step 4, Task 5 Step 3).
- **Deviations from the spec, with reasons:** (1) The spec listed per-component totals as approximate and omitted `select-item-foreground`, `select-content-radius`, `checkbox-required-foreground-disabled` and `radio-radius`; the exact list is in the Reference block and the final counts replace the spec's. (2) The spec's Switch active row said `background-subtle`; the approved decision makes it `background-hovered`, and the spec table was updated. (3) Zero-pixel visual regression cannot cover dark hover states (the sandbox screenshots are static), so the guard tests carry that proof.
- **Placeholder scan:** the only intentional edits per run are `SET_ID` and pasting the Reference block as `BLOCK`; both are named in the step text.
- **Name consistency:** token names in the Reference block, the Task 3 count test and the Task 4 tables are the same strings; `COMPONENTS`, `parseComponentTokens`, `lintComponentTokens` and `renderComponentSection` are used as defined in the existing lib.
- **Open risk:** the Task 2 rebinding filter is heuristic. It rebinds only on a unique match and reports the rest, and Step 6's before/after diff of resolved Light and Dark values is the safety net. Component set names in Figma (for example `RadioGroup` versus `Radio`) are confirmed in Step 1.
