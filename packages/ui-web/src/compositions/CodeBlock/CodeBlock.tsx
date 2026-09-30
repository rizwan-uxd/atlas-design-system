"use client"

/**
 * Atlas CodeBlock — a labelled, monospace panel that shows a short code snippet with a copy button
 *
 * Figma:     Variant (default | typing) × Size (sm | md | lg), plus Show header, Show line numbers, Label, Code
 * Variants:  default | typing
 * Sizes:     sm | md | lg
 * States:    default · typing (writing, blinking cursor) · done · copied (check icon, "Copied" announced)
 *            · overflow (code area scrolls and is keyboard focusable)
 *
 * Plain monospace text — there is no syntax highlighting and no colour beyond the semantic tokens.
 *
 * Typing variant: the code is written out over `duration` ms after `delay` ms. `writing={false}` shows the full
 * code. Reduced motion shows the full code at once with no cursor. `onDone` fires when the code is complete.
 *
 * Header: `filename ?? language` is the label. With `showHeader={false}` the copy button floats inside the panel.
 *
 * Accessibility:
 *   - Root is role="group" named by the label (`aria-label` overrides, "Code" is the fallback).
 *   - While typing, the visible text is aria-hidden and the full code is exposed to assistive tech from the start.
 *   - The code area is a scrollable region with tabIndex 0, so long lines can be reached by keyboard.
 *   - The copy button is a labelled Button; success is announced through a polite live region ("Copied").
 */

import React from "react"
import { Button } from "../../primitives/Button/Button"
import { AnimatedIcon } from "../../animated-icons"
import { usePrefersReducedMotion } from "../../motion"
import styles from "./CodeBlock.module.css"

/* ── Types ──────────────────────────────────────────────────────── */

export type CodeBlockVariant = "default" | "typing"
export type CodeBlockSize    = "sm" | "md" | "lg"

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role" | "onCopy"> {
  /** The code to show. */
  code:              string
  variant?:          CodeBlockVariant
  size?:             CodeBlockSize
  /** Header label, e.g. "greet.ts". Wins over `language`. */
  filename?:         string
  /** Header label when there is no filename, e.g. "tsx". */
  language?:         string
  /** Shows the header row (label and copy button). When false the copy button floats inside the panel. */
  showHeader?:       boolean
  showLineNumbers?:  boolean
  /** Accessible name of the copy button. */
  copyLabel?:        string
  /** Called after the code is copied. */
  onCopy?:           (code: string) => void
  /** Typing variant: milliseconds to write the whole code. */
  duration?:         number
  /** Typing variant: milliseconds to wait before writing starts. */
  delay?:            number
  /** Typing variant: false shows the full code without animating. */
  writing?:          boolean
  /** Typing variant: called once the full code has been written. */
  onDone?:           () => void
}

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

const COPIED_MS = 2000
const DEFAULT_DURATION = 5000

const BUTTON_SIZE = { sm: "xs", md: "xs", lg: "sm" } as const

function CopyGlyph() {
  return (
    <svg className={styles.glyph} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="8" y="8" width="14" height="14" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

/** Number of characters of `code` written so far. */
function useTypedLength(code: string, active: boolean, duration: number, delay: number, onDone?: () => void): number {
  const [length, setLength] = React.useState(active ? 0 : code.length)
  const onDoneRef = React.useRef(onDone)
  React.useEffect(() => { onDoneRef.current = onDone }, [onDone])

  React.useEffect(() => {
    if (!active) {
      setLength(code.length)
      return
    }
    setLength(0)
    if (code.length === 0) {
      onDoneRef.current?.()
      return
    }
    let frame = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      const progress = Math.min(1, (now - start) / Math.max(1, duration))
      const next = Math.round(progress * code.length)
      setLength(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else onDoneRef.current?.()
    }
    const timer = setTimeout(() => { frame = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(frame) }
  }, [code, active, duration, delay])

  return length
}

/* ── CodeBlock ──────────────────────────────────────────────────── */

export function CodeBlock({
  code,
  variant         = "default",
  size            = "md",
  filename,
  language,
  showHeader      = true,
  showLineNumbers = false,
  copyLabel       = "Copy code",
  onCopy,
  duration        = DEFAULT_DURATION,
  delay           = 0,
  writing         = true,
  onDone,
  className,
  ...rest
}: CodeBlockProps) {
  const reduced = usePrefersReducedMotion()
  const animate = variant === "typing" && writing && !reduced
  const length  = useTypedLength(code, animate, duration, delay, onDone)
  const typing  = animate && length < code.length
  const shown   = typing ? code.slice(0, length) : code

  /* Reduced motion and writing={false} skip the animation, so completion is reported here. */
  const doneRef = React.useRef(onDone)
  React.useEffect(() => { doneRef.current = onDone }, [onDone])
  React.useEffect(() => {
    if (variant === "typing" && !animate) doneRef.current?.()
  }, [variant, animate, code])

  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      return
    }
    setCopied(true)
    onCopy?.(code)
  }

  const label = filename ?? language
  const lineCount = shown.split("\n").length
  const numbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")

  const copyButton = (
    <Button
      iconOnly
      variant="ghost"
      size={BUTTON_SIZE[size]}
      aria-label={copyLabel}
      onClick={handleCopy}
    >
      {copied ? <AnimatedIcon name="check" size="xs" tone="success" state="success" /> : <CopyGlyph />}
    </Button>
  )

  return (
    <div
      {...rest}
      role="group"
      aria-label={rest["aria-label"] ?? label ?? "Code"}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-size={size}
    >
      {showHeader ? (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          {copyButton}
        </div>
      ) : (
        <div className={styles.floating}>{copyButton}</div>
      )}

      <div className={styles.body}>
        {showLineNumbers && (
          <span className={styles.numbers} aria-hidden="true">{numbers}</span>
        )}
        <pre className={styles.scroll} tabIndex={0}>
          <code>
            {typing ? (
              <>
                <span aria-hidden="true">{shown}</span>
                <span className={styles.cursor} aria-hidden="true" />
                <span className={styles.srOnly}>{code}</span>
              </>
            ) : (
              shown
            )}
          </code>
        </pre>
      </div>

      <span className={styles.srOnly} role="status" aria-live="polite">{copied ? "Copied" : ""}</span>
    </div>
  )
}
