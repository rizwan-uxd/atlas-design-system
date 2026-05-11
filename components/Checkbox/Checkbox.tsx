"use client"

/**
 * Atlas Checkbox — binary or tri-state selector
 *
 * Variants:  default | card
 * Sizes:     sm | md
 * States:    unchecked · checked · indeterminate
 *            × hover (web) · focus-visible · disabled · error
 *
 * Indicator glyphs:
 *   checked       → check mark (M2 6l3 3 5-5)
 *   indeterminate → dash       (M2 6h8)
 *   Both use stroke="currentColor"; color token set via CSS per state.
 *
 * Accessibility:
 *   - Radix Root sets role="checkbox" + aria-checked="true|false|mixed"
 *   - aria-invalid on the Root when invalid prop is set
 *   - aria-required on the Root when required prop is set
 *   - Label linked via htmlFor — if no label, caller must pass aria-label
 *   - Focus ring via CSS :focus-visible on the box only
 *   - Indicator scale animation; reduced via prefers-reduced-motion
 *
 * Logical properties and token-only values in Checkbox.module.css.
 */

import React, { useId, useState } from "react"
import * as RadixCheckbox from "@radix-ui/react-checkbox"
import styles from "./Checkbox.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type CheckboxVariant = "default" | "card"
export type CheckboxSize = "sm" | "md"

export interface CheckboxProps {
  variant?: CheckboxVariant
  size?: CheckboxSize
  checked?: boolean | "indeterminate"
  defaultChecked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean | "indeterminate") => void
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  label?: React.ReactNode
  description?: React.ReactNode
  id?: string
  /** Links to error text or helper text via ID — forwarded to the checkbox root for screen readers */
  "aria-describedby"?: string
  className?: string
}

/* ── Helpers ────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Indicator glyphs ───────────────────────────────────────── */
/*
 * stroke="currentColor" — colour driven by CSS `color:` on the box.
 * No hardcoded colour literals. stroke-width is a SVG coordinate value,
 * not a CSS layout dimension.
 */

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ── Component ──────────────────────────────────────────────── */

export function Checkbox({
  variant = "default",
  size = "md",
  checked: controlledChecked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  invalid = false,
  required = false,
  label,
  description,
  id,
  "aria-describedby": ariaDescribedBy,
  className,
}: CheckboxProps) {
  const generatedId = useId()
  const uid = id ?? generatedId

  /*
   * Track resolved state locally so the card variant and label styles
   * can react to it without a separate context.
   */
  const isControlled = controlledChecked !== undefined
  const [internalChecked, setInternalChecked] = useState<boolean | "indeterminate">(
    defaultChecked ?? false,
  )
  const resolvedChecked = isControlled ? controlledChecked : internalChecked

  const handleCheckedChange = (next: boolean | "indeterminate") => {
    if (!isControlled) setInternalChecked(next)
    onCheckedChange?.(next)
  }

  const isChecked = resolvedChecked === true
  const isIndeterminate = resolvedChecked === "indeterminate"

  /* Label size class mirrors box size */
  const labelSizeClass = size === "sm" ? styles.labelSm : styles.labelMd

  const rootClasses = cx(
    styles.root,
    variant === "card" && styles.card,
    className,
  )

  return (
    <div
      className={rootClasses}
      data-checked={isChecked || isIndeterminate || undefined}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <RadixCheckbox.Root
        id={uid}
        checked={resolvedChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={cx(styles.box, styles[size])}
        data-invalid={invalid || undefined}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          {isIndeterminate ? (
            <DashIcon className={styles.indicatorIcon} />
          ) : (
            <CheckIcon className={styles.indicatorIcon} />
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {(label || description) && (
        <div className={styles.content}>
          {label && (
            <label htmlFor={uid} className={cx(styles.label, labelSizeClass)}>
              {label}
              {required && (
                <span aria-hidden="true" className={styles.requiredMarker}>
                  *
                </span>
              )}
            </label>
          )}
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </div>
      )}
    </div>
  )
}
