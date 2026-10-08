import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"

type Invoice = { id: string; customer: string; amount: string; status: "Paid" | "Pending" | "Overdue" }
const tone = { Paid: "success", Pending: "warning", Overdue: "danger" } as const

export function InvoiceTable({ rows, onDelete }: { rows: Invoice[]; onDelete: (ids: string[]) => void }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [confirming, setConfirming] = React.useState(false)
  const visible = rows.filter((r) => selected.has(r.id))
  const all: boolean | "indeterminate" = visible.length === rows.length && rows.length > 0 ? true : visible.length > 0 ? "indeterminate" : false
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <>
      {visible.length > 0 && (
        <div role="region" aria-label="Bulk actions" style={{ display: "flex", gap: "var(--atlas-spacing-3)" }}>
          <span aria-live="polite">{visible.length} selected</span>
          <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>Delete</Button>
        </div>
      )}
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead><Checkbox aria-label="Select all" checked={all}
              onCheckedChange={(c) => setSelected(c === true ? new Set(rows.map((r) => r.id)) : new Set())} /></TableHead>
            <TableHead>Customer</TableHead>
            <TableHead align="end">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} selected={selected.has(r.id)}>
              <TableCell><Checkbox aria-label={`Select ${r.customer}`} checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} /></TableCell>
              <TableCell>{r.customer}</TableCell>
              <TableCell align="end">{r.amount}</TableCell>
              <TableCell><Badge variant={tone[r.status]} size="sm">{r.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
