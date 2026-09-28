/**
 * Atlas SidebarMenuRow — API contract v1
 */

import type {
  SidebarMenuRowProps,
  SidebarMenuRowChildProps,
} from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import type React from "react"

type AssertSidebarMenuRowPropsShape = {
  as?:          "button" | "a"
  icon?:        React.ReactNode
  active?:      boolean
  hasChildren?: boolean
  expanded?:    boolean
  badge?:       React.ReactNode
  disabled?:    boolean
}

type _CheckSidebarMenuRowProps = AssertSidebarMenuRowPropsShape extends Pick<SidebarMenuRowProps, keyof AssertSidebarMenuRowPropsShape & keyof SidebarMenuRowProps>
  ? true : never
const _p: _CheckSidebarMenuRowProps = true; void _p

type AssertSidebarMenuRowChildPropsShape = {
  as?:       "button" | "a"
  active?:   boolean
  badge?:    React.ReactNode
  disabled?: boolean
}

type _CheckSidebarMenuRowChildProps = AssertSidebarMenuRowChildPropsShape extends Pick<SidebarMenuRowChildProps, keyof AssertSidebarMenuRowChildPropsShape & keyof SidebarMenuRowChildProps>
  ? true : never
const _c: _CheckSidebarMenuRowChildProps = true; void _c
