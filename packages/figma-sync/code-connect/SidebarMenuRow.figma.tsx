import figma from "@figma/code-connect"
import { SidebarMenuRow, SidebarMenuRowChild } from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"

// Sidebar Menu Row — node-id=606-2897
figma.connect(SidebarMenuRow, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=606-2897", {
  props: {
    active:      figma.enum("State", { active: true }),
    expanded:    figma.enum("State", { expanded: true }),
    disabled:    figma.enum("State", { disabled: true }),
    hasChildren: figma.boolean("HasChildren"),
    badge:       figma.boolean("HasBadge", { true: <Badge size="sm">3</Badge>, false: undefined }),
  },
  example: ({ active, expanded, disabled, hasChildren, badge }) => (
    <SidebarMenuRow
      icon={<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>}
      active={active}
      expanded={expanded}
      disabled={disabled}
      hasChildren={hasChildren}
      badge={badge}
    >
      Nav label
    </SidebarMenuRow>
  ),
})

// .Sidebar Menu Row Child — node-id=606-2918 (hidden in Figma's Assets panel; only ever
// nested under an expanded Sidebar Menu Row, never inserted standalone)
figma.connect(SidebarMenuRowChild, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=606-2918", {
  props: {
    active:   figma.enum("State", { active: true }),
    disabled: figma.enum("State", { disabled: true }),
    badge:    figma.boolean("HasBadge", { true: <Badge size="sm">3</Badge>, false: undefined }),
  },
  example: ({ active, disabled, badge }) => (
    <SidebarMenuRowChild active={active} disabled={disabled} badge={badge}>
      Child label
    </SidebarMenuRowChild>
  ),
})
