// Alert text and control pairs, measured from the committed tokens with the repo's own colour functions.
// The canonical code.contrast check only measures text on background, surface and surface-raised, so Alert's
// text on its variant fills was never covered (Alert gate 3). Title, description and the dismiss glyph are all
// foreground (Figma), so each must read 4.5:1 (text) or 3:1 (the glyph, blended at its resting opacity).
import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { contrastRatio, oklchToSrgb } from "../lib/contrast.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const css = fs.readFileSync(path.join(ROOT, "packages/tokens/atlas.tokens.css"), "utf8")
const lines = css.split("\n")
const prim = {}
for (const m of css.matchAll(/--atlas-color-([a-z]+-\d+): oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) prim[m[1]] = oklchToSrgb(+m[2], +m[3], +m[4])
const opacityHover = Number(css.match(/--atlas-opacity-hover:\s*([\d.]+)/)[1])
const darkStart = lines.findIndex((l) => /^\[data-theme="dark"\]/.test(l))
const alias = (name, from, to) => {
  for (let i = from; i < to; i++) { const m = lines[i].match(new RegExp(`^\\s*--atlas-${name}:\\s*var\\(--atlas-color-([a-z]+-\\d+)\\)`)); if (m) return m[1] }
  throw new Error(`--atlas-${name} not found in its theme block`)
}
const blend = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a))

for (const [mode, from, to] of [["light", 300, darkStart], ["dark", darkStart, darkStart + 70]]) {
  const fg = prim[alias("foreground", from, to)]
  const fills = { info: "info-subtle", success: "success-subtle", warning: "warning-subtle", danger: "danger-subtle", neutral: "background-muted" }
  for (const [variant, token] of Object.entries(fills)) {
    const bg = prim[alias(token, from, to)]
    test(`Alert ${mode} ${variant}: foreground text on its fill reads at least 4.5:1`, () => {
      assert.ok(contrastRatio(fg, bg) >= 4.5, `${contrastRatio(fg, bg).toFixed(2)}:1`)
    })
    test(`Alert ${mode} ${variant}: the dismiss glyph at resting opacity reads at least 3:1`, () => {
      const glyph = blend(fg, bg, opacityHover)
      assert.ok(contrastRatio(glyph, bg) >= 3, `${contrastRatio(glyph, bg).toFixed(2)}:1`)
    })
  }
}
