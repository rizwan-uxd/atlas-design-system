"use client"

/**
 * Atlas RadioGroup — pick exactly one option from a short list.
 * Compound: RadioGroup (the set) + RadioGroupItem (one option). Native `<input type="radio">`
 * styled with `appearance: none` — the browser supplies role, grouping and arrow-key movement.
 *
 * Variants:   default | card            (RadioGroup, item may override)
 * Sizes:      sm (16) | md (20)         (RadioGroup, item may override)
 * Direction:  vertical | horizontal     (RadioGroup)
 * States:     unchecked · checked × hover · focus-visible · disabled · invalid
 *
 * Accessibility:
 *   - The group is role="radiogroup"; name it with aria-label or aria-labelledby.
 *   - Each item is one label around the input, so the whole row or card selects it. The input is
 *     named by the label text and described by the description (and any aria-describedby).
 *   - Tab enters the group once, arrow keys move the selection, Space selects (native).
 *   - Focus ring on the radio only; touch area grows to --atlas-touch-min on coarse pointers.
 *
 * Figma: Radio Group set (Direction × Variant) and Radio Group Item set (Variant, Checked, Size,
 * State). Styles in RadioGroup.module.css use semantic tokens only.
 */

import * as React from "react"
import styles from "./RadioGroup.module.css"

export type RadioGroupVariant = "default" | "card"
export type RadioGroupSize = "sm" | "md"
export type RadioGroupDirection = "vertical" | "horizontal"

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  onSelect: (value: string) => void
  variant: RadioGroupVariant
  size: RadioGroupSize
  disabled: boolean
  invalid: boolean
  required: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  /** Selected item value (controlled). */
  value?: string
  /** Initially selected item value (uncontrolled). */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Form field name shared by the items. Generated when omitted. */
  name?: string
  variant?: RadioGroupVariant
  size?: RadioGroupSize
  direction?: RadioGroupDirection
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}

export function RadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  name,
  variant = "default",
  size = "md",
  direction = "vertical",
  disabled = false,
  invalid = false,
  required = false,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const generatedName = React.useId()
  const isControlled = controlledValue !== undefined
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)
  const value = isControlled ? controlledValue : internal

  const onSelect = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const ctx = React.useMemo<RadioGroupContextValue>(
    () => ({ name: name ?? generatedName, value, onSelect, variant, size, disabled, invalid, required }),
    [name, generatedName, value, onSelect, variant, size, disabled, invalid, required],
  )

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        {...props}
        role="radiogroup"
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        className={cx(styles.group, className)}
        data-direction={direction}
        data-variant={variant}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps {
  /** Value this item selects. */
  value: string
  label?: React.ReactNode
  description?: React.ReactNode
  /** Overrides the group's variant for this item. */
  variant?: RadioGroupVariant
  /** Overrides the group's size for this item. */
  size?: RadioGroupSize
  disabled?: boolean
  invalid?: boolean
  id?: string
  /** Extra description ids (for example an error message) added to the input. */
  "aria-describedby"?: string
  /** Use when there is no visible label. */
  "aria-label"?: string
  className?: string
}

export function RadioGroupItem({
  value,
  label,
  description,
  variant: variantProp,
  size: sizeProp,
  disabled: disabledProp,
  invalid: invalidProp,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  className,
}: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext)
  if (!ctx) throw new Error("RadioGroupItem must be used inside a RadioGroup")

  const generatedId = React.useId()
  const uid = id ?? generatedId
  const labelId = `${uid}-label`
  const descId = `${uid}-desc`

  const variant = variantProp ?? ctx.variant
  const size = sizeProp ?? ctx.size
  const disabled = disabledProp ?? ctx.disabled
  const invalid = invalidProp ?? ctx.invalid
  const checked = ctx.value === value

  if (process.env.NODE_ENV !== "production" && !label && !ariaLabel) {
    console.warn("RadioGroupItem: pass a label or aria-label so the option has an accessible name.")
  }

  const describedBy = [description ? descId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined

  return (
    <label
      htmlFor={uid}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-size={size}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <input
        id={uid}
        type="radio"
        className={styles.input}
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={ctx.required}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        onChange={() => {
          if (!disabled) ctx.onSelect(value)
        }}
      />
      {(label || description) && (
        <span className={styles.content}>
          {label && (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          )}
          {description && (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  )
}
