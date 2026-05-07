"use client"

/**
 * Atlas Badge — compact label for status, count, or category
 *
 * Variants:  default | secondary | success | warning | danger | info | outline
 * Sizes:     sm | md | lg
 * States:    default · disabled (non-interactive by default)
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
 *   - Removable: close affordance is <button aria-label="Remove {label}">
 *   - Status/live: wrap badge in role="status" + aria-live="polite" at call site
 *
 * Logical properties and token-only values in Badge.module.css.
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
  disabled    = false,
  className,
  children,
}: BadgeProps) {
  /* Intent class only applies on outline variant */
  const intentClass =
    variant === "outline" && intent !== "default"
      ? styles[`intent${intent.charAt(0).toUpperCase()}${intent.slice(1)}` as keyof typeof styles]
      : undefined

  const classes = cx(
    styles.badge,
    styles[variant],
    styles[size],
    square   && styles.square,
    disabled && styles.disabled,
    intentClass,
    className,
  )

  /* Derive label string for the remove button aria-label */
  const labelText = typeof children === "string" ? children : "item"

  return (
    <span className={classes}>
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
          aria-label={`Remove ${labelText}`}
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
    </span>
  )
}
