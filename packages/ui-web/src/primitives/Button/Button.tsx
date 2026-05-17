"use client"

/**
 * Atlas Button — canonical reference component
 *
 * Variants:  primary | secondary | outline | ghost | destructive | link
 * Sizes:     sm | md | lg | icon
 * States:    default · hover · focus-visible · active · disabled · loading
 *
 * Accessibility:
 *   - aria-busy="true" when loading (async in progress)
 *   - aria-disabled="true" when disabled or loading
 *   - aria-label required by caller when size="icon"
 *   - Focus ring via CSS :focus-visible; never suppressed
 *
 * Logical properties and prefers-reduced-motion handled in Button.module.css.
 */

import React from "react"
import { Slot } from "@radix-ui/react-slot"
import styles from "./Button.module.css"

/* ── Types ──────────────────────────────────────────────── */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"

export type ButtonSize = "sm" | "md" | "lg" | "icon"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /**
   * Size of the button.
   * - `sm | md | lg` — named heights (32 / 40 / 48 px).
   * - `icon` — legacy alias for `md` + `iconOnly`. Kept for back-compat.
   *   Prefer explicit `size="md" iconOnly` for new callers.
   */
  size?: ButtonSize
  /**
   * When true, collapses padding to zero and clamps width = height so the
   * button becomes a square icon-only control.
   * Composes with `size` — e.g. `size="lg" iconOnly` gives a 48 × 48 button.
   * Requires `aria-label` or `aria-labelledby` (dev-mode warning fired if absent).
   */
  iconOnly?: boolean
  loading?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /**
   * Web only — Radix Slot pattern.
   * Renders styles onto the child element instead of a <button>.
   * Useful for wrapping <a> tags with button styles.
   */
  asChild?: boolean
  children?: React.ReactNode
}

/* ── Helpers ────────────────────────────────────────────── */

/** Minimal class-name joiner — no external dependency. */
function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Component ──────────────────────────────────────────── */

export function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  asChild = false,
  children,
  disabled,
  className,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const Comp = (asChild ? Slot : "button") as React.ElementType

  /*
   * BUG-005 fix: resolve effective size and icon-only modifier independently.
   *
   * `size="icon"` is a legacy alias: it maps to `md` height + square layout.
   * New callers should use `size="sm|md|lg" iconOnly` for composable control.
   *
   * effectiveSize — always one of sm | md | lg; drives the height/padding class.
   * isIconOnly    — when true, applies the .icon modifier (padding:0, width=height).
   */
  const effectiveSize: "sm" | "md" | "lg" = size === "icon" ? "md" : size
  const isIconOnly = size === "icon" || iconOnly

  /*
   * BUG-006 fix: fire a dev-mode warning when an icon-only button has no
   * accessible label. Screen readers have no text to announce otherwise.
   */
  if (
    process.env.NODE_ENV !== "production" &&
    isIconOnly &&
    !rest["aria-label"] &&
    !rest["aria-labelledby"]
  ) {
    console.warn(
      "[Atlas Button] Icon-only buttons (size='icon' or iconOnly=true) require " +
      "an aria-label or aria-labelledby prop for screen reader accessibility.",
    )
  }

  /**
   * Size class is omitted for the link variant: links are inline elements
   * with no fixed height. The .link CSS class zeroes padding-inline and
   * resets border-radius, so applying a size class would conflict.
   */
  const classes = cx(
    styles.btn,
    styles[variant],
    variant !== "link" ? styles[effectiveSize] : undefined,
    isIconOnly ? styles.icon : undefined,
    className,
  )

  /**
   * Interaction guard:
   *   - Native `disabled` attr  → only when prop `disabled` is true
   *                               (preserves tab-stop during loading)
   *   - aria-disabled            → true when disabled OR loading
   *   - aria-busy                → true only when loading
   *   - onClick                  → suppressed when disabled or loading
   *
   * We do NOT set the native `disabled` attr when loading so the button
   * remains keyboard-focusable and screen readers can announce aria-busy.
   * pointer-events: none on [aria-disabled="true"] in the CSS module
   * prevents mouse clicks without removing focus.
   */
  const isAriaDisabled = disabled || loading || undefined // undefined removes attr

  return (
    <Comp
      /* Caller props spread first so our controlled attrs always win */
      {...rest}
      /* native type only applies to real <button>; Slot forwards to child */
      type={asChild ? undefined : type}
      className={classes}
      disabled={disabled}
      aria-disabled={isAriaDisabled}
      aria-busy={loading || undefined}
      onClick={disabled || loading ? undefined : onClick}
    >
      {/* Leading icon slot — replaced by spinner when loading */}
      {loading ? (
        <span
          className={styles.spinner}
          aria-hidden="true" /* spinner is decorative; aria-busy conveys state */
        />
      ) : (
        leadingIcon
      )}

      {children}

      {/* Trailing icon: visibility:hidden while loading preserves its layout
          width so the button doesn't reflow between states. */}
      {trailingIcon && (
        <span
          className={loading ? styles.trailingHidden : undefined}
          aria-hidden={loading ? "true" : undefined}
        >
          {trailingIcon}
        </span>
      )}
    </Comp>
  )
}
