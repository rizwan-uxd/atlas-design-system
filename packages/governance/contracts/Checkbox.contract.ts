/**
 * Atlas Checkbox — API contract v1
 */

import type { CheckboxProps, CheckboxVariant, CheckboxSize } from "@atlas/ui-web/primitives/Checkbox/Checkbox"
import type React from "react"

type AssertCheckboxVariant = CheckboxVariant extends "default" | "card"
  ? true : false
const _v: AssertCheckboxVariant = true; void _v

type AssertCheckboxSize = CheckboxSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertCheckboxSize = true; void _s

type AssertCheckboxShape = {
  variant?:          CheckboxVariant
  size?:             CheckboxSize
  checked?:          boolean | "indeterminate"
  defaultChecked?:   boolean | "indeterminate"
  onCheckedChange?:  (checked: boolean | "indeterminate") => void
  disabled?:         boolean
  invalid?:          boolean
  required?:         boolean
  label?:            React.ReactNode
  description?:      React.ReactNode
  id?:               string
}

type _CheckCheckboxProps = AssertCheckboxShape extends Pick<CheckboxProps, keyof AssertCheckboxShape & keyof CheckboxProps>
  ? true : never
const _p: _CheckCheckboxProps = true; void _p
