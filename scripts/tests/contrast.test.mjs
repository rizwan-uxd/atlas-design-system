// contrast — the pure logic behind atlas-verify's code.contrast (Phase 4). WCAG reference ratios
// (#767676 on #fff = 4.54, #808080 on #fff = 3.95) anchor the maths independently of the oklch
// conversion, which is anchored separately (oklch(0 0 0) is #000, oklch(1 0 0) is #fff).
import { test } from "node:test"
import assert from "node:assert/strict"
import { contrastCheck, contrastRatio, oklchToSrgb, parseTokens, resolveColor, derivePairs, AA_NORMAL } from "../lib/contrast.mjs"

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol})`)

test("known WCAG ratios from hex anchors the maths", () => {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  near(contrastRatio(rgb("#000000"), rgb("#ffffff")), 21)
  near(contrastRatio(rgb("#767676"), rgb("#ffffff")), 4.54)
  near(contrastRatio(rgb("#808080"), rgb("#ffffff")), 3.95)
})

test("oklch extremes convert to black and white", () => {
  near(oklchToSrgb(0, 0, 0)[0], 0)
  near(oklchToSrgb(1, 0, 0)[0], 1)
  // a mid oklch grey converts to the grey WCAG uses as the AA boundary: oklch(0.5657 0 0) ≈ #767676
  const grey = oklchToSrgb(0.5657, 0, 0)
  near(contrastRatio(grey, [1, 1, 1]), 4.54, 0.05)
})

test("parseTokens: root, dark overrides, the shared block joins both themes; @media and @theme inline are skipped", () => {
  const tokens = parseTokens(`
    :root { --atlas-a: #000000; --atlas-b: #ffffff; --atlas-c: #767676; }
    [data-theme="dark"], .dark { --atlas-a: #ffffff; --atlas-b: #000000; }
    :root, [data-theme="dark"], .dark { --atlas-shared: var(--atlas-b); }
    @media (min-width: 768px) { :root { --atlas-a: #808080; } }
    @theme inline { --color-x: var(--atlas-a); --atlas-ghost: #ff0000; }
  `)
  assert.equal(tokens.light.get("--atlas-a"), "#000000") // the @media override must not leak in
  assert.equal(tokens.dark.get("--atlas-a"), "#ffffff")
  assert.equal(tokens.light.get("--atlas-shared"), "var(--atlas-b)")
  assert.equal(tokens.dark.get("--atlas-shared"), "var(--atlas-b)")
  assert.equal(tokens.light.has("--atlas-ghost"), false) // @theme inline mirrors nothing
  const resolved = resolveColor("--atlas-shared", tokens.dark)
  assert.deepEqual(resolved.color.map((v) => Math.round(v)), [0, 0, 0]) // resolves through the dark map
})

const FIXTURE = `
  :root {
    --atlas-foreground: #000000;
    --atlas-foreground-muted: #767676;
    --atlas-foreground-subtle: #767676;
    --atlas-background: #ffffff;
    --atlas-surface: #ffffff;
    --atlas-surface-raised: #ffffff;
    --atlas-primary: #000000;
    --atlas-primary-foreground: #ffffff;
    --atlas-info: #808080;
    --atlas-info-foreground: #ffffff;
    --atlas-checkbox-background: #ffffff;
    --atlas-checkbox-checked-background: #000000;
    --atlas-checkbox-foreground: #ffffff;
  }
  [data-theme="dark"], .dark {
    --atlas-foreground: #ffffff;
    --atlas-background: #000000;
    --atlas-surface: #000000;
    --atlas-surface-raised: #000000;
  }
`

test("derivePairs: scale, component (checked-fill preference) and surface pairs; no others", () => {
  const tokens = parseTokens(FIXTURE)
  const pairs = derivePairs(tokens)
  const has = (fg, bg) => pairs.some((p) => p.fg === fg && p.bg === bg)
  assert.ok(has("--atlas-primary-foreground", "--atlas-primary"), "scale pair")
  assert.ok(has("--atlas-checkbox-foreground", "--atlas-checkbox-checked-background"), "glyph pairs with the CHECKED fill, never the unchecked box")
  assert.ok(!has("--atlas-checkbox-foreground", "--atlas-checkbox-background"), "unchecked box must not be paired")
  assert.ok(has("--atlas-foreground-muted", "--atlas-surface"), "surface pair")
  assert.equal(pairs.filter((p) => p.source === "surface").length, 9)
})

test("contrastCheck: #808080 on white fails AA (3.95), an allowance covers exactly the measured finding", () => {
  const r = contrastCheck(FIXTURE, [])
  assert.ok(!r.violations.some((v) => v.fg === "--atlas-primary-foreground"))
  const info = r.violations.filter((v) => v.fg === "--atlas-info-foreground")
  assert.equal(info.length, 2) // light and dark both measure against #808080
  near(info[0].ratio, 3.95, 0.01)

  const allowed = contrastCheck(FIXTURE, [
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "light", ratio: 3.95, reason: "t" },
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "dark", ratio: 3.95, reason: "t" },
  ])
  assert.equal(allowed.violations.length, 0)
  assert.equal(allowed.allowed.length, 2)
})

test("an allowance does not mask a pair that got worse, and one that recovered is stale", () => {
  const worse = contrastCheck(FIXTURE, [
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "light", ratio: 4.4, reason: "t" }, // allowed at 4.4, measures 3.95
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "dark", ratio: 3.95, reason: "t" },
  ])
  assert.equal(worse.violations.length, 1)
  assert.equal(worse.violations[0].worseThanAllowed, 4.4)

  const fixed = FIXTURE.replace("--atlas-info: #808080", "--atlas-info: #000000")
  const stale = contrastCheck(fixed, [
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "light", ratio: 3.95, reason: "t" },
    { fg: "--atlas-info-foreground", bg: "--atlas-info", theme: "dark", ratio: 3.95, reason: "t" },
  ])
  assert.equal(stale.violations.length, 0)
  assert.equal(stale.stale.length, 2)
  assert.match(stale.stale[0].why, /stale/)

  const renamed = contrastCheck(FIXTURE, [{ fg: "--atlas-nonexistent-foreground", bg: "--atlas-x", theme: "light", ratio: 3, reason: "t" }])
  assert.equal(renamed.stale.length, 1)
  assert.match(renamed.stale[0].why, /no such pair/)
})

test("an alpha colour the check cannot composite fails closed, never passes silently", () => {
  const alpha = FIXTURE.replace("--atlas-info: #808080", "--atlas-info: rgba(128, 128, 128, 0.5)")
  const r = contrastCheck(alpha, [])
  assert.equal(r.unresolved.length, 2) // both themes
  assert.match(r.unresolved[0].unresolvable, /not an opaque colour/)
})

test("AA threshold is WCAG normal text", () => assert.equal(AA_NORMAL, 4.5))
