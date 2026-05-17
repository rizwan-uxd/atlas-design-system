"use client"

/**
 * Atlas Alert — inline status/feedback message
 *
 * Variants:  info | success | warning | danger
 * Sizes:     sm | md
 *
 * Anatomy:
 *   [accent bar] [icon] [body: title · description · actions] [dismiss ×]
 *
 * Accessibility:
 *   - role="status" (polite)    for info/success
 *   - role="alert"  (assertive) for warning/danger
 *   - Dismiss button: <button aria-label="Dismiss [variant] alert">
 *   - Dismiss touch target ≥ --atlas-touch-min (44px)
 *   - Reduced motion: enter + exit animations suppressed via CSS media query
 *
 * Props:
 *   title       — bold first line (optional)
 *   description — body text (optional; alias: children)
 *   icon        — override default intent icon
 *   hideIcon    — suppress icon entirely
 *   actions     — slot for inline <Button> elements
 *   dismissible — shows × button
 *   onDismiss   — fires after exit animation completes (FIX BUG-032)
 */

import React, { useState, useEffect } from "react"
import styles from "./Alert.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type AlertVariant = "info" | "success" | "warning" | "danger"
export type AlertSize    = "sm" | "md"

export interface AlertProps {
  variant?:     AlertVariant
  size?:        AlertSize
  title?:       React.ReactNode
  /** Description text. Alternatively pass as children. */
  description?: React.ReactNode
  /** Override the default intent icon */
  icon?:        React.ReactNode
  /** Hide the leading icon entirely */
  hideIcon?:    boolean
  /** Slot for inline action buttons below the description */
  actions?:     React.ReactNode
  /** Show the × dismiss button */
  dismissible?: boolean
  /**
   * Fires after the exit animation completes.
   * Use to unmount the Alert in the parent (do not unmount immediately on click).
   * FIX BUG-032
   */
  onDismiss?:   () => void
  className?:   string
  /** Description content (alias for description prop) */
  children?:    React.ReactNode
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* Detect reduced-motion preference at runtime for instant dismiss fallback */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/* ── Default icons per variant ──────────────────────────────────── */

const DEFAULT_ICONS: Record<AlertVariant, string> = {
  info:    "ℹ",
  success: "✓",
  warning: "⚠",
  danger:  "⊗",
}

/* ── Component ──────────────────────────────────────────────────── */

export function Alert({
  variant     = "info",
  size        = "md",
  title,
  description,
  icon,
  hideIcon    = false,
  actions,
  dismissible = false,
  onDismiss,
  className,
  children,
}: AlertProps) {
  /* FIX BUG-032: track dismissing state to run exit animation */
  const [isDismissing, setIsDismissing] = useState(false)

  /* role follows intent severity */
  const role = variant === "warning" || variant === "danger" ? "alert" : "status"

  /* description — prefer explicit prop, fall back to children */
  const descContent = description ?? children

  /* icon — prefer override, fall back to default */
  const iconContent = icon ?? DEFAULT_ICONS[variant]

  const classes = cx(
    styles.alert,
    styles[variant],
    size !== "md" && styles[size],
    isDismissing && styles.dismissing,
    className,
  )

  /* FIX BUG-032: trigger exit animation; under reduced-motion, call onDismiss immediately */
  const handleDismiss = () => {
    if (prefersReducedMotion()) {
      onDismiss?.()
      return
    }
    setIsDismissing(true)
  }

  /* FIX BUG-032: after exit animation ends, notify parent to unmount */
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    // Only respond to the alertExit animation, not alertEnter
    if (isDismissing && e.animationName.includes("alertExit")) {
      onDismiss?.()
    }
  }

  return (
    <div
      role={role}
      className={classes}
      onAnimationEnd={isDismissing ? handleAnimationEnd : undefined}
    >
      {/* Leading icon */}
      {!hideIcon && (
        <span className={styles.icon} aria-hidden="true">
          {iconContent}
        </span>
      )}

      {/* Body */}
      <div className={styles.body}>
        {title && (
          <p className={styles.title}>{title}</p>
        )}
        {descContent && (
          <p className={styles.description}>{descContent}</p>
        )}
        {actions && (
          <div className={styles.actions}>{actions}</div>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          type="button"
          className={styles.dismissBtn}
          aria-label={`Dismiss ${variant} alert`}
          onClick={handleDismiss}
          disabled={isDismissing}
        >
          ✕
        </button>
      )}
    </div>
  )
}
