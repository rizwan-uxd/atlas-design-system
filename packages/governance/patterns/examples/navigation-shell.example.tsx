import * as React from "react"
import { Folder, Home, Settings, Users } from "lucide-react"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { SidebarMenuRow } from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"
import { Sidebar, SidebarBody, SidebarCollapseToggle, SidebarFooter, SidebarHeader, SidebarSection } from "@atlas/ui-web/layouts/Sidebar/Sidebar"

type Destination = { id: string; label: string; href: string; icon: React.ReactNode; badge?: string }

const WORKSPACE: Destination[] = [
  { id: "home", label: "Home", href: "/", icon: <Home size={16} /> },
  { id: "projects", label: "Projects", href: "/projects", icon: <Folder size={16} />, badge: "12" },
]
const ADMIN: Destination[] = [
  { id: "members", label: "Members", href: "/members", icon: <Users size={16} /> },
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings size={16} /> },
]

const title = { fontSize: "var(--atlas-text-h1)" }
const muted = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }
const name = { fontSize: "var(--atlas-text-body-sm)" }

// Visually hidden until focused, then shown at the start of the page.
function SkipLink({ target }: { target: string }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <a
      href={`#${target}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={focused
        ? { position: "fixed", insetBlockStart: "var(--atlas-spacing-2)", insetInlineStart: "var(--atlas-spacing-2)", zIndex: 1, padding: "var(--atlas-spacing-2)", background: "var(--atlas-background)", fontSize: "var(--atlas-text-body-sm)" }
        : { position: "absolute", inlineSize: 1, blockSize: 1, overflow: "hidden", clipPath: "inset(50%)" }}
    >
      Skip to content
    </a>
  )
}

export function AppShell({ currentId, trail, pageTitle, loading, collapsed, onToggle, account, children }: {
  currentId: string
  // Parent pages only; the page title is the current breadcrumb segment. Omit for a top-level page.
  trail?: Array<{ label: string; href: string }>
  pageTitle: string
  loading?: boolean
  collapsed: boolean
  onToggle: () => void
  account: { name: string; initials: string }
  children?: React.ReactNode
}) {
  const row = (d: Destination) => (
    <SidebarMenuRow key={d.id} as="a" href={d.href} icon={d.icon} active={d.id === currentId} badge={d.badge}>
      {d.label}
    </SidebarMenuRow>
  )
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", minBlockSize: "100dvh" }}>
      <SkipLink target="main" />
      <Sidebar collapsed={collapsed}>
        <SidebarHeader>
          <span style={name}>Acme</span>
        </SidebarHeader>
        <SidebarBody>
          <SidebarSection label="Workspace">{WORKSPACE.map(row)}</SidebarSection>
          <SidebarSection label="Admin">{ADMIN.map(row)}</SidebarSection>
        </SidebarBody>
        <SidebarFooter>
          <Avatar size="sm" initials={account.initials} alt="" />
          {!collapsed && <span style={name}>{account.name}</span>}
          <SidebarCollapseToggle onClick={onToggle} />
        </SidebarFooter>
      </Sidebar>
      <main id="main" tabIndex={-1} style={{ display: "grid", alignContent: "start", gap: "var(--atlas-spacing-4)", padding: "var(--atlas-spacing-6)" }}>
        {trail && trail.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {trail.map((t) => (
                <React.Fragment key={t.href}>
                  <BreadcrumbItem><BreadcrumbLink href={t.href}>{t.label}</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              ))}
              <BreadcrumbItem><BreadcrumbPage>{pageTitle}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 style={title}>{pageTitle}</h1>
        {loading ? (
          // Loading covers the content only; the navigation stays put.
          <div role="status" aria-label="Loading" style={{ display: "grid", gap: "var(--atlas-spacing-3)" }}>
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          children ?? <p style={muted}>Nothing here yet.</p>
        )}
      </main>
    </div>
  )
}

export function ProjectPage() {
  const [collapsed, setCollapsed] = React.useState(false)
  return (
    <AppShell
      currentId="projects"
      trail={[{ label: "Projects", href: "/projects" }]}
      pageTitle="Website redesign"
      collapsed={collapsed}
      onToggle={() => setCollapsed((c) => !c)}
      account={{ name: "Dana Lee", initials: "DL" }}
    />
  )
}
