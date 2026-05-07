"use client"

/**
 * Atlas Textarea — multi-line text entry
 *
 * Variants:  default | filled
 * Sizes:     sm | md | lg
 * States:    default · hover · focus-visible · disabled · readonly · error
 *
 * Anatomy slots:
 *   field    — the editable textarea (required)
 *   counter  — character count at block-end / inline-end (optional)
 *
 * Accessibility:
 *   - aria-invalid="true" when invalid prop is set
 *   - Character counter uses aria-live="polite" (announced on blur / limit approach)
 *   - aria-describedby wired by caller (to HelperText / ErrorText / counter)
 *
 * Logical properties and token-only values in Textarea.module.css.
 */

import React, { useId, useRef, useEffect, useState } from "react"
import styles from "./Textarea.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type TextareaVariant = "default" | "filled"
export type TextareaSize = "sm" | "md" | "lg"
export type TextareaResize = "none" | "vertical" | "both"

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  variant?: TextareaVariant
  size?: TextareaSize
  /**
   * Web only — controls CSS resize behaviour.
   * Ignored (treated as "none") when disabled or readOnly.
   * @default "vertical"
   */
  resize?: TextareaResize
  /**
   * Grows the textarea height to fit content up to maxRows.
   * Sets resize to "none" automatically.
   */
  autoGrow?: boolean
  /** Maximum number of visible rows when autoGrow is true */
  maxRows?: number
  /** Show character counter at bottom-inline-end */
  showCount?: boolean
  /** Marks the field as invalid — sets aria-invalid */
  invalid?: boolean
}

/* ── Helpers ────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Component ──────────────────────────────────────────────── */

export function Textarea({
  variant = "default",
  size = "md",
  resize = "vertical",
  autoGrow = false,
  maxRows,
  showCount = false,
  maxLength,
  invalid = false,
  disabled = false,
  readOnly,
  value,
  defaultValue,
  onChange,
  className,
  id,
  ...rest
}: TextareaProps) {
  const generatedId = useId()
  const uid = id ?? generatedId
  const counterId = `${uid}-counter`

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* Track character count for the counter display */
  const [charCount, setCharCount] = useState<number>(() => {
    if (value !== undefined) return String(value).length
    if (defaultValue !== undefined) return String(defaultValue).length
    return 0
  })

  /* Sync count when controlled value changes */
  useEffect(() => {
    if (value !== undefined) setCharCount(String(value).length)
  }, [value])

  /* autoGrow — recalculate height on every content change */
  useEffect(() => {
    if (!autoGrow || !textareaRef.current) return
    const el = textareaRef.current
    el.style.height = "auto"
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20
    const paddingBlock =
      parseFloat(getComputedStyle(el).paddingTop) +
      parseFloat(getComputedStyle(el).paddingBottom)
    const maxH = maxRows ? lineHeight * maxRows + paddingBlock : Infinity
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
  }, [autoGrow, maxRows, value, charCount])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    onChange?.(e)
  }

  /* Resize class — disabled/readonly and autoGrow force none */
  const resizeClass =
    disabled || readOnly || autoGrow
      ? styles.resizeNone
      : resize === "both"
        ? styles.resizeBoth
        : undefined /* "vertical" is the CSS default on .textarea */

  const isOver = maxLength !== undefined && charCount > maxLength

  return (
    <div className={cx(styles.wrapper, styles[variant])}>
      <textarea
        {...rest}
        ref={textareaRef}
        id={uid}
        className={cx(styles.textarea, styles[size], resizeClass, className)}
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        defaultValue={defaultValue}
        maxLength={undefined} /* enforce via counter/UX, not native truncation */
        aria-invalid={invalid || undefined}
        aria-describedby={
          showCount
            ? cx(rest["aria-describedby"] as string, counterId)
            : (rest["aria-describedby"] as string) || undefined
        }
        onChange={handleChange}
        /* Add bottom padding to clear counter when showCount is on */
        style={
          showCount
            ? { paddingBlockEnd: "var(--atlas-spacing-6)" }
            : undefined
        }
      />

      {showCount && (
        /*
         * aria-live="polite" — screen reader announces on blur or when
         * the user approaches the limit (UX convention; always visible).
         */
        <span
          id={counterId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cx(styles.counter, isOver && styles.counterOver)}
        >
          {maxLength !== undefined
            ? `${charCount}/${maxLength}`
            : String(charCount)}
        </span>
      )}
    </div>
  )
}
