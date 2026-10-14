"use client"

/**
 * Atlas Sparkline — a tiny trend line for one series, with an optional soft fill under it.
 *
 * Variants:  line | area   (area adds a fill under the line)
 * Tones:     neutral | positive | negative   (muted | success | danger; says whether the
 *            trend is good, not which way it goes)
 * Sizes:     sm 24 | md 32 | lg 40 px high   (spacing tokens); the width fills its container
 * States:    none interactive. No motion.
 *
 * Accessibility:
 *   - role="img" named by `label`, which is required: the drawing is not read out
 *   - Colour is never the only signal: pair the tone with words (Up, Down, Flat) nearby
 *   - The line runs in the order of `values`, left to right; it is not mirrored in RTL
 *
 * Rules:
 *   - One series. No axes, points, gridlines or tooltip (use Chart for those)
 *   - Fewer than two finite values draws nothing
 *
 * Figma: Sparkline set 953:48 (Variant × Tone × Size).
 */

import * as React from "react"
import styles from "./Sparkline.module.css"

export type SparklineVariant = "line" | "area"
export type SparklineTone = "neutral" | "positive" | "negative"
export type SparklineSize = "sm" | "md" | "lg"

export interface SparklineProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children" | "role" | "viewBox" | "preserveAspectRatio" | "values"> {
  /** The series, in time order. Non-finite values are skipped */
  values: number[]
  /** `line`, or `area` to fill under the line */
  variant?: SparklineVariant
  /** Whether the trend is good: `positive` success, `negative` danger, `neutral` muted */
  tone?: SparklineTone
  /** Height: 24, 32 or 40px */
  size?: SparklineSize
  /** Text alternative that says what the trend shows, e.g. "Visitors, last 7 days, rising" */
  label: string
}

/** The drawing is laid out on a 100 by 100 grid and stretched to the box (see the CSS) */
const GRID = 100
const round = (n: number) => Math.round(n * 100) / 100

/**
 * The path for a series on the 100 by 100 grid: x spread evenly, y scaled so the lowest value sits
 * at the bottom and the highest at the top (a flat series sits in the middle). With `closed` the path
 * drops to the bottom corners and closes, for the area fill. Returns "" for fewer than two finite values.
 */
export function getSparklinePath(values: number[], closed = false): string {
  const points = values.filter((v) => Number.isFinite(v))
  if (points.length < 2) return ""
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min
  const last = points.length - 1
  const line = points
    .map((v, i) => {
      const x = round((i / last) * GRID)
      const y = span === 0 ? GRID / 2 : round(GRID - ((v - min) / span) * GRID)
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")
  return closed ? `${line} L ${GRID} ${GRID} L 0 ${GRID} Z` : line
}

export function Sparkline({
  values,
  variant = "line",
  tone = "neutral",
  size = "md",
  label,
  className,
  ...props
}: SparklineProps) {
  const line = getSparklinePath(values)
  if (!line) return null
  const cls = [styles.sparkline, className].filter(Boolean).join(" ")

  return (
    <svg
      {...props}
      className={cls}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${GRID} ${GRID}`}
      preserveAspectRatio="none"
      focusable="false"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
    >
      {variant === "area" && <path className={styles.area} d={getSparklinePath(values, true)} />}
      <path className={styles.line} d={line} />
    </svg>
  )
}
