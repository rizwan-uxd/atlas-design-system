import type { SelectProps, SelectTriggerProps, SelectItemProps, SelectSize } from "@atlas/ui-web/primitives/Select/Select"

type AssertSelectSize = SelectSize extends "sm" | "md" ? true : false
const _s: AssertSelectSize = true; void _s

type AssertSelectShape = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  disabled?: boolean
}
type _CheckSelectProps = AssertSelectShape extends Pick<SelectProps, keyof AssertSelectShape & keyof SelectProps> ? true : never
const _p: _CheckSelectProps = true; void _p

type AssertTriggerShape = { size?: SelectSize; invalid?: boolean }
type _CheckTriggerProps = AssertTriggerShape extends Pick<SelectTriggerProps, keyof AssertTriggerShape & keyof SelectTriggerProps> ? true : never
const _t: _CheckTriggerProps = true; void _t

type AssertItemShape = { value: string; disabled?: boolean }
type _CheckItemProps = AssertItemShape extends Pick<SelectItemProps, keyof AssertItemShape & keyof SelectItemProps> ? true : never
const _i: _CheckItemProps = true; void _i
