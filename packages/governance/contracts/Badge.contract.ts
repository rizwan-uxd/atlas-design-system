/**
 * Atlas Badge — API contract v1
 */

import type { BadgeProps, BadgeVariant, BadgeAppearance, BadgeSize } from "@atlas/ui-web/primitives/Badge/Badge"
import type React from "react"

type AssertBadgeVariant = BadgeVariant extends
  | "neutral" | "primary" | "success" | "warning" | "danger" | "info"
  ? true : false
const _v: AssertBadgeVariant = true; void _v

type AssertBadgeAppearance = BadgeAppearance extends "default" | "outline"
  ? true : false
const _a: AssertBadgeAppearance = true; void _a

type AssertBadgeSize = BadgeSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertBadgeSize = true; void _s

type AssertBadgeShape = {
  variant?:      BadgeVariant
  appearance?:   BadgeAppearance
  size?:         BadgeSize
  square?:       boolean
  dot?:          boolean
  leadingIcon?:  React.ReactNode
  trailingIcon?: React.ReactNode
  removable?:    boolean
  onRemove?:     () => void
  removeLabel?:  string
  onClick?:      () => void
  disabled?:     boolean
  className?:    string
  children:      React.ReactNode   // required — Badge always needs visible content
}

type _CheckBadgeProps = AssertBadgeShape extends Pick<BadgeProps, keyof AssertBadgeShape & keyof BadgeProps>
  ? true : never
const _p: _CheckBadgeProps = true; void _p
