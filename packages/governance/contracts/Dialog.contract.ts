/**
 * Atlas Dialog — API contract v1
 */

import type { DialogContentProps, DialogVariant, DialogSize } from "@atlas/ui-web/compositions/Dialog/Dialog"
import type React from "react"

type AssertDialogVariant = DialogVariant extends "default" | "destructive"
  ? true : false
const _variant: AssertDialogVariant = true; void _variant

type AssertDialogSize = DialogSize extends "sm" | "md" | "lg" | "xl" | "full"
  ? true : false
const _size: AssertDialogSize = true; void _size

type AssertDialogContentShape = {
  variant?:             DialogVariant
  size?:                DialogSize
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

type _CheckDialogContentProps = AssertDialogContentShape extends Pick<DialogContentProps, keyof AssertDialogContentShape & keyof DialogContentProps>
  ? true : never
const _p: _CheckDialogContentProps = true; void _p
