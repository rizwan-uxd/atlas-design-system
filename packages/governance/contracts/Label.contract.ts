/**
 * Atlas Label — API contract v1
 */

import type { LabelProps, LabelVariant, LabelSize } from "@atlas/ui-web/primitives/Label/Label"
import type React from "react"

type AssertLabelVariant = LabelVariant extends "default" | "inline"
  ? true : false
const _v: AssertLabelVariant = true; void _v

type AssertLabelSize = LabelSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertLabelSize = true; void _s

type AssertLabelShape = {
  variant?:  LabelVariant
  size?:     LabelSize
  required?: boolean
  optional?: boolean
  disabled?: boolean
  invalid?:  boolean
  children:  React.ReactNode
}

type _CheckLabelProps = AssertLabelShape extends Pick<LabelProps, keyof AssertLabelShape & keyof LabelProps>
  ? true : never
const _p: _CheckLabelProps = true; void _p
