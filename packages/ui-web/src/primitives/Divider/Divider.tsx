"use client"

/**
 * Atlas Divider — a 1px line that separates content.
 *
 * Variants (Orientation): horizontal | vertical
 * Tones: default | strong | subtle | inverse
 * States: none — presentational, no hover/focus/active/disabled, no motion
 * Accessibility: meaningful → role="separator" (hr for horizontal; aria-orientation="vertical"
 *   for vertical). `decorative` → role="none", hidden from assistive tech.
 *
 * Figma: Divider set 498:11 (Orientation × Tone). The line fills its container:
 * horizontal spans the width, vertical the height (stretches inside a flex row).
 */

import * as React from "react"
import styles from "./Divider.module.css"

export type DividerOrientation = "horizontal" | "vertical"
export type DividerTone = "default" | "strong" | "subtle" | "inverse"

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "role"> {
  /** Direction of the line. */
  orientation?: DividerOrientation
  /** Colour of the line; `inverse` is for filled or brand surfaces. */
  tone?: DividerTone
  /** Purely visual — removes the separator role from the accessibility tree. */
  decorative?: boolean
}

export function Divider({
  orientation = "horizontal",
  tone = "default",
  decorative = false,
  className,
  ...props
}: DividerProps) {
  const cls = [styles.divider, className].filter(Boolean).join(" ")
  const common = {
    className: cls,
    "data-orientation": orientation,
    "data-tone": tone,
    ...props,
  }

  if (decorative) {
    return <div {...common} role="none" />
  }
  if (orientation === "vertical") {
    return <div {...common} role="separator" aria-orientation="vertical" />
  }
  return <hr {...common} />
}
