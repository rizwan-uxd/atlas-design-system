"use client"

/**
 * Atlas Switch — canonical reference component
 *
 * Sizes:   sm | md
 * States:  default · hover · focus-visible · active · disabled
 *
 * Accessibility:
 *   - role="switch" + aria-checked conveys toggle state
 *   - aria-labelledby links to rendered label (avoids duplicate aria-label)
 *   - aria-label / aria-labelledby can be passed via ...rest when label is omitted
 *   - aria-describedby links to description when present
 *   - aria-required="true" when required=true
 *   - aria-disabled="true" when disabled (keeps focus target; pointer-events
 *     suppressed via CSS so mouse clicks are blocked)
 *   - Focus ring via CSS :focus-visible; never suppressed
 *   - Dev-mode warning fires when no accessible name is detectable
 *
 * Logical properties and prefers-reduced-motion handled in Switch.module.css.
 */

import React, { useId, useState } from "react"
import styles from "./Switch.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type SwitchSize = "sm" | "md"

export interface SwitchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "checked" | "defaultChecked" | "children"
  > {
  size?: SwitchSize
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** Shows a visible label linked via aria-labelledby */
  label?: React.ReactNode
  description?: React.ReactNode
  /** Whether the switch is required in a form context */
  required?: boolean
  /** Explicit id — falls back to React useId() */
  id?: string
}

/* ── Component ──────────────────────────────────────────────── */

export function Switch({
  size = "md",
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  required,
  id,
  ...rest
}: SwitchProps) {
  const generatedId = useId()
  const uid = id ?? generatedId
  const labelId = `${uid}-label`
  const descId = `${uid}-desc`

  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = controlledChecked !== undefined
  const isChecked = isControlled ? controlledChecked : internalChecked

  // Dev-mode warning: switch must have an accessible name
  if (
    process.env.NODE_ENV !== "production" &&
    !label &&
    !rest["aria-label"] &&
    !rest["aria-labelledby"]
  ) {
    console.warn(
      "[Atlas Switch] No accessible name provided. Pass a 'label' prop, " +
      "or 'aria-label' / 'aria-labelledby' when rendering without a visible label."
    )
  }

  const toggle = () => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) setInternalChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <div
      className={styles.root}
      data-disabled={disabled || undefined}
    >
      {/*
       * The track is a <button> so it is natively focusable and keyboard
       * activatable (Space / Enter). role="switch" overrides the implicit
       * button role so AT announces it correctly as a toggle.
       */}
      <button
        id={uid}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled || undefined}
        aria-required={required || undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        onClick={toggle}
        className={`${styles.track} ${styles[size]}`}
        data-state={isChecked ? "checked" : "unchecked"}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>

      {(label || description) && (
        <div className={styles.content}>
          {label && (
            <label
              id={labelId}
              htmlFor={uid}
              className={styles.label}
            >
              {label}
            </label>
          )}
          {description && (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
