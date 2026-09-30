/**
 * Atlas motion tokens — the JS view of the duration and easing CSS variables and
 * `--atlas-opacity-pulse` in packages/tokens/atlas.tokens.css.
 *
 * `motion/react` needs numbers (seconds) and bezier tuples, not CSS strings. The CSS file stays the
 * single source of truth: `resolveMotionTokens` reads the live variables, and `defaultMotionTokens`
 * is the SSR/first-paint fallback. tests/motion.test.ts fails if the fallback drifts from the CSS.
 */

export type Bezier = readonly [number, number, number, number]

export type MotionDurationName = "instant" | "fast" | "base" | "slow" | "spin" | "pulse"
export type MotionEasingName = "linear" | "standard" | "emphasized" | "exit"

export interface MotionTokens {
  /** Seconds. */
  duration: Record<MotionDurationName, number>
  easing: Record<MotionEasingName, Bezier>
  /** Lowest opacity of a loading pulse (`--atlas-opacity-pulse`). */
  pulseOpacity: number
}

export const defaultMotionTokens: MotionTokens = {
  duration: { instant: 0, fast: 0.12, base: 0.2, slow: 0.32, spin: 1, pulse: 2 },
  easing: {
    linear: [0, 0, 1, 1],
    standard: [0.2, 0, 0, 1],
    emphasized: [0.3, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
  },
  pulseOpacity: 0.5,
}

/** "120ms" → 0.12, "1s" → 1. Returns `fallback` when the value is not a duration. */
export function parseDuration(value: string, fallback: number): number {
  const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/.exec(value)
  if (!match) return fallback
  const n = Number(match[1])
  return match[2] === "ms" ? n / 1000 : n
}

/** "cubic-bezier(0.2, 0, 0, 1)" → [0.2, 0, 0, 1]. Returns `fallback` when it does not parse. */
export function parseBezier(value: string, fallback: Bezier): Bezier {
  const match = /^\s*cubic-bezier\(([^)]+)\)\s*$/.exec(value)
  if (!match) return fallback
  const parts = match[1].split(",").map((p) => Number(p.trim()))
  return parts.length === 4 && parts.every(Number.isFinite)
    ? (parts as unknown as Bezier)
    : fallback
}

/** Read the current token values from `element` (default: the document root). */
export function resolveMotionTokens(element?: Element): MotionTokens {
  const el = element ?? (typeof document === "undefined" ? undefined : document.documentElement)
  if (!el) return defaultMotionTokens
  const style = getComputedStyle(el)
  const read = (name: string) => style.getPropertyValue(name)

  const d = defaultMotionTokens
  const pulse = Number.parseFloat(read("--atlas-opacity-pulse"))

  return {
    duration: {
      instant: parseDuration(read("--atlas-duration-instant"), d.duration.instant),
      fast: parseDuration(read("--atlas-duration-fast"), d.duration.fast),
      base: parseDuration(read("--atlas-duration-base"), d.duration.base),
      slow: parseDuration(read("--atlas-duration-slow"), d.duration.slow),
      spin: parseDuration(read("--atlas-duration-spin"), d.duration.spin),
      pulse: parseDuration(read("--atlas-duration-pulse"), d.duration.pulse),
    },
    easing: {
      linear: parseBezier(read("--atlas-easing-linear"), d.easing.linear),
      standard: parseBezier(read("--atlas-easing-standard"), d.easing.standard),
      emphasized: parseBezier(read("--atlas-easing-emphasized"), d.easing.emphasized),
      exit: parseBezier(read("--atlas-easing-exit"), d.easing.exit),
    },
    pulseOpacity: Number.isFinite(pulse) ? pulse : d.pulseOpacity,
  }
}
