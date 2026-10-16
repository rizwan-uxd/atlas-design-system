import * as React from "react"
import { Bell } from "lucide-react"
import { EmptyState } from "@atlas/ui-web/compositions/EmptyState/EmptyState"
import { ListItem, ListItemActions, ListItemContent, ListItemDescription, ListItemMedia, ListItemTitle } from "@atlas/ui-web/compositions/ListItem/ListItem"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { TabsList, TabsRoot, TabsTrigger } from "@atlas/ui-web/patterns/Tabs/Tabs"

type Notification = {
  id: string
  actor: { name: string; initials: string }
  title: string
  href: string
  when: string
  read: boolean
}

const title = { fontSize: "var(--atlas-text-h1)" }
const muted = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }
const visuallyHidden: React.CSSProperties = { position: "absolute", inlineSize: 1, blockSize: 1, overflow: "hidden", clipPath: "inset(50%)" }

export function NotificationsCenter({ items, loading, onChange, onMarkAllRead }: {
  items: Notification[]
  loading?: boolean
  /** Persists one item's read state. */
  onChange: (id: string, read: boolean) => void
  onMarkAllRead: () => void
}) {
  const [view, setView] = React.useState("all")
  const [announce, setAnnounce] = React.useState("")
  const unread = items.filter((n) => !n.read)
  const shown = view === "unread" ? unread : items

  const toggle = (n: Notification) => {
    onChange(n.id, !n.read)
    setAnnounce(n.read ? "Marked as unread" : "Marked as read")
  }

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-4)", maxInlineSize: "40rem" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--atlas-spacing-3)" }}>
        <h1 style={title}>Notifications</h1>
        <Button variant="ghost" size="sm" disabled={unread.length === 0} onClick={onMarkAllRead}>Mark all as read</Button>
      </header>

      <TabsRoot variant="line" value={view} onValueChange={setView}>
        <TabsList aria-label="Notification views">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">{`Unread ${unread.length}`}</TabsTrigger>
        </TabsList>
      </TabsRoot>

      <div role="status" style={visuallyHidden}>{announce}</div>

      {loading ? (
        // Loading covers the list only; the header and tabs stay.
        <div role="status" aria-label="Loading notifications" style={{ display: "grid", gap: "var(--atlas-spacing-2)" }}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          size="md"
          icon={<Bell />}
          title={view === "unread" ? "No unread notifications" : "You're all caught up"}
          action={view === "unread" ? <Button variant="outline" onClick={() => setView("all")}>View all</Button> : undefined}
        />
      ) : (
        <ul aria-label={view === "unread" ? "Unread notifications" : "All notifications"} style={{ display: "grid", gap: "var(--atlas-spacing-2)", listStyle: "none", margin: 0, padding: 0 }}>
          {shown.map((n) => (
            <ListItem key={n.id} as="li" variant={n.read ? "default" : "muted"} size="md">
              <ListItemMedia>
                <Avatar size="sm" initials={n.actor.initials} alt="" />
              </ListItemMedia>
              <ListItemContent>
                <ListItemTitle>
                  {/* The title is a real link; opening it also marks the item read. */}
                  <a href={n.href} onClick={() => { if (!n.read) onChange(n.id, true) }}>{n.title}</a>
                </ListItemTitle>
                <ListItemDescription>
                  {!n.read && "Unread \u00b7 "}
                  <time>{n.when}</time>
                </ListItemDescription>
              </ListItemContent>
              <ListItemActions>
                <Button variant="ghost" size="sm" aria-label={`Mark “${n.title}” as ${n.read ? "unread" : "read"}`} onClick={() => toggle(n)}>
                  {n.read ? "Mark as unread" : "Mark as read"}
                </Button>
              </ListItemActions>
            </ListItem>
          ))}
        </ul>
      )}
      <p style={muted}>Notifications are kept for 30 days.</p>
    </div>
  )
}
