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
 *   - aria-describedby links to description when present
 *   - aria-disabled="true" when disabled (keeps focus target; pointer-events
 *     suppressed via CSS so mouse clicks are blocked)
 *   - Focus ring via CSS :focus-visible; never suppressed
 *
 * Logical properties and prefers-reduced-motion handled in Switch.module.css.
 */

import React, { useId, useState } from "react"
import styles from "./Switch.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type SwitchSize = "sm" | "md"

export interface SwitchProps {
  size?: SwitchSize
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  description?: React.ReactNode
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
  id,
}: SwitchProps) {
  const generatedId = useId()
  const uid = id ?? generatedId
  const labelId = `${uid}-label`
  const descId = `${uid}-desc`

  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = controlledChecked !== undefined
  const isChecked = isControlled ? controlledChecked : internalChecked

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
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        onClick={toggle}
        className={`${styles.track} ${styles[size]}`}
        data-state={isChecked ? "checked" : "unchecked"}
        data-disabled={disabled || undefined}
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
