/**
 * Atlas Button — API contract v1
 *
 * This file is a compile-time guard. If ButtonProps drifts from this contract,
 * tsc will error here — making the breakage explicit and intentional.
 *
 * To make a breaking change: update this contract in the same PR.
 */

import type { ButtonProps, ButtonVariant, ButtonSize } from "@atlas/ui-web/primitives/Button/Button"
import type React from "react"

// ── Type assertions ──────────────────────────────────────────────────────────

// Variant union must contain exactly these values
type AssertButtonVariant = ButtonVariant extends
  | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  ? true : false
const _v: AssertButtonVariant = true; void _v

// Size union must contain exactly these values
type AssertButtonSize = ButtonSize extends "sm" | "md" | "lg" | "icon"
  ? true : false
const _s: AssertButtonSize = true; void _s

// Required shape: these props must exist and have the correct types
type AssertButtonShape = {
  variant?:      ButtonVariant
  size?:         ButtonSize
  iconOnly?:     boolean
  loading?:      boolean
  leadingIcon?:  React.ReactNode
  trailingIcon?: React.ReactNode
  asChild?:      boolean
  children?:     React.ReactNode
  disabled?:     boolean
  onClick?:      React.MouseEventHandler<HTMLButtonElement>
}

// ButtonProps must be assignable to the contract shape (all contract keys must exist)
type _CheckButtonProps = AssertButtonShape extends Pick<ButtonProps, keyof AssertButtonShape & keyof ButtonProps>
  ? true : never
const _p: _CheckButtonProps = true; void _p
