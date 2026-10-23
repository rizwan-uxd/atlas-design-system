// Phase 2d token rules (pure, no I/O): applied repo-wide by packages/governance/token-lint.mjs and
// reported per metric by atlas-verify (code.raw-design-values, code.reduced-motion-required).
// Each returns a list of findings; an empty list is a pass. The decisions behind each rule are in
// docs/superpowers/plans/2026-10-23-phase-2d-tokens.md.
import { PRIMITIVE } from "./component-tokens.mjs"
import { lengthLiterals, lineOf } from "./quality-checks.mjs"

// blank out comments but keep every other character, so indices and line numbers stay right
export const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
const blank = (s) => s.replace(/[^\n]/g, " ")

// ─── no-private-var-escape ───────────────────────────────────────────────────
// A component's private var (--_pad, --_accent) is a legal tier: component-token-alias only inspects
// --atlas-*, so without this rule a raw value hides behind a --_ name.

const PRIVATE_DECL = /(?<![\w-])(--_[\w-]+)\s*:\s*([^;{}]+)/g
const ALIAS = /^var\((--atlas-[\w-]+)\)$/

/** Every --_ declaration in a CSS source: { line, name, value }. */
export const privateVarDeclarations = (css) => {
  const src = stripComments(css)
  return [...src.matchAll(PRIVATE_DECL)].map((m) => ({ line: lineOf(src, m.index), name: m[1], value: m[2].trim().replace(/\s+/g, " ") }))
}

/**
 * A declaration passes when its value is one var(--atlas-<non-primitive>). Anything else must be in the
 * allowlist ({ file, var, value, reason }) — value included, so changing an allowed value fails again.
 * @param files [{ file, src }] every CSS file in scope
 * @returns {{ violations: {file, line, text}[], inspected: number }}
 */
export function privateVarViolations(files, allow) {
  const violations = []
  const used = new Set()
  let inspected = 0
  for (const { file, src } of files) {
    for (const d of privateVarDeclarations(src)) {
      inspected++
      const alias = d.value.match(ALIAS)
      if (alias && !PRIMITIVE.test(alias[1])) continue
      if (alias) { violations.push({ file, line: d.line, text: `${d.name}: ${d.value} aliases a primitive — use a semantic token` }); continue }
      const i = allow.findIndex((a) => a.file === file && a.var === d.name && a.value === d.value)
      if (i !== -1) { used.add(i); continue }
      violations.push({ file, line: d.line, text: `${d.name}: ${d.value} — a private var must be one var(--atlas-<semantic>), or be listed with a reason in packages/governance/private-vars.allow.json` })
    }
  }
  allow.forEach((a, i) => {
    if (!used.has(i)) violations.push({ file: a.file, line: 0, text: `stale allowlist entry ${a.var}: ${a.value} — no such declaration; remove it from packages/governance/private-vars.allow.json` })
  })
  return { violations, inspected }
}

// ─── no-raw-length ───────────────────────────────────────────────────────────
// Strict over component implementations. Not lengths here: @media preludes (breakpoint-literal-
// consistency owns them — CSS cannot use var() there), em units (font-relative by design), and the
// visually-hidden idiom (1px / -1px in a rule that also clips).

const EM_ONLY = /^-?(?:\d*\.)?\d+em$/
const ONE_PX = /^-?1px$/

/** Raw length literals in a component source: { line, prop, value }. */
export function rawLengths(source) {
  const src = stripComments(source).replace(/@media[^{]*/g, blank)
  return lengthLiterals(src)
    .filter((l) => !EM_ONLY.test(l.value))
    .filter((l) => {
      if (!ONE_PX.test(l.value)) return true
      const open = src.lastIndexOf("{", l.index), close = src.indexOf("}", l.index)
      return !/(?<![\w-])clip(?:-path)?\s*:/.test(src.slice(open + 1, close === -1 ? undefined : close))
    })
    .map((l) => ({ line: lineOf(src, l.index), prop: l.prop, value: l.value }))
}

// ─── breakpoint-literal-consistency ──────────────────────────────────────────
// Three sources hold the breakpoints: --atlas-breakpoint-*, @theme inline --breakpoint-*, and literal
// @media widths. They must agree: min-width = a breakpoint, max-width = a breakpoint − 1px.

const ATLAS_BP = /--atlas-breakpoint-([\w-]+)\s*:\s*([^;]+);/g
const THEME_BP = /(?<![\w-])--breakpoint-([\w-]+)\s*:\s*([^;]+);/g
const MEDIA = /@media([^{]*)\{/g
const WIDTH = /\((min|max)-width\s*:\s*([^)]+)\)/g

const pxMap = (css, re) => new Map([...css.matchAll(re)].map((m) => [m[1], m[2].trim()]))

/**
 * @param tokenCss the text of packages/tokens/atlas.tokens.css
 * @param files [{ file, src }] every CSS file whose @media widths are checked (the token file included)
 * @returns {{ violations: {file, line, text}[], inspected: number }} inspected = media queries read
 */
export function breakpointViolations(tokenCss, files) {
  const violations = []
  const css = stripComments(tokenCss)
  const atlas = pxMap(css, ATLAS_BP), theme = pxMap(css, THEME_BP)
  const T = "packages/tokens/atlas.tokens.css"
  if (!atlas.size) violations.push({ file: T, line: 0, text: "no --atlas-breakpoint-* tokens found — nothing to check the @media literals against" })
  for (const [k, v] of atlas) {
    if (!/^\d+px$/.test(v)) violations.push({ file: T, line: 0, text: `--atlas-breakpoint-${k}: ${v} — breakpoints must be px` })
    if (!theme.has(k)) violations.push({ file: T, line: 0, text: `--atlas-breakpoint-${k} has no --breakpoint-${k} in @theme inline` })
    else if (theme.get(k) !== v) violations.push({ file: T, line: 0, text: `--breakpoint-${k}: ${theme.get(k)} differs from --atlas-breakpoint-${k}: ${v}` })
  }
  for (const k of theme.keys()) if (!atlas.has(k)) violations.push({ file: T, line: 0, text: `--breakpoint-${k} in @theme inline has no --atlas-breakpoint-${k}` })
  const px = new Set([...atlas.values()].map((v) => parseFloat(v)))
  let inspected = 0
  for (const { file, src } of files) {
    const s = stripComments(src)
    for (const m of s.matchAll(MEDIA)) {
      for (const w of m[1].matchAll(WIDTH)) {
        inspected++
        const [, kind, raw] = w, value = raw.trim(), line = lineOf(s, m.index)
        const n = /^\d+(\.\d+)?px$/.test(value) ? parseFloat(value) : NaN
        if (Number.isNaN(n)) violations.push({ file, line, text: `@media (${kind}-width: ${value}) — use a px breakpoint value` })
        else if (kind === "min" && !px.has(n)) violations.push({ file, line, text: `@media (min-width: ${value}) is not an --atlas-breakpoint-* value (${[...px].join(", ")}px)` })
        else if (kind === "max" && !px.has(n + 1)) violations.push({ file, line, text: `@media (max-width: ${value}) must be a breakpoint minus 1px (${[...px].map((p) => p - 1).join(", ")}px)` })
      }
    }
  }
  return { violations, inspected }
}

// ─── reduced-motion-required ─────────────────────────────────────────────────

/** True when a CSS source animates with --atlas-duration-* and has no prefers-reduced-motion block. */
export function reducedMotionMissing(css) {
  const src = stripComments(css)
  return /var\(\s*--atlas-duration-/.test(src) && !/@media[^{]*prefers-reduced-motion/.test(src)
}

// ─── semantic-radius (M5.1) ──────────────────────────────────────────────────
// Component code names a radius ROLE (--atlas-radius-item|control|surface|pill). A primitive step is
// legal only where packages/governance/token-primitives.allow.json gives a reason and the exact count
// per file and token, so a new primitive use fails and a migrated one leaves a stale count that fails too.

const RADIUS_PRIMITIVE = /var\(\s*(--atlas-radius-(?:none|base|sm|md|lg|xl|2xl|full))\s*\)/g
const RADIUS_ANY = /var\(\s*--atlas-radius-[\w-]+\s*\)/g

/**
 * @param files [{ file, src }] component CSS, plus the component-token lines of atlas.tokens.css
 * @param allow [{ family, file, token, count, reason }] — only family "radius" entries are read
 * @returns {{ violations: {file, line, text}[], inspected: number }}
 */
export function semanticRadiusViolations(files, allow) {
  const violations = []
  const used = new Set()
  let inspected = 0
  for (const { file, src } of files) {
    const s = stripComments(src)
    inspected += (s.match(RADIUS_ANY) ?? []).length
    const byToken = new Map()
    for (const m of s.matchAll(RADIUS_PRIMITIVE)) {
      if (!byToken.has(m[1])) byToken.set(m[1], [])
      byToken.get(m[1]).push(lineOf(s, m.index))
    }
    for (const [token, lines] of byToken) {
      const i = allow.findIndex((a) => a.family === "radius" && a.file === file && a.token === token)
      if (i === -1) {
        lines.forEach((line) => violations.push({ file, line, text: `${token} — use a radius role (item|control|surface|pill), or list it with a reason in packages/governance/token-primitives.allow.json` }))
        continue
      }
      used.add(i)
      if (allow[i].count !== lines.length) violations.push({ file, line: lines[0], text: `${token}: ${lines.length} uses, allowlist says ${allow[i].count} — update the count or use a role` })
    }
  }
  allow.forEach((a, i) => {
    if (a.family === "radius" && !used.has(i)) violations.push({ file: a.file, line: 0, text: `stale allowlist entry ${a.token} — no such use; remove it from packages/governance/token-primitives.allow.json` })
  })
  return { violations, inspected }
}

// ─── metric rows ─────────────────────────────────────────────────────────────
// The token-lint rules behind each Phase 2d metric row. atlas-verify reports one check per row and
// metrics-report measures the committed tree with the same grouping, so the two cannot disagree.
export const METRIC_RULES = {
  // "no raw design values in component implementations": colour, length, and the private-var tier
  // that could otherwise hide either
  "code.raw-design-values": ["no-hex-color", "no-rgb", "no-oklch-raw", "no-hsl", "no-raw-length", "no-private-var-escape"],
  "code.reduced-motion-required": ["reduced-motion-required"],
}
