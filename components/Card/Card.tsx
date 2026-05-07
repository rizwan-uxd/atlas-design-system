"use client"

/**
 * Atlas Card — surface that groups related content
 *
 * Variants:  default | elevated | outlined | filled
 * Sizes:     sm | md | lg
 * States:    default · hover (interactive) · focus-visible (interactive)
 *            · selected · disabled
 *
 * Compound API:
 *   <Card>
 *     <CardHeader leading={<Icon />} action={<Button />}>
 *       <CardTitle>…</CardTitle>
 *       <CardDescription>…</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter justify="between">…</CardFooter>
 *   </Card>
 *
 * Accessibility:
 *   - Non-interactive: <article> (semantic landmark)
 *   - Interactive: tabIndex=0, role="button", aria-labelledby → CardTitle
 *   - Selected: aria-pressed="true" (toggle) or aria-selected (listbox/grid)
 *   - Disabled: aria-disabled, pointer-events suppressed
 *   - Focus ring via CSS :focus-visible on the card root
 *
 * Logical properties and token-only values in Card.module.css.
 */

import React, { useId } from "react"
import styles from "./Card.module.css"

/* ── Helpers ─────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ───────────────────────────────────────────────────── */

export type CardVariant = "default" | "elevated" | "outlined" | "filled"
export type CardSize    = "sm" | "md" | "lg"

export interface CardProps {
  variant?:     CardVariant
  size?:        CardSize
  /** Adds hover, focus-visible, and cursor:pointer styles */
  interactive?: boolean
  /** Shows primary border; use aria-pressed/aria-selected on caller */
  selected?:    boolean
  /** Suppresses interaction; applies opacity-disabled */
  disabled?:    boolean
  onClick?:     React.MouseEventHandler<HTMLElement>
  className?:   string
  children?:    React.ReactNode
  id?:          string
}

/* ── Card root ───────────────────────────────────────────────── */

export function Card({
  variant     = "default",
  size        = "md",
  interactive = false,
  selected    = false,
  disabled    = false,
  onClick,
  className,
  children,
  id,
}: CardProps) {
  const generatedId = useId()
  const uid = id ?? generatedId

  const classes = cx(
    styles.card,
    styles[variant],
    size !== "md" && styles[size],
    interactive && styles.interactive,
    selected    && styles.selected,
    disabled    && styles.disabled,
    className,
  )

  if (interactive) {
    return (
      <div
        id={uid}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-pressed={selected || undefined}
        onClick={disabled ? undefined : onClick}
        onKeyDown={disabled ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick?.(e as unknown as React.MouseEvent<HTMLElement>)
          }
        }}
        className={classes}
      >
        {children}
      </div>
    )
  }

  return (
    <article
      id={uid}
      aria-disabled={disabled || undefined}
      className={classes}
    >
      {children}
    </article>
  )
}

/* ── CardHeader ──────────────────────────────────────────────── */
/*
 * Layout: [leading] [main slot (children)] [action]
 * leading and action are optional slots at the inline edges.
 * children should be CardTitle + CardDescription.
 */

export interface CardHeaderProps {
  /** Inline-start slot — icon, avatar, or image */
  leading?:   React.ReactNode
  /** Inline-end slot — overflow menu, icon button */
  action?:    React.ReactNode
  className?: string
  children?:  React.ReactNode
}

export function CardHeader({ leading, action, className, children }: CardHeaderProps) {
  return (
    <div className={cx(styles.header, className)}>
      {leading && (
        <span className={styles.leading} aria-hidden="true">
          {leading}
        </span>
      )}

      <div className={styles.headerMain}>
        {children}
      </div>

      {action && (
        <span className={styles.action}>
          {action}
        </span>
      )}
    </div>
  )
}

/* ── CardTitle ───────────────────────────────────────────────── */

export interface CardTitleProps {
  className?: string
  children?:  React.ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <p className={cx(styles.title, className)}>
      {children}
    </p>
  )
}

/* ── CardDescription ─────────────────────────────────────────── */

export interface CardDescriptionProps {
  className?: string
  children?:  React.ReactNode
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cx(styles.description, className)}>
      {children}
    </p>
  )
}

/* ── CardContent ─────────────────────────────────────────────── */

export interface CardContentProps {
  className?: string
  children?:  React.ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cx(styles.content, className)}>
      {children}
    </div>
  )
}

/* ── CardFooter ──────────────────────────────────────────────── */

export interface CardFooterProps {
  /** Alignment of footer children: start (default) | between | end */
  justify?:   "start" | "between" | "end"
  className?: string
  children?:  React.ReactNode
}

export function CardFooter({ justify = "start", className, children }: CardFooterProps) {
  const justifyClass =
    justify === "between" ? styles.footerBetween :
    justify === "end"     ? styles.footerEnd :
    undefined

  return (
    <div className={cx(styles.footer, justifyClass, className)}>
      {children}
    </div>
  )
}
