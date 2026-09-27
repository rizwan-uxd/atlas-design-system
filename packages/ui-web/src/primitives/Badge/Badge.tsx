"use client"

/**
 * Atlas Badge — compact label for status, count, or category
 *
 * Variants:    neutral | primary | success | warning | danger | info
 * Appearances: default (filled) | outline
 * Sizes:       sm | md | lg
 * States:      default · hover (interactive only) · focus-visible (interactive only) · disabled
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

export type BadgeVariant    = "neutral" | "primary" | "success" | "warning" | "danger" | "info"
export type BadgeAppearance = "default" | "outline"
export type BadgeSize       = "sm" | "md" | "lg"

export interface BadgeProps {
  variant?:      BadgeVariant
  /** default = filled (tone background); outline = transparent with a tone border */
  appearance?:   BadgeAppearance
  size?:         BadgeSize
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
  variant     = "neutral",
  appearance  = "default",
  size        = "md",
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
  const isInteractive = Boolean(onClick)

  const classes = cx(
    styles.badge,
    styles[variant],
    styles[size],
    appearance === "outline" && styles.outline,
    square   && styles.square,
    disabled && styles.disabled,
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
          {/* FIX BUG-067: aria-hidden prevents double-announcement ("Remove item times") */}
          <span aria-hidden="true">×</span>
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
