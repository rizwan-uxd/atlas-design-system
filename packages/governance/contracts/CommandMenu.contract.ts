/**
 * Atlas CommandMenu — API contract v1
 */

import type React from "react"
import type {
  CommandMenuContentProps,
  CommandMenuFilter,
  CommandMenuGroupProps,
  CommandMenuItemProps,
  CommandMenuProps,
  CommandMenuSize,
} from "@atlas/ui-web/compositions/CommandMenu/CommandMenu"

type AssertCommandMenuSize = CommandMenuSize extends "md" | "lg" ? true : false
const _s: AssertCommandMenuSize = true; void _s

type AssertCommandMenuShape = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  hotkey?: string | false
}
type _CheckCommandMenuProps = AssertCommandMenuShape extends Pick<CommandMenuProps, keyof AssertCommandMenuShape & keyof CommandMenuProps> ? true : never
const _p: _CheckCommandMenuProps = true; void _p

type AssertContentShape = {
  size?: CommandMenuSize
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  filter?: CommandMenuFilter | false
  loading?: boolean
  emptyText?: string
  closeOnSelect?: boolean
  className?: string
}
type _CheckContentProps = AssertContentShape extends Pick<CommandMenuContentProps, keyof AssertContentShape & keyof CommandMenuContentProps> ? true : never
const _c: _CheckContentProps = true; void _c

type AssertGroupShape = { heading?: React.ReactNode }
type _CheckGroupProps = AssertGroupShape extends Pick<CommandMenuGroupProps, keyof AssertGroupShape & keyof CommandMenuGroupProps> ? true : never
const _g: _CheckGroupProps = true; void _g

type AssertItemShape = {
  value?: string
  keywords?: string[]
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  onSelect?: (value: string) => void
}
type _CheckItemProps = AssertItemShape extends Pick<CommandMenuItemProps, keyof AssertItemShape & keyof CommandMenuItemProps> ? true : never
const _i: _CheckItemProps = true; void _i

/** The roles are fixed so the combobox and listbox pattern cannot be broken from outside. */
type AssertItemRoleFixed = "role" extends keyof CommandMenuItemProps ? never : true
const _ir: AssertItemRoleFixed = true; void _ir
type AssertGroupRoleFixed = "role" extends keyof CommandMenuGroupProps ? never : true
const _gr: AssertGroupRoleFixed = true; void _gr
