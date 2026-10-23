#!/usr/bin/env node
/**
 * Atlas Design System — Token Conversion Pipeline
 * packages/tokens/atlas.tokens.css → packages/ui-native/tokens/atlas.tokens.ts
 *
 * Parses OKLCH color values from atlas.tokens.css, converts to hex,
 * resolves semantic var() references for light/dark themes,
 * and writes a fully-typed TypeScript token object for React Native.
 * Every export is derived from the CSS (roadmap Phase 2d): change a token there and the generated file
 * changes, so CI's tokens-build git-diff gate fails until native is regenerated. The only literals are
 * the pure white and black anchors below.
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

// ─── Non-colour tokens, from the base :root block ────────────────────────────
// The first :root block holds the base scale; the @media :root blocks below it (responsive heading
// sizes) are web-only and not read. var() references resolve within the block.

function rootTokens(css) {
  const start = css.indexOf(":root {")
  const blockStart = css.indexOf("{", start) + 1
  let depth = 1, i = blockStart
  while (i < css.length && depth > 0) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") depth--
    i++
  }
  const block = css.slice(blockStart, i - 1).replace(/\/\*[\s\S]*?\*\//g, "")
  return new Map([...block.matchAll(/(--atlas-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const root = rootTokens(css)

function resolved(name, seen = []) {
  if (!root.has(name)) throw new Error(`convert-tokens: ${seen.at(-1) ?? name} refers to ${name}, which the base :root block does not define`)
  const value = root.get(name)
  const ref = value.match(/^var\((--atlas-[\w-]+)\)$/)
  return ref ? resolved(ref[1], [...seen, name]) : value
}

// One converter per value shape; anything else throws, so a new unit cannot slip through as a string.
const px = (v) => { const m = v.match(/^(-?[\d.]+)px$/); if (!m) throw new Error(`convert-tokens: expected px, got "${v}"`); return Number(m[1]) }
const ms = (v) => { const m = v.match(/^(-?[\d.]+)ms$/); if (!m) throw new Error(`convert-tokens: expected ms, got "${v}"`); return Number(m[1]) }
const num = (v) => { if (!/^-?[\d.]+$/.test(v)) throw new Error(`convert-tokens: expected a number, got "${v}"`); return Number(v) }
const str = (v) => JSON.stringify(String(num(v)))
// CSS authors letter spacing in em; React Native reads points, converted at a 16 px base
const em16 = (v) => { const m = v.match(/^(-?[\d.]+)em$/); if (!m) throw new Error(`convert-tokens: expected em, got "${v}"`); return Number((Number(m[1]) * 16).toFixed(4)) }
const bezier = (v) => {
  const m = v.match(/^cubic-bezier\(([^)]+)\)$/)
  if (!m) throw new Error(`convert-tokens: expected cubic-bezier(), got "${v}"`)
  return `[${m[1].split(",").map((n) => num(n.trim())).join(", ")}]`
}

const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const scaleKey = (k) => k.replace(/_/g, ".") // --atlas-spacing-0_5 → 0.5
const tsKey = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) || /^\d+(\.\d+)?$/.test(k) ? k : JSON.stringify(k))

/** Every base-block token named --atlas-<prefix>-<key>, converted, in CSS order. */
function group(prefix, convert, key = (k) => k) {
  const entries = [...root.keys()]
    .filter((n) => n.startsWith(`--atlas-${prefix}-`))
    .map((n) => [key(n.slice(`--atlas-${prefix}-`.length)), convert(resolved(n))])
  if (!entries.length) throw new Error(`convert-tokens: no --atlas-${prefix}-* tokens in the base :root block`)
  return `{\n${entries.map(([k, v]) => `  ${tsKey(k)}: ${v},`).join("\n")}\n}`
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
export type Theme = { [K in keyof typeof light]: string }

// ─── Spacing (--atlas-spacing-*, px numbers for RN) ───────────────────────────
export const spacing = ${group("spacing", px, scaleKey)} as const

// ─── Border radius (--atlas-radius-*) ─────────────────────────────────────────
export const radius = ${group("radius", px)} as const

// ─── Typography · sizes (--atlas-font-size-*) ─────────────────────────────────
export const fontSize = ${group("font-size", px)} as const

// ─── Typography · weights (--atlas-font-weight-*) ─────────────────────────────
export const fontWeight = ${group("font-weight", str)} as const

// ─── Typography · line-height (--atlas-line-height-*) ─────────────────────────
export const lineHeight = ${group("line-height", num)} as const

// ─── Motion · duration (--atlas-duration-*, ms) ───────────────────────────────
export const duration = ${group("duration", ms)} as const

// ─── Motion · easing (--atlas-easing-*, cubic-bezier x1 y1 x2 y2) ─────────────
export const easing = ${group("easing", bezier)} as const

// ─── Opacity (--atlas-opacity-*) ──────────────────────────────────────────────
export const opacity = ${group("opacity", num)} as const

// ─── Touch targets (--atlas-touch-*) ──────────────────────────────────────────
export const touchTarget = ${group("touch", px)} as const

// ─── Border widths (--atlas-border-width-*) ───────────────────────────────────
export const borderWidth = ${group("border-width", px)} as const

// ─── Icon size (--atlas-icon-size-*, px) and stroke (--atlas-icon-stroke-*) ───
// Stroke is in a 24-unit glyph space: the drawn stroke is stroke x size / 24.
export const iconSize = ${group("icon-size", px)} as const

export const iconStroke = ${group("icon-stroke", num)} as const

// ─── Text roles (--atlas-text-*, base sizes; web steps h1–h4 up at md and lg) ──
export const textRole = ${group("text", px, camel)} as const

// ─── Letter spacing (--atlas-letter-spacing-*) ────────────────────────────────
// CSS authors these in em (-0.01em, 0em, 0.02em); React Native reads points, so
// they are converted at a 16 px base: em x 16.
export const letterSpacing = ${group("letter-spacing", em16)} as const

// ─── Default export — components use \`import tokens from ...\` ──────────────
const tokens = {
  primitive,
  light,
  dark,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  duration,
  easing,
  opacity,
  touchTarget,
  borderWidth,
  iconSize,
  iconStroke,
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
