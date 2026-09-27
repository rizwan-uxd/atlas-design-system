/**
 * Atlas Sheet — API contract v1
 */

import type { SheetContentProps, SheetSide, SheetSize } from "@atlas/ui-web/compositions/Sheet/Sheet"
import type React from "react"

type AssertSheetSide = SheetSide extends "bottom" | "top" | "start" | "end"
  ? true : false
const _side: AssertSheetSide = true; void _side

type AssertSheetSize = SheetSize extends "sm" | "md" | "lg" | "xl" | "full"
  ? true : false
const _size: AssertSheetSize = true; void _size

type AssertSheetContentShape = {
  side?:                SheetSide
  size?:                SheetSize
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

type _CheckSheetContentProps = AssertSheetContentShape extends Pick<SheetContentProps, keyof AssertSheetContentShape & keyof SheetContentProps>
  ? true : never
const _p: _CheckSheetContentProps = true; void _p
