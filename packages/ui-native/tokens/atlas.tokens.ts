// AUTO-GENERATED — do not edit manually
// Source: atlas.tokens.css
// Pipeline: scripts/convert-tokens.mjs
// Re-generate: node scripts/convert-tokens.mjs

// ─── Primitive colors ──────────────────────────────────────────────────────────
export const primitive = {
  "neutral-0": "#ffffff",
  "neutral-50": "#f9fafb",
  "neutral-100": "#f2f4f6",
  "neutral-200": "#e4e8eb",
  "neutral-300": "#d0d6db",
  "neutral-400": "#9aa2a9",
  "neutral-500": "#6b747c",
  "neutral-600": "#4d555d",
  "neutral-700": "#3a4147",
  "neutral-800": "#24292e",
  "neutral-900": "#14181c",
  "neutral-950": "#080a0d",
  "neutral-1000": "#000000",
  "brand-50": "#f1f6ff",
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
  "success-50": "#eafbef",
  "success-100": "#d0f5dc",
  "success-500": "#01a35d",
  "success-600": "#008a44",
  "success-700": "#007033",
  "success-900": "#003d1a",
  "warning-50": "#fff7e2",
  "warning-100": "#ffeabc",
  "warning-500": "#dba300",
  "warning-600": "#c28a00",
  "warning-700": "#9e6d00",
  "warning-900": "#5a3e00",
  "danger-50": "#fff0ee",
  "danger-100": "#ffdfda",
  "danger-400": "#ff6460",
  "danger-500": "#eb4244",
  "danger-600": "#d11226",
  "danger-700": "#ad0016",
  "danger-900": "#610a0f",
  "info-50": "#eaf8ff",
  "info-100": "#d0f1ff",
  "info-500": "#00a0da",
  "info-600": "#0087c4",
  "info-700": "#006ea3",
  "info-900": "#003e5c",
} as const

export type PrimitiveColor = keyof typeof primitive

// ─── Semantic themes ──────────────────────────────────────────────────────────
export const light = {
  background: "#ffffff",
  backgroundSubtle: "#f9fafb",
  backgroundMuted: "#f2f4f6",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  surfaceOverlay: "#ffffff",
  border: "#e4e8eb",
  borderStrong: "#d0d6db",
  borderSubtle: "#f2f4f6",
  foreground: "#080a0d",
  foregroundMuted: "#4d555d",
  foregroundSubtle: "#6b747c",
  foregroundDisabled: "#9aa2a9",
  foregroundOnBrand: "#ffffff",
  primary: "#3265e0",
  primaryHover: "#2350be",
  primaryActive: "#1b3f96",
  primarySubtle: "#f1f6ff",
  primaryForeground: "#ffffff",
  success: "#008a44",
  successSubtle: "#eafbef",
  successMuted: "#d0f5dc",
  successForeground: "#ffffff",
  warning: "#dba300",
  warningSubtle: "#fff7e2",
  warningMuted: "#ffeabc",
  warningForeground: "#080a0d",
  danger: "#d11226",
  dangerHover: "#ad0016",
  dangerSubtle: "#fff0ee",
  dangerMuted: "#ffdfda",
  dangerForeground: "#ffffff",
  info: "#0087c4",
  infoSubtle: "#eaf8ff",
  infoMuted: "#d0f1ff",
  infoForeground: "#ffffff",
  focusRing: "#4b7ff7",
  overlay: "#080a0d",
} as const

export const dark = {
  background: "#080a0d",
  backgroundSubtle: "#14181c",
  backgroundMuted: "#24292e",
  surface: "#14181c",
  surfaceRaised: "#24292e",
  surfaceOverlay: "#24292e",
  border: "#24292e",
  borderStrong: "#3a4147",
  borderSubtle: "#14181c",
  foreground: "#f9fafb",
  foregroundMuted: "#9aa2a9",
  foregroundSubtle: "#6b747c",
  foregroundDisabled: "#4d555d",
  foregroundOnBrand: "#ffffff",
  primary: "#4b7ff7",
  primaryHover: "#729fff",
  primaryActive: "#9ec0ff",
  primarySubtle: "#0a1d48",
  primaryForeground: "#ffffff",
  success: "#01a35d",
  successSubtle: "#003d1a",
  successMuted: "#007033",
  successForeground: "#080a0d",
  warning: "#dba300",
  warningSubtle: "#5a3e00",
  warningMuted: "#9e6d00",
  warningForeground: "#080a0d",
  danger: "#eb4244",
  dangerHover: "#ff6460",
  dangerSubtle: "#610a0f",
  dangerMuted: "#ad0016",
  dangerForeground: "#ffffff",
  info: "#00a0da",
  infoSubtle: "#003e5c",
  infoMuted: "#006ea3",
  infoForeground: "#ffffff",
  focusRing: "#729fff",
  overlay: "#000000",
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
