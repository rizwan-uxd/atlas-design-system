/**
 * Atlas Alert — API contract v1
 */

import type { AlertProps, AlertVariant, AlertSize } from "@atlas/ui-web/compositions/Alert/Alert"
import type React from "react"

type AssertAlertVariant = AlertVariant extends
  | "info" | "success" | "warning" | "danger" | "neutral"
  ? true : false
const _v: AssertAlertVariant = true; void _v

type AssertAlertSize = AlertSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertAlertSize = true; void _s

type AssertAlertShape = {
  variant?:     AlertVariant
  size?:        AlertSize
  title?:       React.ReactNode
  description?: React.ReactNode
  icon?:        React.ReactNode
  hideIcon?:    boolean
  actions?:     React.ReactNode
  dismissible?: boolean
  onDismiss?:   () => void
  className?:   string
  children?:    React.ReactNode
}

type _CheckAlertProps = AssertAlertShape extends Pick<AlertProps, keyof AssertAlertShape & keyof AlertProps>
  ? true : never
const _p: _CheckAlertProps = true; void _p
