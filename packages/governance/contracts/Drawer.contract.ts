/**
 * Atlas Drawer — API contract v1
 */

import type { DrawerContentProps, DrawerSide, DrawerSize } from "@atlas/ui-web/compositions/Drawer/Drawer"
import type React from "react"

type AssertDrawerSide = DrawerSide extends "start" | "end"
  ? true : false
const _side: AssertDrawerSide = true; void _side

type AssertDrawerSize = DrawerSize extends "sm" | "md" | "lg" | "xl" | "full"
  ? true : false
const _size: AssertDrawerSize = true; void _size

type AssertDrawerContentShape = {
  side?:                DrawerSide
  size?:                DrawerSize
  id?:                  string
  closeOnEscape?:       boolean
  closeOnOverlayClick?: boolean
  className?:           string
  children?:            React.ReactNode
}

type _CheckDrawerContentProps = AssertDrawerContentShape extends Pick<DrawerContentProps, keyof AssertDrawerContentShape & keyof DrawerContentProps>
  ? true : never
const _p: _CheckDrawerContentProps = true; void _p
