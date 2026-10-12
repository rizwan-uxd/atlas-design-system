"use client"

/**
 * Atlas Field — a Label, a control, and help or error text, wired together
 *
 * Sizes:     sm | md | lg   (mirror the Label and the control inside)
 * States:    default · invalid (error text) · disabled
 *
 * Anatomy:   [Label] [control — render prop] [help text | error text]
 *
 * Accessibility:
 *   - Label htmlFor = the control's id (generated with useId unless `id` is passed)
 *   - The control receives id, invalid, disabled, aria-describedby and aria-required
 *     through the render prop; spread them onto it
 *   - aria-describedby points at the error text when there is an error, otherwise
 *     at the help text; the error replaces the help text
 *   - Error text is role="alert", with an icon so the error is not colour alone
 *
 * Rules:
 *   - required wins over optional (Label rule); the marker is decorative
 *   - Field owns layout and wiring only: no surface, fills the width
 */

import React, { useId } from "react"
import { CircleAlert } from "lucide-react"
import { Label } from "@atlas/ui-web/primitives/Label/Label"
import styles from "./Field.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type FieldSize = "sm" | "md" | "lg"

export interface FieldControlProps {
  id: string
  invalid: boolean
  disabled: boolean
  "aria-describedby"?: string
  "aria-required"?: true
}

export interface FieldProps
  extends Omit<React.ComponentProps<"div">, "children" | "id"> {
  size?: FieldSize
  /** Label text */
  label: React.ReactNode
  /** Shows the required marker and sets aria-required on the control */
  required?: boolean
  /** Shows the "(optional)" hint; ignored when required */
  optional?: boolean
  /** Guidance under the control; replaced by `error` while there is one */
  helpText?: React.ReactNode
  /** Validation message; sets invalid on the Label and the control */
  error?: React.ReactNode
  disabled?: boolean
  /** Id for the control; generated when omitted */
  id?: string
  /** Receives the wiring props and returns the control */
  children: (control: FieldControlProps) => React.ReactNode
}

/* ── Component ──────────────────────────────────────────────── */

export function Field({
  size = "md",
  label,
  required = false,
  optional = false,
  helpText,
  error,
  disabled = false,
  id,
  children,
  className,
  ...rest
}: FieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const helpId = `${controlId}-help`
  const errorId = `${controlId}-error`

  const hasError = error !== undefined && error !== null && error !== false && error !== ""
  const hasHelp = !hasError && helpText !== undefined && helpText !== null && helpText !== false && helpText !== ""

  const describedBy = hasError ? errorId : hasHelp ? helpId : undefined

  const classes = [styles.field, className].filter(Boolean).join(" ")

  return (
    <div
      {...rest}
      className={classes}
      data-size={size}
      data-invalid={hasError || undefined}
      data-disabled={disabled || undefined}
    >
      <Label
        htmlFor={controlId}
        size={size}
        required={required}
        optional={optional}
        disabled={disabled}
        invalid={hasError}
        className={styles.label}
      >
        {label}
      </Label>

      {children({
        id: controlId,
        invalid: hasError,
        disabled,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })}

      {hasError && (
        <p id={errorId} role="alert" className={`${styles.message} ${styles.error}`}>
          <CircleAlert className={styles.icon} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {hasHelp && (
        <p id={helpId} className={`${styles.message} ${styles.help}`}>
          {helpText}
        </p>
      )}
    </div>
  )
}
