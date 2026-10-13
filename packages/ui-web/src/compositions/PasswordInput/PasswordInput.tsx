"use client"

/**
 * Atlas PasswordInput — a password field with a show/hide toggle and an optional strength meter
 *
 * Figma:      Password input (Size × Visibility × State) + Strength boolean
 *             + Password strength (Level) as the nested meter
 * Sizes:      sm | md | lg (the Input sizes)
 * Visibility: hidden | shown (internal state; `defaultVisible` and `onVisibleChange`)
 * States:     default · hover · focus-visible · disabled · error (from Input; `invalid`)
 * Strength:   weak | fair | good | strong, scored by getPasswordStrength
 *
 * Anatomy:    <div> Input (type password or text) · toggle Button · optional strength meter
 *
 * Strength rule: five checks — 12 or more characters, a lowercase letter, an uppercase letter,
 *   a number, a special character. 0 to 2 met is weak, 3 fair, 4 good, 5 strong. It is a hint for
 *   the person typing; the server enforces the real policy. Show it only when a password is
 *   created or changed, never on sign-in.
 *
 * Accessibility:
 *   - The toggle is a Button named "Show password" or "Hide password" with aria-pressed
 *   - The level is written as a word next to the bars, so it never relies on colour; a polite live
 *     region announces "Password strength: Good" as the value changes
 *   - Paste is never blocked; pass autoComplete="current-password" or "new-password"
 *   - Put it inside a Field for the label, help text and error (aria-describedby is merged)
 */

import React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input, type InputProps } from "@atlas/ui-web/primitives/Input/Input"
import styles from "./PasswordInput.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type PasswordInputSize = "sm" | "md" | "lg"
export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong"

export interface PasswordStrengthChecks {
  length: boolean
  lowercase: boolean
  uppercase: boolean
  number: boolean
  special: boolean
}

export interface PasswordStrength {
  /** null while the value is empty */
  level: PasswordStrengthLevel | null
  /** How many of the five checks pass, 0 to 5 */
  score: number
  checks: PasswordStrengthChecks
}

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "variant" | "size" | "prefix" | "suffix" | "leadingIcon" | "trailingIcon" | "loading"> {
  size?: PasswordInputSize
  /** Shows the strength meter under the field. Use it when a password is created, not on sign-in. */
  showStrength?: boolean
  /** Whether the value starts as plain text */
  defaultVisible?: boolean
  /** Called when the toggle changes the visibility */
  onVisibleChange?: (visible: boolean) => void
}

/* ── Strength ───────────────────────────────────────────────── */

const MIN_LENGTH = 12
const LEVELS: PasswordStrengthLevel[] = ["weak", "fair", "good", "strong"]
const LEVEL_LABEL: Record<PasswordStrengthLevel, string> = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" }
const LEVEL_SEGMENTS: Record<PasswordStrengthLevel, number> = { weak: 1, fair: 2, good: 3, strong: 4 }

/** Scores a password against five checks. A hint for the user, not a policy. */
export function getPasswordStrength(value: string): PasswordStrength {
  const checks: PasswordStrengthChecks = {
    length: value.length >= MIN_LENGTH,
    lowercase: /\p{Ll}/u.test(value),
    uppercase: /\p{Lu}/u.test(value),
    number: /\p{Nd}/u.test(value),
    special: /[^\p{L}\p{N}\s]/u.test(value),
  }
  const score = Object.values(checks).filter(Boolean).length
  if (value.length === 0) return { level: null, score: 0, checks }
  const level: PasswordStrengthLevel = score <= 2 ? "weak" : score === 3 ? "fair" : score === 4 ? "good" : "strong"
  return { level, score, checks }
}

/* ── Helpers ────────────────────────────────────────────────── */

const TOGGLE_SIZE = { sm: "xs", md: "sm", lg: "md" } as const

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Component ──────────────────────────────────────────────── */

export function PasswordInput({
  size = "md",
  showStrength = false,
  defaultVisible = false,
  onVisibleChange,
  value,
  defaultValue,
  onChange,
  className,
  disabled,
  "aria-describedby": describedBy,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(defaultVisible)
  const [inner, setInner] = React.useState(String(defaultValue ?? ""))
  const strengthId = React.useId()

  const current = value !== undefined ? String(value) : inner
  const strength = showStrength ? getPasswordStrength(current) : null

  const toggle = () => {
    const next = !visible
    setVisible(next)
    onVisibleChange?.(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInner(e.target.value)
    onChange?.(e)
  }

  const describedByIds = [describedBy, showStrength ? strengthId : undefined].filter(Boolean).join(" ") || undefined

  return (
    <div className={styles.root} data-size={size}>
      <div className={styles.field}>
        <Input
          {...rest}
          type={visible ? "text" : "password"}
          size={size}
          className={cx(styles.control, className)}
          disabled={disabled}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={handleChange}
          aria-describedby={describedByIds}
        />
        <Button
          type="button"
          variant="ghost"
          size={TOGGLE_SIZE[size]}
          iconOnly
          className={styles.toggle}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={toggle}
        >
          {visible ? <EyeOff className={styles.glyph} aria-hidden="true" /> : <Eye className={styles.glyph} aria-hidden="true" />}
        </Button>
      </div>

      {showStrength && (
        <div id={strengthId} className={styles.strength} aria-live="polite">
          {strength?.level && (
            <>
              <div className={styles.bars} aria-hidden="true" data-level={strength.level}>
                {LEVELS.map((lvl, i) => (
                  <span key={lvl} className={styles.segment} data-filled={i < LEVEL_SEGMENTS[strength.level!] || undefined} />
                ))}
              </div>
              <span className={styles.label}>
                <span className={styles.srOnly}>Password strength: </span>
                {LEVEL_LABEL[strength.level]}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
