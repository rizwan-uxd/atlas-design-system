"use client"

/**
 * Atlas OtpInput — a one-time or verification code, drawn as one slot per digit
 *
 * Figma:      OTP Input (Size × State × Length) built from OTP Slot (Size × State × Filled)
 * Sizes:      sm | md | lg (the Input sizes)
 * Length:     4 to 8 digits, default 6 (`length`)
 * States:     default · hover · focus-visible · disabled · error (`invalid`)
 *
 * Anatomy:    <div> one visually hidden <input> over a row of aria-hidden slots
 *
 * One real input: the slots only display its value, so paste, OS autofill, screen readers and
 * Field wiring behave as they do for Input. The value is digits only; anything else typed or
 * pasted is dropped, and the value is cut to `length`.
 *
 * Accessibility:
 *   - inputMode="numeric" and autoComplete="one-time-code" are set so the OS can offer the code
 *   - The slots are aria-hidden; the input carries the label, aria-invalid and aria-describedby
 *   - Put it inside a Field for the label, help text and error; otherwise pass aria-label
 *   - Paste is never blocked
 *   - Focus ring on the active slot, shown for :focus-visible only
 */

import React from "react"
import styles from "./OtpInput.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type OtpInputSize = "sm" | "md" | "lg"

export interface OtpInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "defaultValue" | "onChange" | "type" | "maxLength" | "pattern" | "inputMode"
  > {
  size?: OtpInputSize
  /** Number of digits, 4 to 8 */
  length?: number
  /** Controlled value (digits only) */
  value?: string
  /** Initial value when uncontrolled */
  defaultValue?: string
  /** Called with the digits whenever the value changes */
  onValueChange?: (value: string) => void
  /** Called once when the value reaches `length` */
  onComplete?: (value: string) => void
  /** Marks the code as invalid — sets aria-invalid and the danger border on every slot */
  invalid?: boolean
}

/* ── Helpers ────────────────────────────────────────────────── */

const MIN_LENGTH = 4
const MAX_LENGTH = 8

function clampLength(length: number): number {
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(length)))
}

function toDigits(raw: string, length: number): string {
  return raw.replace(/\D/g, "").slice(0, length)
}

/* ── Component ──────────────────────────────────────────────── */

export function OtpInput({
  size = "md",
  length: lengthProp = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  invalid = false,
  disabled,
  className,
  onFocus,
  onClick,
  onKeyDown,
  ...rest
}: OtpInputProps) {
  const length = clampLength(lengthProp)
  const isControlled = value !== undefined
  const [inner, setInner] = React.useState(() => toDigits(defaultValue, length))
  const current = toDigits(isControlled ? value : inner, length)

  if (process.env.NODE_ENV !== "production") {
    if (!rest["aria-label"] && !rest["aria-labelledby"] && !rest.id) {
      console.warn("OtpInput needs a label: wrap it in a Field or pass aria-label.")
    }
  }

  const moveCaretToEnd = (el: HTMLInputElement) => {
    el.setSelectionRange(el.value.length, el.value.length)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = toDigits(event.target.value, length)
    // Keep the DOM in step when characters were dropped, so a controlled parent cannot leave junk
    if (event.target.value !== next) event.target.value = next
    if (!isControlled) setInner(next)
    if (next !== current) {
      onValueChange?.(next)
      if (next.length === length) onComplete?.(next)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    // Digits are only added or removed at the end, so the caret never moves
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault()
  }

  const active = Math.min(current.length, length - 1)

  return (
    <div
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
    >
      <div className={styles.slots} aria-hidden="true">
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={styles.slot}
            data-filled={i < current.length ? "" : undefined}
            data-active={i === active ? "" : undefined}
          >
            {current[i]}
          </span>
        ))}
      </div>
      <input
        autoComplete="one-time-code"
        {...rest}
        className={styles.input}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={current}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          moveCaretToEnd(event.currentTarget)
          onFocus?.(event)
        }}
        onClick={(event) => {
          moveCaretToEnd(event.currentTarget)
          onClick?.(event)
        }}
      />
    </div>
  )
}
