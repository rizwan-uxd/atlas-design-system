/**
 * Atlas ButtonGroup — API contract v1
 */

import type {
  ButtonGroupProps,
  ButtonGroupOrientation,
  ButtonGroupSize,
  ButtonGroupItemVariant,
  ButtonGroupPosition,
  ButtonGroupButtonProps,
  ButtonGroupIconButtonProps,
} from "@atlas/ui-web/compositions/ButtonGroup/ButtonGroup"
import type React from "react"

type AssertOrientation = ButtonGroupOrientation extends "horizontal" | "vertical" ? true : false
const _o: AssertOrientation = true; void _o

type AssertSize = ButtonGroupSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertSize = true; void _s

type AssertVariant = ButtonGroupItemVariant extends "outline" | "secondary" | "ghost" ? true : false
const _v: AssertVariant = true; void _v

type AssertPosition = ButtonGroupPosition extends
  | "left" | "middle" | "right" | "top" | "bottom" | "single"
  ? true : false
const _pos: AssertPosition = true; void _pos

type AssertGroupShape = {
  orientation?: ButtonGroupOrientation
  size?:        ButtonGroupSize
  className?:   string
  children?:    React.ReactNode
}
type _CheckGroupProps = AssertGroupShape extends Pick<ButtonGroupProps, keyof AssertGroupShape & keyof ButtonGroupProps>
  ? true : never
const _gp: _CheckGroupProps = true; void _gp

type AssertItemShape = {
  variant?:  ButtonGroupItemVariant
  size?:     ButtonGroupSize
  position?: ButtonGroupPosition
  disabled?: boolean
}
type _CheckButtonProps = AssertItemShape extends Pick<ButtonGroupButtonProps, keyof AssertItemShape & keyof ButtonGroupButtonProps>
  ? true : never
const _bp: _CheckButtonProps = true; void _bp
type _CheckIconButtonProps = AssertItemShape extends Pick<ButtonGroupIconButtonProps, keyof AssertItemShape & keyof ButtonGroupIconButtonProps>
  ? true : never
const _ip: _CheckIconButtonProps = true; void _ip
