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

// ─── Parse typography roles + letter-spacing from CSS ──────────────────────────
// Read from the :root block only, so we take the mobile-first defaults and ignore
// any responsive @media uplifts (React Native has no media queries).

function extractRootBlock(css) {
  const start = css.indexOf(":root {")
  if (start === -1) return ""
  const blockStart = css.indexOf("{", start) + 1
  let depth = 1, i = blockStart
  while (i < css.length && depth > 0) {
    const c = css[i++]
    if (c === "{") depth++
    else if (c === "}") depth--
  }
  return css.slice(blockStart, i - 1)
}

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const rootBlock = extractRootBlock(css)

// Static font-size scale (px) — needed to resolve var() refs in the text roles.
const fontSizePx = {}
for (const mm of rootBlock.matchAll(/--atlas-font-size-([\w-]+):\s*(\d+)px/g)) {
  fontSizePx[camel(mm[1])] = parseInt(mm[2], 10)
}
// Base font size is the reference for the em→pt letter-spacing conversion below.
// Sourced from the tokens (not hardcoded); falls back to the CSS default of 16.
const BASE_FONT_PX = fontSizePx.base ?? 16

// Responsive typography roles → px numbers for RN. Values are either a literal
// "NNpx" or a var() reference into the font-size scale.
const textRole = {}
for (const mm of rootBlock.matchAll(/--atlas-text-([\w-]+):\s*([^;]+);/g)) {
  const raw = mm[2].trim()
  const pxMatch = raw.match(/^(\d+)px$/)
  const varMatch = raw.match(/var\(--atlas-font-size-([\w-]+)\)/)
  let px
  if (pxMatch) px = parseInt(pxMatch[1], 10)
  else if (varMatch) px = fontSizePx[camel(varMatch[1])]
  if (px != null) textRole[camel(mm[1])] = px
}

// Letter-spacing: CSS em → React Native pt.
//
//   CSS `letter-spacing` in `em` is RELATIVE to the element's font size
//   (rendered pt = em × fontSize). React Native `letterSpacing` is ABSOLUTE, in
//   the same density-independent unit as `fontSize`. A design token is a single
//   constant applied across text sizes, so we normalize each em value at the base
//   font size:  pt = em × BASE_FONT_PX. (Exact per-size tracking would require
//   em × fontSize at each call site — out of scope; no component changes.)
const letterSpacing = {}
for (const mm of rootBlock.matchAll(/--atlas-letter-spacing-([\w-]+):\s*(-?[\d.]+)em/g)) {
  const em = parseFloat(mm[2])
  letterSpacing[camel(mm[1])] = Math.round(em * BASE_FONT_PX * 1000) / 1000
}

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

const textRoleTs = Object.entries(textRole)
  .map(([k, v]) => `  ${k}: ${v},`)
  .join("\n")

const letterSpacingTs = Object.entries(letterSpacing)
  .map(([k, v]) => `  ${k}: ${v},`)
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

// ─── Typography · responsive roles (px numbers for RN; mobile-first) ──────────
export const textRole = {
${textRoleTs}
} as const

// ─── Letter spacing (CSS em → RN pt) ──────────────────────────────────────────
// RN letterSpacing is absolute (same unit as fontSize); CSS em is relative to
// font size (rendered pt = em × fontSize). Tokens are constants, so each em value
// is normalized at the base font size: pt = em × ${BASE_FONT_PX}. Per-size
// exactness would require em × fontSize at the call site.
export const letterSpacing = {
${letterSpacingTs}
} as const

// ─── Default aggregate — scheme-independent scale tokens ──────────────────────
// Consumed as: import tokens from './atlas.tokens'  (across components + theme).
// Colors are provided separately via the theme (useTheme().colors), so they are
// intentionally not part of this default object.
const tokens = {
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  duration,
  opacity,
  touchTarget,
  borderWidth,
  textRole,
  letterSpacing,
} as const

export default tokens
`

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, output, "utf8")
console.log("✅ Written:", OUT_PATH)
console.log(`   Primitives: ${Object.keys(primitives).length} colors`)
console.log(`   Light tokens: ${Object.keys(lightSemantic).length}`)
console.log(`   Dark tokens: ${Object.keys(darkSemantic).length}`)
