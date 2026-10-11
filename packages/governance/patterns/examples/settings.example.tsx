import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@atlas/ui-web/compositions/Toast/Toast"
import { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Switch } from "@atlas/ui-web/primitives/Switch/Switch"
import { TabsList, TabsRoot, TabsTrigger } from "@atlas/ui-web/patterns/Tabs/Tabs"

export function SettingsScreen({ onSignOut, onSave, hasPhone }: {
  onSignOut: () => void
  /** Persists one instant setting. A rejected promise means the change did not take effect. */
  onSave: (key: "push" | "email", value: boolean) => Promise<void>
  hasPhone: boolean
}) {
  const [failed, setFailed] = React.useState(false)
  const [push, setPush] = React.useState(true)
  const [email, setEmail] = React.useState(false)
  const [theme, setTheme] = React.useState("system")

  // Instant change: the control moves at once; if saving fails, revert it and show a danger Toast.
  const change = (key: "push" | "email", set: (v: boolean) => void) => (value: boolean) => {
    set(value)
    onSave(key, value).catch(() => { set(!value); setFailed(true) })
  }

  return (
    <ToastProvider>
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-4)" }}>
        <Avatar size="lg" initials="AR" alt="" />
        <div>
          <p style={{ fontSize: "var(--atlas-text-h4)" }}>Alex Rivera</p>
          <p style={{ color: "var(--atlas-foreground-muted)" }}>alex@example.com</p>
        </div>
      </div>
      <Card variant="outlined">
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent>
          <Switch label="Push notifications" description="Alerts on this device" checked={push} onCheckedChange={change("push", setPush)} />
          <Switch label="Email" description="Receipts and account news" checked={email} onCheckedChange={change("email", setEmail)} />
          <Switch label="SMS alerts" description={hasPhone ? "Texts for sign-in codes" : "Add a phone number in your profile to turn these on."}
            disabled={!hasPhone} checked={false} />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <TabsRoot variant="segmented" value={theme} onValueChange={setTheme}>
            <TabsList aria-label="Theme">
              <TabsTrigger value="light">Light</TabsTrigger>
              <TabsTrigger value="dark">Dark</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </TabsRoot>
        </CardContent>
      </Card>
      <AlertDialog>
        <AlertDialogTrigger asChild><Button variant="destructive">Sign out</Button></AlertDialogTrigger>
        <AlertDialogContent variant="destructive">
          <AlertDialogTitle>Sign out of this device?</AlertDialogTitle>
          <AlertDialogDescription>You'll need your password to sign back in.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    <Toast variant="danger" open={failed} onOpenChange={setFailed}>
      <ToastTitle>Couldn't save your change</ToastTitle>
      <ToastDescription>The setting is back to its previous value.</ToastDescription>
      <ToastClose />
    </Toast>
    <ToastViewport />
    </ToastProvider>
  )
}
