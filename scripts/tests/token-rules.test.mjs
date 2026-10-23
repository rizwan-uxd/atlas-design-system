// token-rules: the four Phase 2d rules token-lint applies (private vars, raw lengths, breakpoints,
// reduced motion). One PASS case, then the FAIL cases each rule exists for.
import { test } from "node:test"
import assert from "node:assert/strict"
import { privateVarViolations, rawLengths, breakpointViolations, reducedMotionMissing, semanticRadiusViolations } from "../lib/token-rules.mjs"

const F = "c/X.module.css"

test("private vars: one semantic alias passes; raw, calc and primitive values fail", () => {
  const ok = privateVarViolations([{ file: F, src: ".x { --_pad: var(--atlas-spacing-4); --_a: var(--atlas-info); }" }], [])
  assert.deepEqual(ok, { violations: [], inspected: 2 })
  const src = ".x {\n  --_pad: 16px;\n  --_h: calc(var(--atlas-spacing-8) * 2);\n  --_c: var(--atlas-color-blue-500);\n}"
  const { violations, inspected } = privateVarViolations([{ file: F, src }], [])
  assert.equal(inspected, 3)
  assert.deepEqual(violations.map((v) => v.line), [2, 3, 4])
  assert.match(violations[2].text, /primitive/)
})

test("private vars: an allowlisted value passes, a changed value fails again, a stale entry fails", () => {
  const allow = [{ file: F, var: "--_h", value: "calc(var(--atlas-spacing-8) * 2)", reason: "two rows" }]
  assert.deepEqual(privateVarViolations([{ file: F, src: ".x { --_h: calc(var(--atlas-spacing-8) * 2); }" }], allow).violations, [])
  const changed = privateVarViolations([{ file: F, src: ".x { --_h: calc(var(--atlas-spacing-8) * 3); }" }], allow).violations
  assert.equal(changed.length, 2) // the new value, and the entry it no longer matches
  assert.match(changed[1].text, /stale allowlist entry/)
})

test("private vars: a declaration inside a comment is not read", () => {
  assert.equal(privateVarViolations([{ file: F, src: "/* --_pad: 16px; */ .x {}" }], []).inspected, 0)
})

test("raw lengths: tokens pass; px, rem and unitless lengths fail", () => {
  assert.deepEqual(rawLengths(".x { padding: var(--atlas-spacing-4); width: 100%; }"), [])
  const hits = rawLengths(".x {\n  max-height: 200px;\n  margin-inline-start: 1px;\n  gap: 0.5rem;\n}")
  assert.deepEqual(hits.map((h) => [h.line, h.value]), [[2, "200px"], [3, "1px"], [4, "0.5rem"]])
})

test("raw lengths: @media preludes, em units and the visually-hidden idiom are not lengths", () => {
  const src = [
    "@media (max-width: 639px) { .x { padding: var(--atlas-spacing-2); } }",
    ".icon { width: 1em; height: 1em; }",
    ".sr { position: absolute; margin: -1px; clip-path: inset(50%); }",
  ].join("\n")
  assert.deepEqual(rawLengths(src), [])
  // -1px without a clip in the same rule is a real length
  assert.equal(rawLengths(".x { margin: -1px; }").length, 1)
})

const TOKENS = ":root { --atlas-breakpoint-sm: 640px; --atlas-breakpoint-md: 768px; }\n@theme inline { --breakpoint-sm: 640px; --breakpoint-md: 768px; }"

test("breakpoints: matching sources and min / max-1 media widths pass", () => {
  const files = [{ file: F, src: "@media (min-width: 768px) {}\n@media (max-width: 639px) {}" }]
  assert.deepEqual(breakpointViolations(TOKENS, files), { violations: [], inspected: 2 })
})

test("breakpoints: a theme mismatch, an off-scale min-width and a max-width on the breakpoint fail", () => {
  const tokens = TOKENS.replace("--breakpoint-md: 768px", "--breakpoint-md: 760px")
  const files = [{ file: F, src: "@media (min-width: 700px) {}\n@media (max-width: 640px) {}\n@media (min-width: 40em) {}" }]
  const { violations } = breakpointViolations(tokens, files)
  assert.equal(violations.length, 4)
  assert.match(violations[0].text, /--breakpoint-md: 760px differs/)
  assert.deepEqual(violations.slice(1).map((v) => v.line), [1, 2, 3])
})

test("breakpoints: no --atlas-breakpoint-* tokens fails closed", () => {
  assert.match(breakpointViolations(":root {}", []).violations[0].text, /no --atlas-breakpoint-\* tokens/)
})

test("reduced motion: a duration with a reduced-motion block passes; without one it fails", () => {
  const anim = ".x { transition: opacity var(--atlas-duration-fast); }"
  assert.equal(reducedMotionMissing(anim), true)
  assert.equal(reducedMotionMissing(`${anim}\n@media (prefers-reduced-motion: reduce) { .x { transition: none; } }`), false)
  assert.equal(reducedMotionMissing(".x { color: var(--atlas-foreground); }"), false)
  assert.equal(reducedMotionMissing("/* var(--atlas-duration-fast) */ .x {}"), false)
})

test("semantic radius: a role passes; an unlisted primitive fails", () => {
  assert.deepEqual(semanticRadiusViolations([{ file: F, src: ".x { border-radius: var(--atlas-radius-control); }" }], []), { violations: [], inspected: 1 })
  const { violations } = semanticRadiusViolations([{ file: F, src: ".x {\n  border-radius: var(--atlas-radius-md);\n}" }], [])
  assert.equal(violations[0].line, 2)
  assert.match(violations[0].text, /--atlas-radius-md.*role/)
})

test("semantic radius: the allowlist matches an exact count per file and token; a changed count or stale entry fails", () => {
  const allow = [{ family: "radius", file: F, token: "--atlas-radius-none", count: 2, reason: "joined edges" }]
  const two = ".a { border-radius: var(--atlas-radius-none); } .b { border-radius: var(--atlas-radius-none); }"
  assert.deepEqual(semanticRadiusViolations([{ file: F, src: two }], allow).violations, [])
  const three = two + " .c { border-radius: var(--atlas-radius-none); }"
  assert.match(semanticRadiusViolations([{ file: F, src: three }], allow).violations[0].text, /3 uses, allowlist says 2/)
  assert.match(semanticRadiusViolations([{ file: F, src: ".a {}" }], allow).violations[0].text, /stale allowlist entry/)
})

test("semantic radius: a use inside a comment is not read", () => {
  assert.equal(semanticRadiusViolations([{ file: F, src: "/* var(--atlas-radius-md) */ .x {}" }], []).inspected, 0)
})
