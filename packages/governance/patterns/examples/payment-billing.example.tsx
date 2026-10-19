import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@atlas/ui-web/compositions/Dialog/Dialog"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { ListItem, ListItemActions, ListItemContent, ListItemDescription, ListItemTitle } from "@atlas/ui-web/compositions/ListItem/ListItem"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"

type Invoice = { id: string; date: string; description: string; amount: string; status: "Paid" | "Failed" | "Refunded" }

const INVOICE_VARIANT = { Paid: "success", Failed: "danger", Refunded: "neutral" } as const

const title = { fontSize: "var(--atlas-text-h1)" }
const planName = { fontSize: "var(--atlas-text-h3)" }
const amount = { fontSize: "var(--atlas-text-h2)", fontVariantNumeric: "tabular-nums" as const }
const muted = { fontSize: "var(--atlas-text-body-sm)", color: "var(--atlas-foreground-muted)" }

export function BillingPage({ plan, card, invoices, pastDue, loading, onUpdateCard, onCancel }: {
  plan: { name: string; price: string; interval: string; renews: string }
  card?: { brand: string; last4: string; expires: string }
  invoices: Invoice[]
  pastDue?: boolean
  loading?: boolean
  /** Receives the provider's token, never raw card data. Rejects with a readable reason on failure. */
  onUpdateCard: (token: string, billingName: string) => Promise<void>
  onCancel: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [failure, setFailure] = React.useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setFailure(null)
    try {
      // The provider's hosted fields turn the card details into a token; the app never reads them.
      await onUpdateCard("tok_from_hosted_fields", name)
      setOpen(false)
    } catch (e) {
      // Keep the Dialog open and the typed name so the user can retry.
      setFailure(e instanceof Error ? e.message : "The card could not be updated.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)", maxInlineSize: "48rem" }}>
      <h1 style={title}>Billing</h1>

      {pastDue && (
        <Alert
          variant="danger"
          title="Your last payment failed"
          description="We could not charge the card ending 4242, so your plan may be paused. Update your payment method to keep access."
          actions={<Button variant="outline" size="sm" onClick={() => setOpen(true)}>Update payment method</Button>}
        />
      )}

      {loading ? (
        <div role="status" aria-label="Loading billing" style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <>
          <Card variant="outlined">
            <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--atlas-spacing-4)" }}>
                <div style={{ display: "grid", gap: "var(--atlas-spacing-1)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
                    <span style={planName}>{plan.name}</span>
                    <Badge variant={pastDue ? "danger" : "success"} size="md">{pastDue ? "Past due" : "Active"}</Badge>
                  </span>
                  <span style={amount}>{plan.price}<span style={muted}> / {plan.interval}</span></span>
                  <span style={muted}>Renews on <time>{plan.renews}</time></span>
                </div>
                <Button variant="outline">Change plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader><CardTitle>Payment method</CardTitle></CardHeader>
            <CardContent>
              <ListItem variant="default" size="md">
                <ListItemContent>
                  <ListItemTitle>{card ? `${card.brand} ending ${card.last4}` : "No payment method"}</ListItemTitle>
                  <ListItemDescription>{card ? `Expires ${card.expires}` : "Add a card to keep your plan active."}</ListItemDescription>
                </ListItemContent>
                <ListItemActions>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger><Button variant="outline">{card ? "Update" : "Add payment method"}</Button></DialogTrigger>
                    <DialogContent size="md">
                      <DialogHeader><DialogTitle>Payment method</DialogTitle></DialogHeader>
                      <DialogBody>
                        <DialogDescription>Card details are entered in the secure fields below and never reach this app.</DialogDescription>
                        {failure && <Alert variant="danger" description={failure} />}
                        <Field label="Name on card" required>
                          {(control) => <Input {...control} value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" />}
                        </Field>
                        {/* Provider hosted fields mount here (card number, expiry, CVC). */}
                        <div id="hosted-card-fields" aria-label="Card details" />
                      </DialogBody>
                      <DialogFooter>
                        <DialogClose><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="primary" loading={saving} disabled={!name.trim()} onClick={save}>Save card</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ListItemActions>
              </ListItem>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
            <CardContent>
              <Table aria-label="Invoices">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead align="end">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span style={{ position: "absolute", inlineSize: 1, blockSize: 1, overflow: "hidden", clipPath: "inset(50%)" }}>Download</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell><time>{inv.date}</time></TableCell>
                      <TableCell>{inv.description}</TableCell>
                      <TableCell align="end">{inv.amount}</TableCell>
                      <TableCell><Badge variant={INVOICE_VARIANT[inv.status]} size="md">{inv.status}</Badge></TableCell>
                      <TableCell align="end">
                        <Button variant="ghost" size="sm" aria-label={`Download invoice from ${inv.date}`}>Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cancel sits last and apart, at its own width: a grid item would stretch to the full column. */}
          <div style={{ justifySelf: "start" }}>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive">Cancel plan</Button></AlertDialogTrigger>
              <AlertDialogContent variant="destructive">
                <AlertDialogTitle>Cancel your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  You keep access until {plan.renews}. After that your workspace becomes read-only and you will not be charged again.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep plan</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>Cancel plan</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}
