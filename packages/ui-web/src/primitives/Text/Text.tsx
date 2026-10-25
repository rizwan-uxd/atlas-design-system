/**
 * Atlas Text — readable prose in one of the type roles
 *
 * Variants:  heading | title | body | body-sm | label | caption | overline   (the type role)
 * Tones:     default | muted
 * States:    none — Text is not interactive (no hover, active, focus, disabled or invalid)
 *
 * Anatomy slots:
 *   children — the text (required)
 *
 * Rules:
 *   - The role sets size, weight and line height through the semantic type-role tokens; heading and title
 *     scale with the responsive type collection.
 *   - `as` picks the element and changes no visuals, so a heading's level fits the page outline
 *     whatever its role. Defaults: heading h2, title h3, body and body-sm p, the rest span.
 *   - Tone never carries meaning alone: there are no status tones in v1.
 *
 * Accessibility: renders a native element, no role overrides. Height and width are never fixed,
 * so the text wraps and survives zoom and user text spacing. Not for naming a control (use Label).
 *
 * Logical properties and token-only values in Text.module.css.
 */

import React from "react"
import styles from "./Text.module.css"

/* ── Types ──────────────────────────────────────────────────── */

export type TextVariant = "heading" | "title" | "body" | "body-sm" | "label" | "caption" | "overline"
export type TextTone = "default" | "muted"
export type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  tone?: TextTone
  /** Element to render; defaults from the variant. Changes no visuals. */
  as?: TextElement
  ref?: React.Ref<HTMLElement>
  children: React.ReactNode
}

const DEFAULT_ELEMENT: Record<TextVariant, TextElement> = {
  heading: "h2",
  title: "h3",
  body: "p",
  "body-sm": "p",
  label: "span",
  caption: "span",
  overline: "span",
}

/* ── Component ──────────────────────────────────────────────── */

export function Text({
  variant = "body",
  tone = "default",
  as,
  children,
  className,
  ...rest
}: TextProps) {
  // every TextElement is an intrinsic tag that takes the same HTMLElement props and ref
  const Element = (as ?? DEFAULT_ELEMENT[variant]) as unknown as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >

  const classes = [styles.text, styles[variant], styles[tone], className].filter(Boolean).join(" ")

  return (
    <Element {...rest} className={classes} data-variant={variant} data-tone={tone}>
      {children}
    </Element>
  )
}
