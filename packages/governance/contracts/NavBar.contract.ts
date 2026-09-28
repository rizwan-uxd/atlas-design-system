/**
 * Atlas NavBar — API contract v1
 */

import type { NavBarProps, NavBarVariant, NavBarSize, NavLink } from "@atlas/ui-web/layouts/NavBar/NavBar"
import type React from "react"

type AssertNavBarVariant = NavBarVariant extends "default" | "transparent" | "bordered" | "floating"
  ? true : false
const _v: AssertNavBarVariant = true; void _v

type AssertNavBarSize = NavBarSize extends "sm" | "md" | "lg"
  ? true : false
const _s: AssertNavBarSize = true; void _s

type AssertNavBarShape = {
  variant?:      NavBarVariant
  size?:         NavBarSize
  brand?:        React.ReactNode
  brandHref?:    string
  links?:        NavLink[]
  breadcrumb?:   React.ReactNode
  search?:       React.ReactNode
  actions?:      React.ReactNode
  hideOnScroll?: boolean
  className?:    string
}

type _CheckNavBarProps = AssertNavBarShape extends Pick<NavBarProps, keyof AssertNavBarShape & keyof NavBarProps>
  ? true : never
const _p: _CheckNavBarProps = true; void _p
