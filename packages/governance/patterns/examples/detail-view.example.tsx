import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Divider } from "@atlas/ui-web/primitives/Divider/Divider"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { TabsList, TabsPanel, TabsRoot, TabsTrigger } from "@atlas/ui-web/patterns/Tabs/Tabs"

type Order = {
  id: string
  customer: string
  status: "Paid" | "Pending" | "Failed"
  placedOn: string
  email?: string
  total: string
}

const STATUS_VARIANT = { Paid: "success", Pending: "info", Failed: "danger" } as const

const title = { fontSize: "var(--atlas-text-h1)" }
const label = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }
const value = { fontSize: "var(--atlas-text-body)", margin: 0 }

// A fact is a dt/dd pair. A missing value shows an em dash so the layout never shifts between records.
function Fact({ term, children }: { term: string; children?: React.ReactNode }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(8rem, 1fr) 2fr", gap: "var(--atlas-spacing-4)" }}>
        <dt style={label}>{term}</dt>
        <dd style={value}>{children ?? "—"}</dd>
      </div>
      <Divider decorative />
    </>
  )
}

export function OrderDetail({ order, loading, deleting, onDelete }: {
  order?: Order
  loading?: boolean
  deleting?: boolean
  onDelete: () => void
}) {
  // Loading covers the record only; the page chrome around it stays put.
  if (loading || !order) {
    return (
      <div role="status" aria-label="Loading order" style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--atlas-spacing-3)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
          <h1 style={title}>Order {order.id}</h1>
          <Badge variant={STATUS_VARIANT[order.status]} size="md">{order.status}</Badge>
        </div>
        <div style={{ display: "flex", gap: "var(--atlas-spacing-3)" }}>
          <Button variant="outline">Download invoice</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" loading={deleting}>Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent variant="destructive">
              <AlertDialogTitle>Delete order {order.id}?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the order for {order.customer} and its invoice. It cannot be undone.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete order</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <TabsRoot variant="line" defaultValue="overview">
        <TabsList aria-label={`Order ${order.id}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsPanel value="overview">
          <div style={{ display: "grid", gap: "var(--atlas-spacing-6)", paddingBlockStart: "var(--atlas-spacing-4)" }}>
            <Card variant="outlined">
              <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
              <CardContent>
                <dl style={{ display: "grid", gap: "var(--atlas-spacing-3)", margin: 0 }}>
                  <Fact term="Name">{order.customer}</Fact>
                  <Fact term="Email">{order.email}</Fact>
                </dl>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
              <CardContent>
                <dl style={{ display: "grid", gap: "var(--atlas-spacing-3)", margin: 0 }}>
                  <Fact term="Placed on">{order.placedOn}</Fact>
                  <Fact term="Total">{order.total}</Fact>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsPanel>
        <TabsPanel value="activity">
          <p style={{ ...label, paddingBlockStart: "var(--atlas-spacing-4)" }}>No activity yet.</p>
        </TabsPanel>
      </TabsRoot>
    </div>
  )
}
