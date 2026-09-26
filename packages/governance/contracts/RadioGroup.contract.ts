/**
 * Atlas RadioGroup — API contract v1
 */

import type {
  RadioGroupProps,
  RadioGroupItemProps,
  RadioGroupVariant,
  RadioGroupSize,
  RadioGroupDirection,
} from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"

type AssertRadioGroupVariant = RadioGroupVariant extends "default" | "card" ? true : false
const _v: AssertRadioGroupVariant = true; void _v

type AssertRadioGroupSize = RadioGroupSize extends "sm" | "md" ? true : false
const _s: AssertRadioGroupSize = true; void _s

type AssertRadioGroupDirection = RadioGroupDirection extends "vertical" | "horizontal" ? true : false
const _d: AssertRadioGroupDirection = true; void _d

type AssertRadioGroupPropsShape = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  variant?: RadioGroupVariant
  size?: RadioGroupSize
  direction?: RadioGroupDirection
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}

type _CheckRadioGroupProps = AssertRadioGroupPropsShape extends Pick<RadioGroupProps, keyof AssertRadioGroupPropsShape & keyof RadioGroupProps>
  ? true : never
const _p: _CheckRadioGroupProps = true; void _p

type AssertRadioGroupItemPropsShape = {
  value: string
  label?: React.ReactNode
  description?: React.ReactNode
  variant?: RadioGroupVariant
  size?: RadioGroupSize
  disabled?: boolean
  invalid?: boolean
}

type _CheckRadioGroupItemProps = AssertRadioGroupItemPropsShape extends Pick<RadioGroupItemProps, keyof AssertRadioGroupItemPropsShape & keyof RadioGroupItemProps>
  ? true : never
const _i: _CheckRadioGroupItemProps = true; void _i
