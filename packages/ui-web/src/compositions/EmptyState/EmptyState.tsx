"use client"

/**
 * Atlas EmptyState — tells the user why a list or screen has no content and what to do next
 *
 * Variants:  none (the case — first use, no results, cleared — is the content, not a variant)
 * Sizes:     sm | md | lg
 *
 * Anatomy:
 *   [icon] [title] [description]
 *   [action] [secondary action]
 *
 * Accessibility:
 *   - role="status" (polite) so a change from list to empty is announced
 *   - The icon is decorative and aria-hidden
 *   - The actions are real <Button> elements passed in by the caller
 *   - No motion
 *
 * Props:
 *   icon            — decorative icon (lucide-react)
 *   title           — states the cause ("No projects yet", "No results for “alpha”")
 *   description     — one line on what happened or what to try
 *   action          — the single primary action (<Button>)
 *   secondaryAction — optional help link or ghost <Button>
 */

import React from "react"
import styles from "./EmptyState.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type EmptyStateSize = "sm" | "md" | "lg"

export interface EmptyStateProps {
  size?:            EmptyStateSize
  /** Decorative icon; sized and stroked by the component */
  icon?:            React.ReactNode
  title?:           React.ReactNode
  description?:     React.ReactNode
  /** The single primary action */
  action?:          React.ReactNode
  /** Optional secondary action, such as a help link */
  secondaryAction?: React.ReactNode
  className?:       string
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}

/* ── Component ──────────────────────────────────────────────────── */

export function EmptyState({
  size = "md",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const hasActions = Boolean(action || secondaryAction)
  return (
    <div
      role="status"
      data-size={size}
      className={cx(styles.emptyState, styles[size], className)}
    >
      {(icon || title || description) && (
        <div className={styles.text}>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          {title && <p className={styles.title}>{title}</p>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      {hasActions && (
        <div className={styles.actions}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
