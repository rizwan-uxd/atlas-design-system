// M5.6 (Kind B): the warm brand overrides exactly six colours per theme, on the agreed primitives,
// and every brand-sensitive alias re-resolves under [data-brand] (DEC-091).
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(__dirname, "../../tokens/atlas.tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
const block = (selectorStart: string) => {
  const at = css.indexOf(selectorStart)
  expect(at, `no block starting ${selectorStart}`).toBeGreaterThan(-1)
  const body = css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at))
  return Object.fromEntries([...body.matchAll(/(--atlas-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}
const c = (step: string) => `var(--atlas-color-${step})`
const LIGHT = { primary: "coral-600", "primary-hover": "coral-700", "primary-active": "coral-800", "primary-subtle": "coral-50", "focus-ring": "coral-500", "primary-foreground": "neutral-0" }
const DARK = { primary: "coral-400", "primary-hover": "coral-300", "primary-active": "coral-200", "primary-subtle": "coral-900", "focus-ring": "coral-300", "primary-foreground": "neutral-950" }
const expected = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [`--atlas-${k}`, c(v)]))

describe("warm brand", () => {
  it("light overrides exactly the six brand colours", () => {
    expect(block('[data-brand="warm"] {')).toEqual(expected(LIGHT))
  })
  it("dark overrides exactly the six brand colours, on every brand/theme nesting", () => {
    const sel = '[data-brand="warm"]:is([data-theme="dark"], .dark), [data-brand="warm"] :is([data-theme="dark"], .dark), :is([data-theme="dark"], .dark) [data-brand="warm"]'
    expect(block(sel)).toEqual(expected(DARK))
  })
  it("comes after the Atlas dark block, so convert-tokens and atlas-sync still read Atlas", () => {
    expect(css.indexOf('[data-brand="warm"] {')).toBeGreaterThan(css.indexOf('[data-theme="dark"]'))
  })
  it("the component-token block re-resolves under any brand", () => {
    expect(css).toMatch(/:root,\s*\[data-theme="dark"\],\s*\.dark,\s*\[data-brand\]\s*\{/)
  })
  it("declares the nine coral primitives", () => {
    for (const s of [50, 200, 300, 400, 500, 600, 700, 800, 900]) expect(css).toMatch(new RegExp(`--atlas-color-coral-${s}:\\s*oklch\\(`))
  })
})
