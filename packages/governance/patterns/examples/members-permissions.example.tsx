import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui-web/primitives/Table/Table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@atlas/ui-web/patterns/DropdownMenu/DropdownMenu"

type Role = "Owner" | "Admin" | "Member"
type Member = { id: string; name: string; email: string; role: Role; pending?: boolean; you?: boolean }

const ROLES: Role[] = ["Owner", "Admin", "Member"]

const title = { fontSize: "var(--atlas-text-h1)" }
const name = { fontSize: "var(--atlas-text-body-sm)", margin: 0 }
const muted = { fontSize: "var(--atlas-text-caption)", color: "var(--atlas-foreground-muted)", margin: 0 }

export function MembersPage({ members, loading, onInvite, onChangeRole, onRemove }: {
  members: Member[]
  loading?: boolean
  onInvite: () => void
  /** Saves one role. A rejected promise means it did not take effect. */
  onChangeRole: (id: string, role: Role) => Promise<void>
  onRemove: (id: string) => void
}) {
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const [roles, setRoles] = React.useState<Record<string, Role>>({})
  const owners = members.filter((m) => m.role === "Owner" && !m.pending)
  const soleOwner = owners.length === 1 ? owners[0] : null

  // The Select moves at once; if saving fails, put the old role back.
  const change = (m: Member, role: Role) => {
    setRoles((r) => ({ ...r, [m.id]: role }))
    onChangeRole(m.id, role).catch(() => setRoles((r) => ({ ...r, [m.id]: m.role })))
  }

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-4)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--atlas-spacing-3)" }}>
        <h1 style={title}>Members</h1>
        <Button variant="primary" onClick={onInvite}>Invite member</Button>
      </header>

      {soleOwner && (
        // A disabled control always has its reason in text nearby.
        <Alert
          variant="info"
          title={`${soleOwner.name} is the only Owner`}
          description={`Make another member an Owner before changing this role or removing ${soleOwner.name.split(" ")[0]}.`}
        />
      )}

      {loading ? (
        <div role="status" aria-label="Loading members" style={{ display: "grid", gap: "var(--atlas-spacing-2)" }}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <Card variant="outlined">
          <CardHeader><CardTitle>Members</CardTitle></CardHeader>
          <CardContent>
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span style={{ position: "absolute", inlineSize: 1, blockSize: 1, overflow: "hidden", clipPath: "inset(50%)" }}>Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const locked = m.id === soleOwner?.id
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <span style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-2)" }}>
                          <Avatar size="sm" initials={m.name.split(" ").map((p) => p[0]).join("")} alt="" />
                          <span>
                            <p style={name}>{m.name}{m.you ? " (You)" : ""}</p>
                            <p style={muted}>{m.email}</p>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        {m.pending ? (
                          <span style={muted}>Invited as {m.role}</span>
                        ) : (
                          <Select value={roles[m.id] ?? m.role} onValueChange={(v) => change(m, v as Role)} disabled={locked}>
                            <SelectTrigger size="md" aria-label={`Role for ${m.name}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.pending ? "warning" : "success"} size="md">{m.pending ? "Pending" : "Active"}</Badge>
                      </TableCell>
                      <TableCell align="end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" iconOnly disabled={locked} aria-label={`Actions for ${m.name}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {m.pending && <DropdownMenuItem>Resend invite</DropdownMenuItem>}
                            <DropdownMenuItem destructive onClick={() => setRemoving(m)}>
                              {m.pending ? "Revoke invite" : "Remove from workspace"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={removing !== null} onOpenChange={(open) => { if (!open) setRemoving(null) }}>
        <AlertDialogContent variant="destructive">
          <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {removing?.name.split(" ")[0]} loses access to this workspace and its projects immediately. Their work stays. You can invite them again later.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (removing) onRemove(removing.id); setRemoving(null) }}>
              Remove {removing?.name.split(" ")[0]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
