"use client"

/**
 * Atlas Progress — a horizontal bar showing how far a task has got.
 *
 * Variants: none. Figma property State: determinate | indeterminate (the `indeterminate` prop).
 * Size: none — the track fills its container's width and is 4 tall (spacing-1).
 * Values: `value` and `max` are props, never variants (DEC-003). Label, value text and helper
 *   text are composed slots (`label`, `valueLabel`, `helperText`).
 * States: none interactive. Motion: the fill width animates with duration-base / standard easing;
 *   indeterminate slides a segment over duration-pulse, linear, looping. Both stop under
 *   prefers-reduced-motion (the indeterminate segment stays static).
 * Accessibility: role="progressbar" with aria-valuemin 0, aria-valuemax and aria-valuenow
 *   (omitted when indeterminate). Named by `label`, aria-label or aria-labelledby; helper text is
 *   linked with aria-describedby. Optional aria-valuetext for a readable value ("3 of 5 steps").
 *
 * Figma: Progress set 538:7 (State). Track is background-muted, fill is primary.
 */

import * as React from "react"
import styles from "./Progress.module.css"

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-valuetext"> {
  /** Current value, clamped to 0…`max`. Ignored when `indeterminate`. Default 0. */
  value?: number
  /** Value at which the bar is full. Default 100. */
  max?: number
  /** Unknown duration: a segment slides along the track and no value is announced. */
  indeterminate?: boolean
  /** Text above the bar; also the accessible name. */
  label?: React.ReactNode
  /** Value text beside the label, e.g. "62%". */
  valueLabel?: React.ReactNode
  /** Text below the bar; linked with aria-describedby. */
  helperText?: React.ReactNode
  /** Readable value for assistive tech, e.g. "3 of 5 steps". */
  "aria-valuetext"?: string
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  valueLabel,
  helperText,
  "aria-valuetext": valueText,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
  ...props
}: ProgressProps) {
  const uid = React.useId()
  const labelId = `${uid}-label`
  const helperId = `${uid}-helper`

  const hasLabel = label !== undefined && label !== null && label !== false
  const hasHelper = helperText !== undefined && helperText !== null && helperText !== false
  const hasValueLabel = valueLabel !== undefined && valueLabel !== null && valueLabel !== false

  const safeMax = max > 0 ? max : 100
  const now = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax)
  const percent = (now / safeMax) * 100

  const labelledBy = ariaLabelledBy ?? (hasLabel && !ariaLabel ? labelId : undefined)
  const describedBy = [ariaDescribedBy, hasHelper ? helperId : undefined].filter(Boolean).join(" ") || undefined

  if (process.env.NODE_ENV !== "production" && !hasLabel && !ariaLabel && !ariaLabelledBy) {
    console.warn("Progress: pass `label`, `aria-label` or `aria-labelledby` so the progress bar has an accessible name.")
  }

  const cls = [styles.progress, className].filter(Boolean).join(" ")

  return (
    <div {...props} className={cls} data-state={indeterminate ? "indeterminate" : "determinate"}>
      {(hasLabel || hasValueLabel) && (
        <div className={styles.header}>
          {hasLabel && <span id={labelId} className={styles.label}>{label}</span>}
          {hasValueLabel && <span className={styles.value}>{valueLabel}</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : now}
        aria-valuetext={indeterminate ? undefined : valueText}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        <div
          className={styles.fill}
          style={indeterminate ? undefined : ({ "--progress": percent } as React.CSSProperties)}
        />
      </div>
      {hasHelper && <span id={helperId} className={styles.helper}>{helperText}</span>}
    </div>
  )
}
