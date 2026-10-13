import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"

type Invoice = { id: string; customer: string; amount: string; status: "Paid" | "Pending" | "Overdue" }
const tone = { Paid: "success", Pending: "warning", Overdue: "danger" } as const

export function InvoiceTable({ rows, loading, onDelete }: { rows: Invoice[]; loading?: boolean; onDelete: (ids: string[]) => void }) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [confirming, setConfirming] = React.useState(false)
  // Selection scope is the visible (filtered) rows
  const shown = rows.filter((r) => (status === "all" || r.status === status) && r.customer.toLowerCase().includes(query.toLowerCase()))
  const visible = shown.filter((r) => selected.has(r.id))
  const all: boolean | "indeterminate" = visible.length === shown.length && shown.length > 0 ? true : visible.length > 0 ? "indeterminate" : false
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--atlas-spacing-3)" }}>
        <Input aria-label="Search invoices" placeholder="Search invoices" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Status"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* The bulk bar sits under the toolbar and exists only while something is selected */}
      {visible.length > 0 && (
        <div role="region" aria-label="Bulk actions" style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
          <span aria-live="polite">{visible.length} selected</span>
          <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>Delete</Button>
        </div>
      )}
      {!loading && shown.length === 0 ? (
        <div role="status" style={{ display: "grid", justifyItems: "center", gap: "var(--atlas-spacing-3)", paddingBlock: "var(--atlas-spacing-12)" }}>
          <h2 style={{ fontSize: "var(--atlas-text-h3)" }}>No results for “{query}”</h2>
          <p style={{ fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }}>Try a different search, or clear the filters to see every invoice.</p>
          <Button variant="outline" onClick={() => { setQuery(""); setStatus("all") }}>Clear filters</Button>
        </div>
      ) : (
      <div style={{ overflowX: "auto" }} aria-busy={loading}>
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead><Checkbox aria-label="Select all" checked={all}
              onCheckedChange={(c) => setSelected(c === true ? new Set(shown.map((r) => r.id)) : new Set())} /></TableHead>
            <TableHead>Customer</TableHead>
            <TableHead align="end">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? Array.from({ length: 5 }, (_, i) => (
            <TableRow key={i}><TableCell><Skeleton /></TableCell><TableCell><Skeleton /></TableCell><TableCell><Skeleton /></TableCell><TableCell><Skeleton /></TableCell></TableRow>
          )) : shown.map((r) => (
            <TableRow key={r.id} selected={selected.has(r.id)}>
              <TableCell><Checkbox aria-label={`Select ${r.customer}`} checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} /></TableCell>
              <TableCell>{r.customer}</TableCell>
              <TableCell align="end">{r.amount}</TableCell>
              <TableCell><Badge variant={tone[r.status]} size="sm">{r.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      )}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent variant="destructive">
          <AlertDialogTitle>Delete {visible.length} invoice{visible.length === 1 ? "" : "s"}?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes the selected invoices and cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete([...selected]); setSelected(new Set()) }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
