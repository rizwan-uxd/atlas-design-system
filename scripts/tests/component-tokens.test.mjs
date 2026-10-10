import { test } from "node:test"
import assert from "node:assert/strict"
import {
  BEGIN, END, CARD_EXCEPTION, extractComponentBlock, parseComponentTokens, lintComponentTokens, renderComponentSection,
} from "../lib/component-tokens.mjs"

const wrap = (decls, selector = ':root,\n[data-theme="dark"],\n.dark') =>
  `:root { --atlas-primary: x; --atlas-spacing-10: x; --atlas-foreground: x; --atlas-background: x; --atlas-background-muted: x; --atlas-border-strong: x; --atlas-radius-lg: x; --atlas-radius-md: x; --atlas-danger: x; --atlas-border: x; }\n${BEGIN}\n${selector} {\n${decls}\n}\n${END}\n`

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
  assert.deepEqual(t.map((x) => x.line), [6, 7])
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
  assert.match(v.join("\n"), /name must be/)
})

test("a declaration without a trailing semicolon is still linted", () => {
  const bad = lintComponentTokens(wrap(OK + "\n  --atlas-card-background: var(--atlas-color-brand-500)"))
  assert.match(bad.join("\n"), /primitive/)
  const good = lintComponentTokens(wrap(OK + "\n  --atlas-card-background: var(--atlas-primary)"))
  assert.deepEqual(good, [])
})

test("commented-out declarations are ignored", () => {
  const css = wrap("  /* --atlas-button-primary-background: 12px; */\n" + OK)
  assert.deepEqual(lintComponentTokens(css), [])
  assert.deepEqual(parseComponentTokens(css).map((x) => x.name), [
    "--atlas-button-primary-background",
    "--atlas-button-size-md-height",
  ])
})

test("a component token inside a comment outside the block is not flagged", () => {
  const css = wrap(OK) + "/* --atlas-card-radius: 12px; */\n"
  assert.deepEqual(lintComponentTokens(css), [])
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

test("an alias to an undefined token is rejected", () => {
  const v = lintComponentTokens(wrap("  --atlas-button-primary-background: var(--atlas-primry);"))
  assert.match(v.join("\n"), /undefined token/)
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
