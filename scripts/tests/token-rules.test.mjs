// token-rules: the four Phase 2d rules token-lint applies (private vars, raw lengths, breakpoints,
// reduced motion). One PASS case, then the FAIL cases each rule exists for.
import { test } from "node:test"
import assert from "node:assert/strict"
import { privateVarViolations, rawLengths, breakpointViolations, reducedMotionMissing, semanticRadiusViolations, semanticSpacingViolations, semanticTypeViolations, semanticMotionViolations } from "../lib/token-rules.mjs"

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

test("semantic spacing: a role passes; an unlisted primitive in a spacing property fails", () => {
  assert.deepEqual(semanticSpacingViolations([{ file: F, src: ".x { gap: var(--atlas-spacing-control-gap); }" }], []), { violations: [], inspected: 1 })
  const { violations } = semanticSpacingViolations([{ file: F, src: ".x {\n  padding-inline: var(--atlas-spacing-2);\n}" }], [])
  assert.equal(violations[0].line, 2)
  assert.match(violations[0].text, /--atlas-spacing-2.*role/)
})

test("semantic spacing: dimension properties are out of scope", () => {
  const src = ".x { width: var(--atlas-spacing-6); block-size: var(--atlas-spacing-10); transform: translateX(var(--atlas-spacing-1)); }"
  assert.deepEqual(semanticSpacingViolations([{ file: F, src }], []), { violations: [], inspected: 0 })
})

test("semantic spacing: spacing-named custom properties and multi-line values are read", () => {
  const src = ".x { --_pad: var(--atlas-spacing-6); }\n.y {\n  padding:\n    var(--atlas-spacing-4)\n    var(--atlas-spacing-2);\n}"
  const { violations, inspected } = semanticSpacingViolations([{ file: F, src }], [])
  assert.equal(inspected, 3)
  assert.deepEqual(violations.map((v) => v.line), [1, 4, 5])
})

test("semantic spacing: the allowlist matches an exact count per file and token; a changed count or stale entry fails", () => {
  const allow = [{ family: "spacing", file: F, token: "--atlas-spacing-3", count: 2, reason: "control padding" }]
  const two = ".a { padding-inline: var(--atlas-spacing-3); } .b { padding-inline: var(--atlas-spacing-3); }"
  assert.deepEqual(semanticSpacingViolations([{ file: F, src: two }], allow).violations, [])
  const three = two + " .c { margin: var(--atlas-spacing-3); }"
  assert.match(semanticSpacingViolations([{ file: F, src: three }], allow).violations[0].text, /3 uses, allowlist says 2/)
  assert.match(semanticSpacingViolations([{ file: F, src: ".a {}" }], allow).violations[0].text, /stale allowlist entry/)
})

test("semantic spacing: a radius allowlist entry is not read as a spacing entry", () => {
  const allow = [{ family: "radius", file: F, token: "--atlas-radius-none", count: 1, reason: "x" }]
  assert.deepEqual(semanticSpacingViolations([{ file: F, src: ".a {}" }], allow).violations, [])
})

test("semantic type: a role or a component token passes; a primitive scale step fails", () => {
  const ok = ".a { font-size: var(--atlas-type-label-size); } .b { font-size: var(--atlas-button-size-md-font-size); } .c { font-size: 1em; }"
  assert.deepEqual(semanticTypeViolations([{ file: F, src: ok }], []).violations, [])
  const { violations } = semanticTypeViolations([{ file: F, src: ".x {\n  font-size: var(--atlas-font-size-sm);\n}" }], [])
  assert.equal(violations[0].line, 2)
  assert.match(violations[0].text, /--atlas-font-size-sm.*type role/)
})

test("semantic type: only font-size is read", () => {
  assert.deepEqual(semanticTypeViolations([{ file: F, src: ".x { --_h: var(--atlas-text-h3); line-height: var(--atlas-line-height-tight); }" }], []), { violations: [], inspected: 0 })
})

test("semantic type: exact count per file and token; a changed count or stale entry fails", () => {
  const allow = [{ family: "type", file: F, token: "--atlas-text-caption", count: 1, reason: "badge size variant" }]
  const one = ".sm { font-size: var(--atlas-text-caption); }"
  assert.deepEqual(semanticTypeViolations([{ file: F, src: one }], allow).violations, [])
  assert.match(semanticTypeViolations([{ file: F, src: one + one }], allow).violations[0].text, /2 uses, allowlist says 1/)
  assert.match(semanticTypeViolations([{ file: F, src: ".a {}" }], allow).violations[0].text, /stale allowlist entry/)
})

test("semantic type: a spacing allowlist entry is not read as a type entry", () => {
  const allow = [{ family: "spacing", file: F, token: "--atlas-spacing-2", count: 1, reason: "x" }]
  assert.deepEqual(semanticTypeViolations([{ file: F, src: ".a {}" }], allow).violations, [])
})

test("reduced motion: a file animating only with motion roles still needs a reduced-motion block", () => {
  assert.equal(reducedMotionMissing(".a { transition: color var(--atlas-motion-state-duration) var(--atlas-motion-state-easing); }"), true)
  assert.equal(reducedMotionMissing(".a { transition: color var(--atlas-motion-state-duration); } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }"), false)
})

test("semantic motion: a role passes; a primitive duration or easing fails", () => {
  const ok = ".a { transition: color var(--atlas-motion-state-duration) var(--atlas-motion-state-easing); }"
  assert.deepEqual(semanticMotionViolations([{ file: F, src: ok }], []).violations, [])
  const { violations } = semanticMotionViolations([{ file: F, src: ".a {\n  animation: x var(--atlas-duration-base) var(--atlas-easing-exit);\n}" }], [])
  assert.deepEqual(violations.map((v) => v.line), [2, 2])
  assert.match(violations[0].text, /motion role/)
})

test("semantic motion: an instant duration inside a reduced-motion block is legal", () => {
  const src = "@media (prefers-reduced-motion: reduce) { .a { transition-duration: var(--atlas-duration-instant); } }"
  assert.deepEqual(semanticMotionViolations([{ file: F, src }], []).violations, [])
})

test("semantic motion: exact count per file and token; a stale entry fails", () => {
  const allow = [{ family: "motion", file: F, token: "--atlas-duration-spin", count: 1, reason: "spinner loop" }]
  const one = ".s { animation: spin var(--atlas-duration-spin) linear infinite; }"
  assert.deepEqual(semanticMotionViolations([{ file: F, src: one }], allow).violations, [])
  assert.match(semanticMotionViolations([{ file: F, src: ".a {}" }], allow).violations[0].text, /stale allowlist entry/)
})
