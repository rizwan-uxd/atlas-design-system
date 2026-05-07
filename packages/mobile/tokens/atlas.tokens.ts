// AUTO-GENERATED — do not edit manually
// Source: atlas.tokens.css
// Pipeline: scripts/convert-tokens.mjs
// Re-generate: node scripts/convert-tokens.mjs

// ─── Primitive colors ──────────────────────────────────────────────────────────
export const primitive = {
  // Neutral
  "neutral-0":    "#ffffff",
  "neutral-50":   "#f9fafb",
  "neutral-100":  "#f2f4f6",
  "neutral-200":  "#e4e8eb",
  "neutral-300":  "#d0d6db",
  "neutral-400":  "#9aa2a9",
  "neutral-500":  "#6b747c",
  "neutral-600":  "#4d555d",
  "neutral-700":  "#3a4147",
  "neutral-800":  "#24292e",
  "neutral-900":  "#14181c",
  "neutral-950":  "#080a0d",
  "neutral-1000": "#000000",

  // Brand
  "brand-50":  "#f1f6ff",
  "brand-100": "#dfeaff",
  "brand-200": "#c4d9ff",
  "brand-300": "#9ec0ff",
  "brand-400": "#729fff",
  "brand-500": "#4b7ff7",
  "brand-600": "#3265e0",
  "brand-700": "#2350be",
  "brand-800": "#1b3f96",
  "brand-900": "#153174",
  "brand-950": "#0a1d48",

  // Success
  "success-50":  "#eafbef",
  "success-100": "#d0f5dc",
  "success-500": "#01a35d",
  "success-600": "#008a44",
  "success-700": "#007033",
  "success-900": "#003d1a",

  // Warning
  "warning-50":  "#fff7e2",
  "warning-100": "#ffeabc",
  "warning-500": "#dba300",
  "warning-600": "#c28a00",
  "warning-700": "#9e6d00",
  "warning-900": "#5a3e00",

  // Danger
  "danger-50":  "#fff0ee",
  "danger-100": "#ffdfda",
  "danger-400": "#ff6460",
  "danger-500": "#eb4244",
  "danger-600": "#d11226",
  "danger-700": "#ad0016",
  "danger-900": "#610a0f",

  // Info
  "info-50":  "#eaf8ff",
  "info-100": "#d0f1ff",
  "info-500": "#00a0da",
  "info-600": "#0087c4",
  "info-700": "#006ea3",
  "info-900": "#003e5c",
} as const

export type PrimitiveColor = keyof typeof primitive

// ─── Semantic themes ──────────────────────────────────────────────────────────

export const light = {
  // Backgrounds
  background:        "#ffffff",
  backgroundSubtle:  "#f9fafb",
  backgroundMuted:   "#f2f4f6",

  // Surfaces
  surface:           "#ffffff",
  surfaceRaised:     "#ffffff",
  surfaceOverlay:    "#ffffff",

  // Borders
  border:            "#e4e8eb",
  borderStrong:      "#d0d6db",
  borderSubtle:      "#f2f4f6",

  // Foregrounds
  foreground:         "#080a0d",
  foregroundMuted:    "#4d555d",
  foregroundSubtle:   "#6b747c",
  foregroundDisabled: "#9aa2a9",
  foregroundOnBrand:  "#ffffff",

  // Brand / Primary
  primary:            "#3265e0",
  primaryHover:       "#2350be",
  primaryActive:      "#1b3f96",
  primarySubtle:      "#f1f6ff",
  primaryForeground:  "#ffffff",

  // Success
  success:            "#008a44",
  successSubtle:      "#eafbef",
  successForeground:  "#ffffff",

  // Warning
  warning:            "#dba300",
  warningSubtle:      "#fff7e2",
  warningForeground:  "#080a0d",

  // Danger
  danger:             "#d11226",
  dangerHover:        "#ad0016",
  dangerSubtle:       "#fff0ee",
  dangerForeground:   "#ffffff",

  // Info
  info:               "#0087c4",
  infoSubtle:         "#eaf8ff",
  infoForeground:     "#ffffff",

  // Utility
  focusRing:          "#4b7ff7",
  overlay:            "#080a0d",
} as const

export const dark = {
  // Backgrounds
  background:        "#080a0d",
  backgroundSubtle:  "#14181c",
  backgroundMuted:   "#24292e",

  // Surfaces
  surface:           "#14181c",
  surfaceRaised:     "#24292e",
  surfaceOverlay:    "#24292e",

  // Borders
  border:            "#24292e",
  borderStrong:      "#3a4147",
  borderSubtle:      "#14181c",

  // Foregrounds
  foreground:         "#f9fafb",
  foregroundMuted:    "#9aa2a9",
  foregroundSubtle:   "#6b747c",
  foregroundDisabled: "#4d555d",
  foregroundOnBrand:  "#ffffff",

  // Brand / Primary
  primary:            "#4b7ff7",
  primaryHover:       "#729fff",
  primaryActive:      "#9ec0ff",
  primarySubtle:      "#0a1d48",
  primaryForeground:  "#ffffff",

  // Success
  success:            "#01a35d",
  successSubtle:      "#003d1a",
  successForeground:  "#080a0d",

  // Warning
  warning:            "#dba300",
  warningSubtle:      "#5a3e00",
  warningForeground:  "#080a0d",

  // Danger
  danger:             "#eb4244",
  dangerHover:        "#ff6460",
  dangerSubtle:       "#610a0f",
  dangerForeground:   "#ffffff",

  // Info
  info:               "#00a0da",
  infoSubtle:         "#003e5c",
  infoForeground:     "#ffffff",

  // Utility
  focusRing:          "#729fff",
  overlay:            "#000000",
} as const

export type SemanticColor = keyof typeof light
export type Theme = typeof light

// ─── Spacing (px numbers for RN StyleSheet) ───────────────────────────────────
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
  none:  0,
  sm:    4,
  md:    8,
  lg:    12,
  xl:    16,
  "2xl": 24,
  full:  9999,
} as const

// ─── Typography · sizes ───────────────────────────────────────────────────────
export const fontSize = {
  xs:    12,
  sm:    14,
  base:  16,
  lg:    18,
  xl:    20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const

// ─── Typography · text-role sizes (mobile defaults) ──────────────────────────
export const textRole = {
  h1:      28,
  h2:      22,
  h3:      18,
  h4:      16,
  body:    16,
  bodySm:  14,
  caption: 12,
} as const

// ─── Typography · weights ─────────────────────────────────────────────────────
export const fontWeight = {
  regular:  "400" as const,
  medium:   "500" as const,
  semibold: "600" as const,
  bold:     "700" as const,
}

// ─── Typography · line-height ─────────────────────────────────────────────────
export const lineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
} as const

// ─── Typography · letter-spacing ─────────────────────────────────────────────
export const letterSpacing = {
  tight:  -0.01,
  normal: 0,
  wide:   0.02,
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
  min:         44,
  comfortable: 48,
  spacious:    56,
} as const

// ─── Border widths ────────────────────────────────────────────────────────────
export const borderWidth = {
  0: 0,
  1: 1,
  2: 2,
} as const

// ─── Convenience re-export ────────────────────────────────────────────────────
const tokens = {
  primitive,
  light,
  dark,
  spacing,
  radius,
  fontSize,
  textRole,
  fontWeight,
  lineHeight,
  letterSpacing,
  duration,
  opacity,
  touchTarget,
  borderWidth,
} as const

export default tokens
