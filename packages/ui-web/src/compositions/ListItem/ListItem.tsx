"use client"

/**
 * Atlas ListItem — a row or card pairing an optional leading visual with a title, a description and an action
 *
 * Figma:     List Item (Direction × Variant × Size) · List Item Media (Type × Size)
 * Directions: horizontal | vertical
 * Variants:  default | outline | muted
 * Sizes:     sm | md
 * States:    presentational — no hover, active, focus or disabled state in v1.1
 *
 * Compound API (every slot is optional — omit a part to hide it):
 *   <ListItem>
 *     <ListItemMedia type="tile"><Icon /></ListItemMedia>
 *     <ListItemContent>
 *       <ListItemTitle>…</ListItemTitle>
 *       <ListItemDescription>…</ListItemDescription>
 *     </ListItemContent>
 *     <ListItemActions><Button variant="outline" size="sm">…</Button></ListItemActions>
 *   </ListItem>
 *
 * Media: `type` icon | tile | image draws the Figma List Item Media. Without `type` the media is
 * a plain slot — pass an Avatar or AvatarGroup. With direction="vertical" an image media fills the
 * item width at a 3:2 aspect ratio.
 * Actions: a Button or an icon.
 *
 * Accessibility:
 *   - Renders a <div>; use as="li" inside a <ul>/<ol>. The item itself is not interactive.
 *   - Media is decorative by default (aria-hidden); an image that carries meaning needs real alt
 *     text, and the media wrapper then needs `decorative={false}`.
 *   - Logical properties and token-only values in ListItem.module.css.
 */

import React from "react"
import styles from "./ListItem.module.css"

/* ── Helpers ────────────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Types ──────────────────────────────────────────────────────── */

export type ListItemDirection = "horizontal" | "vertical"
export type ListItemVariant   = "default" | "outline" | "muted"
export type ListItemSize      = "sm" | "md"
export type ListItemMediaType = "icon" | "tile" | "image"

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Layout: a compact row, or media / text / action stacked. */
  direction?: ListItemDirection
  variant?:   ListItemVariant
  size?:      ListItemSize
  /** Element to render — "li" when the item sits inside a list. */
  as?:        "div" | "li"
  children?:  React.ReactNode
}

/* ── ListItem ───────────────────────────────────────────────────── */

export function ListItem({
  direction = "horizontal",
  variant   = "default",
  size      = "md",
  as: As    = "div",
  className,
  children,
  ...rest
}: ListItemProps) {
  return (
    <As
      {...rest}
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      className={cx(styles.root, className)}
    >
      {children}
    </As>
  )
}

/* ── ListItemMedia ──────────────────────────────────────────────── */

export interface ListItemMediaProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Draws the Figma List Item Media: icon (16px glyph), tile (muted tile around a glyph) or
   * image (24px at sm, 40px at md). Omit for a plain slot such as an Avatar or AvatarGroup.
   */
  type?:       ListItemMediaType
  /** Hides the media from assistive tech. Set false for an image that carries meaning. */
  decorative?: boolean
  children?:   React.ReactNode
}

export function ListItemMedia({ type, decorative = true, className, children, ...rest }: ListItemMediaProps) {
  return (
    <span
      {...rest}
      data-type={type}
      aria-hidden={decorative || undefined}
      className={cx(styles.media, className)}
    >
      {children}
    </span>
  )
}

/* ── ListItemContent / Title / Description ──────────────────────── */

export interface ListItemContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ListItemContent({ className, children, ...rest }: ListItemContentProps) {
  return (
    <div {...rest} className={cx(styles.content, className)}>
      {children}
    </div>
  )
}

export interface ListItemTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ListItemTitle({ className, children, ...rest }: ListItemTitleProps) {
  return (
    <p {...rest} className={cx(styles.title, className)}>
      {children}
    </p>
  )
}

export interface ListItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ListItemDescription({ className, children, ...rest }: ListItemDescriptionProps) {
  return (
    <p {...rest} className={cx(styles.description, className)}>
      {children}
    </p>
  )
}

/* ── ListItemActions ────────────────────────────────────────────── */

export interface ListItemActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ListItemActions({ className, children, ...rest }: ListItemActionsProps) {
  return (
    <div {...rest} className={cx(styles.actions, className)}>
      {children}
    </div>
  )
}
