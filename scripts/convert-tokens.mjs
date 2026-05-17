#!/usr/bin/env node
/**
 * Atlas Design System — Token Conversion Pipeline
 * packages/tokens/atlas.tokens.css → packages/ui-native/tokens/atlas.tokens.ts
 *
 * Parses OKLCH color values from atlas.tokens.css, converts to hex,
 * resolves semantic var() references for light/dark themes,
 * and writes a fully-typed TypeScript token object for React Native.
 *
 * Usage:
 *   node scripts/convert-tokens.mjs
 *
 * Requires: culori  (npm install culori)
 * Or run with no deps using the built-in converter (pure math, no culori).
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const CSS_PATH = path.join(ROOT, "packages/tokens/atlas.tokens.css")
const OUT_PATH = path.join(ROOT, "packages/ui-native/tokens/atlas.tokens.ts")

// ─── Pure-JS OKLCH → hex (no culori required) ───────────────────────────────

function oklchToHex(L, C, H) {
  const hRad = H * Math.PI / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  let R =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const gamma = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  R = gamma(R); G = gamma(G); B = gamma(B)

  const toInt = v => Math.round(Math.min(1, Math.max(0, v)) * 255)
  return `#${toInt(R).toString(16).padStart(2, "0")}${toInt(G).toString(16).padStart(2, "0")}${toInt(B).toString(16).padStart(2, "0")}`
}

// ─── Parse CSS ───────────────────────────────────────────────────────────────

const css = fs.readFileSync(CSS_PATH, "utf8")

// Extract all --atlas-color-* OKLCH definitions
const primitives = {}
const primRe = /--(atlas-color-[\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g
let m
while ((m = primRe.exec(css)) !== null) {
  const [, name, L, C, H] = m
  const key = name.replace("atlas-color-", "")
  primitives[key] = oklchToHex(parseFloat(L), parseFloat(C), parseFloat(H))
}
// Special cases: pure white/black
primitives["neutral-0"] = "#ffffff"
primitives["neutral-1000"] = "#000000"

// ─── Resolve semantic tokens ──────────────────────────────────────────────────

function resolveVar(varRef) {
  // var(--atlas-color-neutral-0) → neutral-0 key → hex
  const match = varRef.match(/var\(--atlas-color-([\w-]+)\)/)
  if (match) return primitives[match[1]] ?? varRef
  return varRef
}

// Extract semantic blocks from CSS: :root block and [data-theme="dark"] block
function extractSemanticBlock(css, selector) {
  const start = css.indexOf(selector)
  if (start === -1) return {}
  const blockStart = css.indexOf("{", start) + 1
  let depth = 1, i = blockStart
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") depth--
    i++
  }
  const block = css.slice(blockStart, i - 1)
  const result = {}
  const re = /--(atlas-[\w-]+):\s*(var\(--atlas-color-[\w-]+\))/g
  let mm
  while ((mm = re.exec(block)) !== null) {
    const [, name, val] = mm
    const key = name.replace("atlas-", "").replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    result[key] = resolveVar(val)
  }
  return result
}

const lightSemantic = extractSemanticBlock(css, ":root {")
const darkSemantic  = extractSemanticBlock(css, '[data-theme="dark"]')

// ─── Generate output ──────────────────────────────────────────────────────────

const primitivesTs = Object.entries(primitives)
  .map(([k, v]) => `  "${k}": "${v}",`)
  .join("\n")

const lightTs = Object.entries(lightSemantic)
  .map(([k, v]) => `  ${k}: "${v}",`)
  .join("\n")

const darkTs = Object.entries(darkSemantic)
  .map(([k, v]) => `  ${k}: "${v}",`)
  .join("\n")

const output = `// AUTO-GENERATED — do not edit manually
// Source: atlas.tokens.css
// Pipeline: scripts/convert-tokens.mjs
// Re-generate: node scripts/convert-tokens.mjs

// ─── Primitive colors ──────────────────────────────────────────────────────────
export const primitive = {
${primitivesTs}
} as const

export type PrimitiveColor = keyof typeof primitive

// ─── Semantic themes ──────────────────────────────────────────────────────────
export const light = {
${lightTs}
} as const

export const dark = {
${darkTs}
} as const

export type SemanticColor = keyof typeof light
export type Theme = typeof light

// ─── Spacing (px numbers for RN) ─────────────────────────────────────────────
export const spacing = {
  px:  1,
  0:   0,
  0.5: 2,
  1:   4,
  1.5: 6,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
} as const

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  none: 0,
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  "2xl": 24,
  full: 9999,
} as const

// ─── Typography · sizes ───────────────────────────────────────────────────────
export const fontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const

// ─── Typography · weights ─────────────────────────────────────────────────────
export const fontWeight = {
  regular:  "400",
  medium:   "500",
  semibold: "600",
  bold:     "700",
} as const

// ─── Typography · line-height ─────────────────────────────────────────────────
export const lineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
} as const

// ─── Motion · duration (ms) ───────────────────────────────────────────────────
export const duration = {
  instant: 0,
  fast:    120,
  base:    200,
  slow:    320,
} as const

// ─── Opacity ──────────────────────────────────────────────────────────────────
export const opacity = {
  disabled: 0.5,
  hover:    0.9,
  overlay:  0.6,
} as const

// ─── Touch targets ────────────────────────────────────────────────────────────
export const touchTarget = {
  min:        44,
  comfortable: 48,
  spacious:   56,
} as const

// ─── Border widths ────────────────────────────────────────────────────────────
export const borderWidth = {
  0: 0,
  1: 1,
  2: 2,
} as const
`

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, output, "utf8")
console.log("✅ Written:", OUT_PATH)
console.log(`   Primitives: ${Object.keys(primitives).length} colors`)
console.log(`   Light tokens: ${Object.keys(lightSemantic).length}`)
console.log(`   Dark tokens: ${Object.keys(darkSemantic).length}`)
