/**
 * Atlas AlertDialog — API contract v1
 */

import type { AlertDialogContentProps, AlertDialogVariant, AlertDialogSize } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import type React from "react"

type AssertAlertDialogVariant = AlertDialogVariant extends "default" | "destructive"
  ? true : false
const _variant: AssertAlertDialogVariant = true; void _variant

type AssertAlertDialogSize = AlertDialogSize extends "sm" | "md" | "lg"
  ? true : false
const _size: AssertAlertDialogSize = true; void _size

type AssertAlertDialogContentShape = {
  variant?:   AlertDialogVariant
  size?:      AlertDialogSize
  state?:     "default" | "loading"
  id?:        string
  className?: string
  children?:  React.ReactNode
}

type _CheckAlertDialogContentProps = AssertAlertDialogContentShape extends Pick<AlertDialogContentProps, keyof AssertAlertDialogContentShape & keyof AlertDialogContentProps>
  ? true : never
const _p: _CheckAlertDialogContentProps = true; void _p
