/**
 * contrast — WCAG AA over the token set (Phase 4, metric `code.contrast`).
 *
 * WHY THIS EXISTS. "Contrast meets WCAG AA" was `not measurable`: axe runs on rendered pages cover
 * whatever a spec happens to render, not the token pairings the system ships. The token file is the
 * system's own declaration of which text sits on which fill, so the ratio can be measured statically,
 * over every pairing, in both themes — before any page exists that renders it.
 *
 * The pair set is DERIVED from the tokens' naming (Phase 4 plan, decision 1), not an authored list, so
 * a new component token pair is measured the moment it is written:
 *   1. scale pairs     --atlas-<s>-foreground on --atlas-<s>            (on-brand / on-tone text)
 *   2. component pairs --atlas-<c>-<v>-foreground on -background twin   (Button, Input, Card, …)
 *   3. surface pairs   foreground, foreground-muted, foreground-subtle on background, surface,
 *                      surface-raised                                   (the canonical text surfaces)
 *
 * Fail-closed throughout: a pair whose value cannot be resolved to an opaque colour (alpha, calc,
 * color-mix, a bare name) is a FAILURE naming the token, never a skip — an unmeasurable pair must not
 * read as a passing one (roadmap R6). A parser that sees implausibly few tokens fails the same way.
 *
 * Known findings live in packages/governance/contrast-allow.json (the private-vars.allow pattern):
 * each entry carries fg, bg, theme and a reason a reviewer can check; an entry whose pair now measures
 * ≥ 4.5:1 is STALE and fails, so the list cannot outlive its findings. Pure module: CSS text in,
 * result object out. No fs, no git.
 */

/** WCAG 2.x normal-text AA. Borders and hover-only pairs are outside the v1 pair set, so one threshold. */
export const AA_NORMAL = 4.5

/* ── colour math ─────────────────────────────────────────── */

/** oklch() → linear-light sRGB in [0,1], CSS Color 4. Inputs: L in [0,1] (or %), C, H in deg. */
export function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = Math.cos(h) * C
  const b = Math.sin(h) * C
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
  return linear.map((v) => Math.min(1, Math.max(0, gamma(v))))
}

/** WCAG relative luminance of an sRGB triple in [0,1]. */
export function relativeLuminance([r, g, b]) {
  const ch = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/** WCAG contrast ratio of two sRGB triples; 1..21. */
export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg), l2 = relativeLuminance(bg)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/** One colour literal → sRGB triple, or null when it carries alpha or is not a supported form. */
function parseColor(value) {
  const v = value.trim().toLowerCase()
  let m = v.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?)?\s*\)$/)
  if (m) {
    const L = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1])
    const C = m[2].endsWith("%") ? parseFloat(m[2]) / 0.25 : parseFloat(m[2]) // 100% chroma = 0.25
    return oklchToSrgb(L, C, parseFloat(m[3]))
  }
  m = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/)
  if (m) {
    if (m[2] && m[2] !== "ff") return null
    return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
  }
  m = v.match(/^rgba?\(\s*([\d.]+%?)[,\s]+([\d.]+%?)[,\s]+([\d.]+%?)(?:[,\s/]+([\d.]+%?))?\s*\)$/)
  if (m) {
    if (m[4] !== undefined) {
      const a = m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])
      if (a < 1) return null
    }
    const c = (x) => (x.endsWith("%") ? parseFloat(x) / 100 : parseFloat(x) / 255)
    return [c(m[1]), c(m[2]), c(m[3])]
  }
  return null
}

/* ── token parsing ───────────────────────────────────────── */

/**
 * atlas.tokens.css → { light, dark } maps of --atlas-* → raw value.
 *
 * Only top-level rule blocks are read; at-rule blocks (@media, @theme inline, …) are brace-skipped
 * whole: @media holds responsive uplifts (no contrast role) and @theme inline holds Tailwind mirrors.
 * A block joins light when a selector is `:root`, dark when a selector carries `[data-theme="dark"]`
 * or `.dark` — the shared `:root, [data-theme="dark"], .dark` block therefore joins both, and file
 * order preserves the cascade when a token is re-declared.
 */
export function parseTokens(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const light = new Map(), dark = new Map()
  let i = 0
  while (i < src.length) {
    const open = src.indexOf("{", i)
    if (open === -1) break
    const selector = src.slice(i, open).trim()
    // brace-match the block, counting nesting so an at-rule's inner rules are skipped with it
    let depth = 1, j = open + 1
    while (j < src.length && depth > 0) {
      if (src[j] === "{") depth++
      else if (src[j] === "}") depth--
      j++
    }
    const body = src.slice(open + 1, j - 1)
    if (!selector.startsWith("@")) {
      const sel = selector.split(",").map((s) => s.trim())
      const intoLight = sel.some((s) => s === ":root")
      const intoDark = sel.some((s) => s.includes('[data-theme="dark"') || s === ".dark" || s.startsWith(".dark "))
      if (intoLight || intoDark)
        for (const m of body.matchAll(/(--atlas-[\w-]+)\s*:\s*([^;]+);/g)) {
          if (intoLight) light.set(m[1], m[2].trim())
          if (intoDark) dark.set(m[1], m[2].trim())
        }
    }
    i = j
  }
  return { light, dark }
}

/** Resolve a token through its var() chain to an opaque colour; { color } or { unresolvable }. */
export function resolveColor(name, theme) {
  const seen = new Set()
  let value = theme.get(name)
  while (value !== undefined) {
    if (seen.has(value)) return { unresolvable: `${name} resolves through a var() cycle` }
    seen.add(value)
    const ref = value.match(/^var\((--atlas-[\w-]+)\)$/)
    if (!ref) break
    name = ref[1]
    value = theme.get(name)
  }
  if (value === undefined) return { unresolvable: `${name} is not defined` }
  const color = parseColor(value)
  return color ? { color } : { unresolvable: `${name} = ${value} is not an opaque colour the check can compute` }
}

/* ── pair derivation ─────────────────────────────────────── */

const SURFACE_TEXT = ["foreground", "foreground-muted", "foreground-subtle"]
const SURFACES = ["background", "surface", "surface-raised"]

/**
 * The v1 pair set, derived from naming (decision 1). A `X-foreground` token pairs with `X` when that
 * exists (scales) or with `X-background` (component tokens). Surface pairs are fixed: the three text
 * tones on the three surfaces components actually render text on. `foreground-on-brand` and borders
 * are v1 exclusions; adding a pair is a one-line change here plus a baseline re-measure.
 */
export function derivePairs(tokens) {
  const has = (n) => tokens.light.has(n) || tokens.dark.has(n)
  const pairs = []
  for (const name of new Set([...tokens.light.keys(), ...tokens.dark.keys()])) {
    const m = name.match(/^(--atlas-.+)-foreground$/)
    if (!m) continue
    const stem = m[1]
    // scales pair with their fill (`--atlas-primary-foreground` on `--atlas-primary`). A control
    // glyph (Checkbox, Radio) renders only in the checked state, so an un-prefixed `-foreground`
    // prefers the `-checked-background` twin — pairing it with the unchecked `-background` measures
    // a glyph that is never visible there (both derived 1.00:1 before this rule)
    const bg = has(stem) ? stem : has(`${stem}-checked-background`) ? `${stem}-checked-background` : has(`${stem}-background`) ? `${stem}-background` : null
    if (bg) pairs.push({ fg: name, bg, source: bg === stem ? "scale" : "component" })
  }
  for (const fg of SURFACE_TEXT) for (const bg of SURFACES)
    if (has(`--atlas-${fg}`) && has(`--atlas-${bg}`)) pairs.push({ fg: `--atlas-${fg}`, bg: `--atlas-${bg}`, source: "surface" })
  return pairs.filter((p, i, a) => a.findIndex((q) => q.fg === p.fg && q.bg === p.bg) === i)
}

/* ── the check ───────────────────────────────────────────── */

/**
 * Measure every pair in both themes against AA. `allow` is contrast-allow.json's entries
 * ({ fg, bg, theme, reason }). Result:
 *   tokenCount  tokens parsed for light (a parser-regression guard: implausibly few fails)
 *   pairs       [{ fg, bg, theme, ratio? , ok }]
 *   violations  pairs under 4.5:1 with no allowance, or more than 0.15 worse than their allowed
 *               measurement                                       → the check FAILS on these
 *   unresolved  pairs whose colour cannot be computed        → the check FAILS on these (fail-closed)
 *   stale       allow entries whose pair now measures ≥ 4.5  → the check FAILS on these
 *   allowed     allow entries still matching a failing pair  → informational; the reason is the audit trail
 */
export function contrastCheck(css, allow = []) {
  const tokens = parseTokens(css)
  const themes = [["light", tokens.light], ["dark", new Map([...tokens.light, ...tokens.dark])]]
  const pairs = []
  for (const [theme, map] of themes) {
    for (const { fg, bg, source } of derivePairs(tokens)) {
      const f = resolveColor(fg, map), b = resolveColor(bg, map)
      if (!f.color || !b.color) {
        pairs.push({ fg, bg, theme, source, unresolvable: (!f.color && f.unresolvable) || b.unresolvable })
        continue
      }
      const ratio = contrastRatio(f.color, b.color)
      pairs.push({ fg, bg, theme, source, ratio, ok: ratio >= AA_NORMAL })
    }
  }

  const key = (fg, bg, theme) => `${fg}|${bg}|${theme}`
  const measured = new Map(pairs.filter((p) => p.ratio !== undefined).map((p) => [key(p.fg, p.bg, p.theme), p]))
  // An allowance covers the finding AS MEASURED (±0.15 for oklch→sRGB rounding), the private-vars
  // pattern: a pair that gets WORSE than its allowance is a new violation (the entry is stale in the
  // other direction), and one that reaches 4.5:1 makes the entry stale outright.
  const DRIFT = 0.15
  const violations = pairs.filter((p) => {
    if (p.ratio === undefined || p.ratio >= AA_NORMAL) return false
    const e = allow.find((x) => key(x.fg, x.bg, x.theme) === key(p.fg, p.bg, p.theme))
    if (!e) return true
    if (typeof e.ratio === "number" && p.ratio < e.ratio - DRIFT) { p.worseThanAllowed = e.ratio; return true }
    return false
  })
  const unresolved = pairs.filter((p) => p.unresolvable)
  const stale = [], allowed = []
  const seenKeys = new Set()
  for (const e of allow) {
    const k = key(e.fg, e.bg, e.theme)
    if (seenKeys.has(k)) { stale.push({ entry: e, why: "duplicate allowance" }); continue }
    seenKeys.add(k)
    const p = measured.get(k)
    if (!p) stale.push({ entry: e, why: `no such pair is derived (${e.fg} on ${e.bg}, ${e.theme})` })
    else if (p.ratio >= AA_NORMAL) stale.push({ entry: e, why: `${e.fg} on ${e.bg} (${e.theme}) now measures ${p.ratio.toFixed(2)}:1 — the allowance is stale, delete it`, measured: p.ratio })
    else allowed.push({ entry: e, measured: p.ratio })
  }
  return { tokenCount: tokens.light.size, pairs, violations, unresolved, stale, allowed }
}
