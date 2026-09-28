"use client"

/**
 * Atlas Bubble — a rounded message surface for conversational content.
 *
 * Variants: primary | secondary | muted | tinted | outline | destructive
 * Align:    start | end — the thread side the bubble sits on (layout only; drawn identically in Figma)
 * Sizes:    none — one 14px text size
 * States:   none drawn in Figma. asChild (link or button) adds a focus-visible ring; hover, active and
 *           disabled are not drawn, so they are not built.
 * Accessibility: a plain bubble is a non-interactive div. asChild clones the child (a or button) so the
 *   whole bubble is the real interactive element. BubbleGroup is role="group". BubbleReactions is a
 *   decorative chip unless it is given an aria-label.
 *
 * Figma: Bubble set 656:27 (Variant × Align, Text) and Bubble Reaction 656:28 on the Bubble page.
 */

import * as React from "react"
import styles from "./Bubble.module.css"

export type BubbleVariant = "primary" | "secondary" | "muted" | "tinted" | "outline" | "destructive"
export type BubbleAlign = "start" | "end"

export interface BubbleProps extends React.ComponentProps<"div"> {
  /** Visual treatment of the surface. */
  variant?: BubbleVariant
  /** Which side of the thread the bubble sits on. */
  align?: BubbleAlign
  /** Render the single child (a link or button) as the bubble instead of a div. */
  asChild?: boolean
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ")

export function Bubble({
  variant = "primary",
  align = "start",
  asChild = false,
  className,
  children,
  ...rest
}: BubbleProps) {
  const classes = cx(styles.bubble, styles[variant], styles[align], asChild && styles.interactive, className)
  const dataAttrs = { "data-variant": variant, "data-align": align }

  if (asChild) {
    const child = React.Children.only(children)
    if (React.isValidElement<{ className?: string }>(child)) {
      return React.cloneElement(child, {
        ...rest,
        ...dataAttrs,
        className: cx(classes, child.props.className),
      } as React.HTMLAttributes<HTMLElement>)
    }
  }

  return (
    <div {...rest} {...dataAttrs} className={classes}>
      {children}
    </div>
  )
}

export interface BubbleGroupProps extends React.ComponentProps<"div"> {}

/** Stacks consecutive bubbles from one sender with a tight gap. Layout only. */
export function BubbleGroup({ className, ...rest }: BubbleGroupProps) {
  return <div role="group" {...rest} className={cx(styles.group, className)} />
}

export interface BubbleReactionsProps extends React.ComponentProps<"span"> {}

/** Reaction chip; place it as the last child of a Bubble and it overlaps the bottom edge. */
export function BubbleReactions({ className, ...rest }: BubbleReactionsProps) {
  return <span {...rest} data-bubble-reactions="" className={cx(styles.reactions, className)} />
}
