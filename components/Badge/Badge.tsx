"use client"

/**
 * Atlas Badge — compact label for status, count, or category
 *
 * Variants:  default | secondary | success | warning | danger | info | outline
 * Sizes:     sm | md | lg
 * States:    default · hover (interactive only) · focus-visible (interactive only) · disabled
 *
 * Slots:
 *   dot          — 6px status circle at inline-start (color = currentColor)
 *   leadingIcon  — icon at inline-start (after dot)
 *   children     — label text (required)
 *   trailingIcon — icon at inline-end
 *   removable    — × close button at inline-end (makes badge interactive)
 *
 * Accessibility:
 *   - Non-interactive: <span>, decorative
 *   - Interactive (onClick): renders as <button> with data-interactive attr
 *   - Removable: close affordance is <button aria-label="Remove {label}">
 *   - Status/live: wrap badge in role="status" + aria-live="polite" at call site
 */

import React from "react"
import styles from "./Badge.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
export type BadgeSize    = "sm" | "md" | "lg"
export type BadgeIntent  = "default" | "success" | "warning" | "danger" | "info"

export interface BadgeProps {
  variant?:      BadgeVariant
  size?:         BadgeSize
  /**
   * Only used with `variant="outline"`.
   * Colors the border and text to match the intent semantic color.
   */
  intent?:       BadgeIntent
  /** Uses --atlas-radius-sm instead of radius-full */
  square?:       boolean
  /** Leading 6px status dot; color inherits from variant foreground */
  dot?:          boolean
  leadingIcon?:  React.ReactNode
  trailingIcon?: React.ReactNode
  /** Adds a × button at inline-end; onRemove fires when clicked */
  removable?:    boolean
  onRemove?:     () => void
  /**
   * Explicit accessible label for the remove button.
   * Required when `removable=true` and `children` is not a plain string.
   * Falls back to children string content; ultimate fallback is "item".
   * FIX BUG-024
   */
  removeLabel?:  string
  /**
   * Makes the entire badge a pressable surface.
   * Renders as <button> when provided; <span> otherwise.
   * FIX BUG-023
   */
  onClick?:      () => void
  disabled?:     boolean
  className?:    string
  children:      React.ReactNode
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Component ──────────────────────────────────────────────────── */

export function Badge({
  variant     = "default",
  size        = "md",
  intent      = "default",
  square      = false,
  dot         = false,
  leadingIcon,
  trailingIcon,
  removable   = false,
  onRemove,
  removeLabel,
  onClick,
  disabled    = false,
  className,
  children,
}: BadgeProps) {
  /* Intent class only applies on outline variant */
  const intentClass =
    variant === "outline" && intent !== "default"
      ? styles[`intent${intent.charAt(0).toUpperCase()}${intent.slice(1)}` as keyof typeof styles]
      : undefined

  const isInteractive = Boolean(onClick)

  const classes = cx(
    styles.badge,
    styles[variant],
    styles[size],
    square   && styles.square,
    disabled && styles.disabled,
    intentClass,
    className,
  )

  /* Derive label string for the remove button aria-label — FIX BUG-024 */
  const labelText = removeLabel ?? (typeof children === "string" ? children : undefined)

  if (
    process.env.NODE_ENV !== "production" &&
    removable &&
    !labelText
  ) {
    console.warn(
      "[Atlas Badge] removable=true requires either a string `children` or an explicit `removeLabel` prop " +
      "to produce an accessible aria-label for the remove button."
    )
  }

  const content = (
    <>
      {/* Leading status dot — color inherits currentColor from variant */}
      {dot && <span className={styles.dot} aria-hidden="true" />}

      {/* Leading icon slot */}
      {leadingIcon && (
        <span aria-hidden="true">{leadingIcon}</span>
      )}

      {/* Label */}
      {children}

      {/* Trailing icon slot (hidden when removable — remove button takes that position) */}
      {!removable && trailingIcon && (
        <span aria-hidden="true">{trailingIcon}</span>
      )}

      {/* Remove affordance */}
      {removable && (
        <button
          type="button"
          className={styles.removeBtn}
          aria-label={`Remove ${labelText ?? "item"}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          ×
        </button>
      )}
    </>
  )

  /* FIX BUG-023: render <button> when onClick is provided */
  if (isInteractive) {
    return (
      <button
        type="button"
        className={classes}
        data-interactive
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-disabled={disabled || undefined}
      >
        {content}
      </button>
    )
  }

  return (
    <span className={classes}>
      {content}
    </span>
  )
}
