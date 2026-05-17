/**
 * Atlas Input — API contract v1
 */

import type { InputProps, InputVariant, InputSize } from "@atlas/ui-web/primitives/Input/Input"
import type React from "react"

type AssertInputVariant = InputVariant extends "default" | "filled" | "unstyled"
  ? true : false
const _v: AssertInputVariant = true; void _v

type AssertInputSize = InputSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertInputSize = true; void _s

type AssertInputShape = {
  variant?:      InputVariant
  size?:         InputSize
  invalid?:      boolean
  loading?:      boolean
  leadingIcon?:  React.ReactNode
  trailingIcon?: React.ReactNode
  disabled?:     boolean
  placeholder?:  string
}

type _CheckInputProps = AssertInputShape extends Pick<InputProps, keyof AssertInputShape & keyof InputProps>
  ? true : never
const _p: _CheckInputProps = true; void _p
