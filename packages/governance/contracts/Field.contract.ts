/**
 * Atlas Field — API contract v1
 */

import type { FieldProps, FieldSize, FieldControlProps } from "@atlas/ui-web/compositions/Field/Field"
import type React from "react"

type AssertFieldSize = FieldSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertFieldSize = true; void _s

type AssertFieldShape = {
  size?: FieldSize
  label: React.ReactNode
  required?: boolean
  optional?: boolean
  helpText?: React.ReactNode
  error?: React.ReactNode
  disabled?: boolean
  id?: string
  labelAction?: React.ReactNode
  children: (control: FieldControlProps) => React.ReactNode
}
type _CheckFieldProps = AssertFieldShape extends Pick<FieldProps, keyof AssertFieldShape & keyof FieldProps> ? true : never
const _p: _CheckFieldProps = true; void _p

type AssertControlShape = {
  id: string
  invalid: boolean
  disabled: boolean
  "aria-describedby"?: string
  "aria-required"?: true
}
type _CheckControl = AssertControlShape extends FieldControlProps ? (FieldControlProps extends AssertControlShape ? true : never) : never
const _c: _CheckControl = true; void _c
