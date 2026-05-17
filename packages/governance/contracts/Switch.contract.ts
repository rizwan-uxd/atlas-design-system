/**
 * Atlas Switch — API contract v1
 */

import type { SwitchProps, SwitchSize } from "@atlas/ui-web/primitives/Switch/Switch"
import type React from "react"

type AssertSwitchSize = SwitchSize extends "sm" | "md"
  ? true : false
const _s: AssertSwitchSize = true; void _s

type AssertSwitchShape = {
  size?:             SwitchSize
  checked?:          boolean
  defaultChecked?:   boolean
  onCheckedChange?:  (checked: boolean) => void
  disabled?:         boolean
  label?:            React.ReactNode
  description?:      React.ReactNode
  required?:         boolean
  id?:               string
}

type _CheckSwitchProps = AssertSwitchShape extends Pick<SwitchProps, keyof AssertSwitchShape & keyof SwitchProps>
  ? true : never
const _p: _CheckSwitchProps = true; void _p
