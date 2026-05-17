/**
 * Atlas Badge — API contract v1
 */

import type { BadgeProps, BadgeVariant, BadgeSize, BadgeIntent } from "@atlas/ui-web/primitives/Badge/Badge"
import type React from "react"

type AssertBadgeVariant = BadgeVariant extends
  | "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
  ? true : false
const _v: AssertBadgeVariant = true; void _v

type AssertBadgeSize = BadgeSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertBadgeSize = true; void _s

type AssertBadgeIntent = BadgeIntent extends "default" | "success" | "warning" | "danger" | "info"
  ? true : false
const _i: AssertBadgeIntent = true; void _i

type AssertBadgeShape = {
  variant?:      BadgeVariant
  size?:         BadgeSize
  intent?:       BadgeIntent
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
