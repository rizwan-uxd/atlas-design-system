import type { SidebarProps } from "@atlas/ui-web/layouts/Sidebar/Sidebar"

type AssertSidebarShape = {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  children?: React.ReactNode
}
type _CheckSidebarProps = AssertSidebarShape extends Pick<SidebarProps, keyof AssertSidebarShape & keyof SidebarProps> ? true : never
const _p: _CheckSidebarProps = true; void _p
