/**
 * Atlas Label — form-field label
 *
 * Variants:  default | inline
 * Sizes:     sm | md | lg   (mirror the linked control's size)
 * States:    default · disabled · error (invalid)
 *
 * Anatomy slots:
 *   children      — label text (required)
 *   required      — "*" marker (decorative; aria-required lives on the control)
 *   optional      — "(optional)" subdued hint
 *
 * Rules:
 *   - required and optional are mutually exclusive; required wins if both are passed
 *   - Label never carries aria-required itself; that lives on the linked control
 *
 * Logical properties and token-only values in Label.module.css.
 */

import React from "react"
import styles from "./Label.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type LabelVariant = "default" | "inline"
export type LabelSize = "sm" | "md" | "lg"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: LabelVariant
  size?: LabelSize
  required?: boolean
  optional?: boolean
  disabled?: boolean
  /** When true, label colour shifts to danger to mirror the field's error state */
  invalid?: boolean
  children: React.ReactNode
}

/* ── Component ──────────────────────────────────────────────── */

export function Label({
  variant = "default",
  size = "md",
  required = false,
  optional = false,
  disabled = false,
  invalid = false,
  children,
  className,
  ...rest
}: LabelProps) {
  /*
   * required wins over optional when both are passed (spec: mutually exclusive).
   * Neither marker renders if the winning flag is false.
   */
  const showRequired = required
  const showOptional = !required && optional

  const classes = [
    styles.label,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <label
      {...rest}
      className={classes}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
    >
      {children}

      {showRequired && (
        /* Decorative — the control carries aria-required, not the label */
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}

      {showOptional && (
        <span className={styles.optional} aria-hidden="true">
          (optional)
        </span>
      )}
    </label>
  )
}
