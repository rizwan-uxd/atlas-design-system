"use client"

/**
 * Atlas ButtonGroup — joins related Button actions into one connected control.
 *
 * Orientations: horizontal | vertical
 * Sizes:        sm | md | lg
 * Item variant: outline | secondary | ghost   (ButtonGroupItemVariant — an item-set property in Figma, not on the container)
 * Item position: left | middle | right | top | bottom | single
 * States:       inherited from Button — default · hover · focus-visible · disabled
 *
 * Parts: ButtonGroupButton (text item) · ButtonGroupIconButton (icon-only item).
 * The container derives each item's `position` and passes `size` down to direct
 * item children; an explicit prop on an item wins. Ghost items are always `single`
 * and are spaced apart rather than joined.
 *
 * Accessibility:
 *   - role="group"; callers pass aria-label (or aria-labelledby) to name it
 *   - icon-only items need aria-label (enforced by Button)
 *   - focused item is raised so its focus ring is never covered by a neighbour
 *
 * Logical properties and prefers-reduced-motion are handled in ButtonGroup.module.css.
 */

import React from "react"
import { Button } from "../../primitives/Button/Button"
import type { ButtonProps } from "../../primitives/Button/Button"
import styles from "./ButtonGroup.module.css"

/* ── Types ──────────────────────────────────────────────── */

export type ButtonGroupOrientation = "horizontal" | "vertical"

export type ButtonGroupSize = "sm" | "md" | "lg"

export type ButtonGroupItemVariant = "outline" | "secondary" | "ghost"

export type ButtonGroupPosition =
  | "left"
  | "middle"
  | "right"
  | "top"
  | "bottom"
  | "single"

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction items are laid out in. */
  orientation?: ButtonGroupOrientation
  /** Size passed to every direct item that does not set its own. */
  size?: ButtonGroupSize
  children?: React.ReactNode
}

type ItemBaseProps = Omit<ButtonProps, "variant" | "size" | "iconOnly" | "asChild">

export interface ButtonGroupButtonProps extends ItemBaseProps {
  variant?: ButtonGroupItemVariant
  size?: ButtonGroupSize
  /** Set by ButtonGroup from the item's place in the group; pass it to override. */
  position?: ButtonGroupPosition
}

export interface ButtonGroupIconButtonProps extends ItemBaseProps {
  variant?: ButtonGroupItemVariant
  size?: ButtonGroupSize
  /** Set by ButtonGroup from the item's place in the group; pass it to override. */
  position?: ButtonGroupPosition
  /** Required — there is no visible text. */
  "aria-label"?: string
}

/* ── Helpers ────────────────────────────────────────────── */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

/* ── Items ──────────────────────────────────────────────── */

function Item({
  iconOnly,
  variant = "outline",
  size,
  position = "single",
  className,
  ...rest
}: ButtonGroupButtonProps & { iconOnly: boolean }) {
  /* Ghost has no joined form: it is always a single, spaced-apart item. */
  const resolved: ButtonGroupPosition = variant === "ghost" ? "single" : position
  return (
    <Button
      {...rest}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      className={cx(styles.item, className)}
      data-position={resolved}
    />
  )
}

export function ButtonGroupButton(props: ButtonGroupButtonProps) {
  return <Item {...props} iconOnly={false} />
}

export function ButtonGroupIconButton(props: ButtonGroupIconButtonProps) {
  return <Item {...props} iconOnly />
}

/* ── Container ──────────────────────────────────────────── */

function isItem(
  node: React.ReactNode,
): node is React.ReactElement<ButtonGroupButtonProps> {
  return (
    React.isValidElement(node) &&
    (node.type === ButtonGroupButton || node.type === ButtonGroupIconButton)
  )
}

function positionFor(
  index: number,
  count: number,
  orientation: ButtonGroupOrientation,
): ButtonGroupPosition {
  if (count === 1) return "single"
  const [first, last] =
    orientation === "horizontal"
      ? (["left", "right"] as const)
      : (["top", "bottom"] as const)
  if (index === 0) return first
  if (index === count - 1) return last
  return "middle"
}

export function ButtonGroup({
  orientation = "horizontal",
  size,
  className,
  children,
  role = "group",
  ...rest
}: ButtonGroupProps) {
  const nodes = React.Children.toArray(children)
  const count = nodes.filter(isItem).length
  const spaced = nodes.some(
    (n) => isItem(n) && n.props.variant === "ghost",
  )

  let index = 0
  const items = nodes.map((node) => {
    if (!isItem(node)) return node
    const position = positionFor(index++, count, orientation)
    return React.cloneElement(node, {
      position: node.props.position ?? position,
      size: node.props.size ?? size,
    })
  })

  return (
    <div
      {...rest}
      role={role}
      className={cx(styles.group, className)}
      data-orientation={orientation}
      data-spaced={spaced ? "" : undefined}
    >
      {items}
    </div>
  )
}
