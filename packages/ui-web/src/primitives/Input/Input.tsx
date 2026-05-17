"use client"

/**
 * Atlas Input — single-line text entry
 *
 * Variants:  default | filled | unstyled
 * Sizes:     sm | md | lg
 * States:    default · hover · focus-visible · disabled · readonly · error · loading
 *
 * Slots:
 *   leadingIcon  — icon at inline-start
 *   trailingIcon — icon at inline-end (hidden while loading; spinner shown instead)
 *   prefix       — affix text at inline-start (e.g. "$")
 *   suffix       — affix text at inline-end (e.g. ".com")
 *
 * Accessibility:
 *   - aria-invalid="true" when invalid prop is set
 *   - aria-required passed through from caller
 *   - aria-describedby wired by caller (to HelperText / ErrorText)
 *   - Focus ring via CSS :focus-visible; never suppressed
 *
 * Logical properties and prefers-reduced-motion handled in Input.module.css.
 */

import React from "react"
import styles from "./Input.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type InputVariant = "default" | "filled" | "unstyled"
export type InputSize = "sm" | "md" | "lg"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  variant?: InputVariant
  size?: InputSize
  /** Marks the field as invalid — sets aria-invalid and switches border to danger colour */
  invalid?: boolean
  /** Shows a loading spinner in the trailing-icon slot */
  loading?: boolean
  /** Icon node rendered at inline-start */
  leadingIcon?: React.ReactNode
  /**
   * Icon node rendered at inline-end.
   * Replaced by a loading spinner when loading=true.
   */
  trailingIcon?: React.ReactNode
  /** Short text affix rendered at inline-start inside the field (e.g. "$") */
  prefix?: React.ReactNode
  /** Short text affix rendered at inline-end inside the field (e.g. ".com") */
  suffix?: React.ReactNode
}

/* ── Component ──────────────────────────────────────────────── */

export function Input({
  variant = "default",
  size = "md",
  invalid = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  disabled,
  readOnly,
  className,
  ...rest
}: InputProps) {
  /*
   * Trailing slot priority:
   *   loading=true  → spinner (trailingIcon hidden to avoid layout shift)
   *   loading=false → trailingIcon (if provided)
   */
  const trailingSlot = loading ? (
    <span className={styles.spinner} aria-hidden="true">
      <span className={styles.spinnerInner} />
    </span>
  ) : (
    trailingIcon
  )

  const hasLeading = !!leadingIcon || !!prefix
  const hasTrailing = !!trailingSlot || !!suffix

  return (
    <div
      className={`${styles.wrapper} ${styles[variant]}`}
      data-leading-icon={hasLeading || undefined}
      data-trailing-icon={hasTrailing || undefined}
      data-prefix={prefix ? true : undefined}
      data-suffix={suffix ? true : undefined}
    >
      {/* Leading icon — mutually exclusive with prefix; icon takes visual priority */}
      {leadingIcon && (
        <span className={`${styles.icon} ${styles.iconLeading}`} aria-hidden="true">
          {leadingIcon}
        </span>
      )}

      {/* Prefix affix text */}
      {!leadingIcon && prefix && (
        <span className={`${styles.affix} ${styles.affixPrefix}`} aria-hidden="true">
          {prefix}
        </span>
      )}

      <input
        {...rest}
        className={`${styles.input} ${styles[size]}${className ? ` ${className}` : ""}`}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
      />

      {/* Suffix affix text */}
      {!trailingSlot && suffix && (
        <span className={`${styles.affix} ${styles.affixSuffix}`} aria-hidden="true">
          {suffix}
        </span>
      )}

      {/* Trailing icon or spinner */}
      {trailingSlot && (
        <span className={`${styles.icon} ${styles.iconTrailing}`} aria-hidden="true">
          {trailingSlot}
        </span>
      )}
    </div>
  )
}
