"use client"

/**
 * Atlas Spinner — an indeterminate loading indicator.
 *
 * Variants: default (loader-circle arc) | custom (loader, eight ticks)
 * Sizes: xs 16 | sm 20 | md 24 | lg 32 (icon-size tokens; stroke follows icon-stroke tokens)
 * States: none interactive. Motion: one clockwise turn per --atlas-duration-spin, linear, looping;
 *   stopped under prefers-reduced-motion (the icon stays visible).
 * Accessibility: role="status" with a visually hidden label (default "Loading"); the SVG is
 *   aria-hidden. Colour inherits currentColor, so it follows the surrounding text.
 *
 * Figma: Spinner set 527:63 (Variant × Size). Glyphs are the Lucide loader-circle / loader icons.
 */

import * as React from "react"
import styles from "./Spinner.module.css"

export type SpinnerVariant = "default" | "custom"
export type SpinnerSize = "xs" | "sm" | "md" | "lg"

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "role"> {
  /** Glyph: the arc (`default`) or eight ticks (`custom`). */
  variant?: SpinnerVariant
  /** Icon size: 16, 20, 24 or 32px. */
  size?: SpinnerSize
  /** Accessible name announced to screen readers. */
  label?: string
}

export function Spinner({
  variant = "default",
  size = "md",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  const cls = [styles.spinner, className].filter(Boolean).join(" ")

  return (
    <span {...props} className={cls} role="status" data-variant={variant} data-size={size}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {variant === "custom" ? (
          <>
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </>
        ) : (
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        )}
      </svg>
      <span className={styles.label}>{label}</span>
    </span>
  )
}
