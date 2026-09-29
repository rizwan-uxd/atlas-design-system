import type { ReactNode } from "react"
import type { DatePickerProps, DatePickerTriggerProps, DatePickerInputProps, DatePickerNaturalInputProps, DatePickerContentProps, DatePickerRange, DatePickerMode, DatePickerSide } from "@atlas/ui-web/compositions/DatePicker/DatePicker"

type AssertMode = DatePickerMode extends "single" | "range" ? true : false
const _m: AssertMode = true; void _m

type AssertSide = DatePickerSide extends "bottom" | "top" ? true : false
const _sd: AssertSide = true; void _sd

type AssertRange = DatePickerRange extends [Date | undefined, Date | undefined] ? true : false
const _r: AssertRange = true; void _r

type SingleBranch = Extract<DatePickerProps, { mode?: "single" }>
type AssertSingleShape = {
  mode?: "single"
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  min?: Date
  max?: Date
  disabled?: boolean
  name?: string
  required?: boolean
}
type _CheckSingleProps = AssertSingleShape extends Pick<SingleBranch, keyof AssertSingleShape & keyof SingleBranch> ? true : never
const _s: _CheckSingleProps = true; void _s

type RangeBranch = Extract<DatePickerProps, { mode: "range" }>
type AssertRangeShape = {
  mode: "range"
  value?: DatePickerRange
  defaultValue?: DatePickerRange
  onValueChange?: (range: DatePickerRange) => void
  min?: Date
  max?: Date
  disabled?: boolean
}
type _CheckRangeProps = AssertRangeShape extends Pick<RangeBranch, keyof AssertRangeShape & keyof RangeBranch> ? true : never
const _rp: _CheckRangeProps = true; void _rp

type AssertTriggerShape = {
  invalid?: boolean
  placeholder?: string
  formatDate?: (date: Date) => string
  formatRange?: (range: DatePickerRange) => string
  icon?: boolean | ReactNode
}
type _CheckTriggerProps = AssertTriggerShape extends Pick<DatePickerTriggerProps, keyof AssertTriggerShape & keyof DatePickerTriggerProps> ? true : never
const _t: _CheckTriggerProps = true; void _t

type AssertInputShape = {
  parseDate?: (text: string) => Date | undefined
  formatDate?: (date: Date) => string
  placeholder?: string
  invalid?: boolean
}
type _CheckInputProps = AssertInputShape extends Pick<DatePickerInputProps, keyof AssertInputShape & keyof DatePickerInputProps> ? true : never
const _ip: _CheckInputProps = true; void _ip

type AssertNaturalInputShape = {
  parseText?: (text: string) => Date | undefined
  renderPreview?: (date: Date | undefined) => ReactNode
  placeholder?: string
  invalid?: boolean
}
type _CheckNaturalInputProps = AssertNaturalInputShape extends Pick<DatePickerNaturalInputProps, keyof AssertNaturalInputShape & keyof DatePickerNaturalInputProps> ? true : never
const _nip: _CheckNaturalInputProps = true; void _nip

type AssertCaptionLayout = NonNullable<DatePickerContentProps["captionLayout"]> extends "label" | "dropdown" ? true : false
const _cl: AssertCaptionLayout = true; void _cl

type AssertContentShape = { side?: DatePickerSide; captionLayout?: "label" | "dropdown"; yearRange?: [number, number] }
type _CheckContentProps = AssertContentShape extends Pick<DatePickerContentProps, keyof AssertContentShape & keyof DatePickerContentProps> ? true : never
const _c: _CheckContentProps = true; void _c
