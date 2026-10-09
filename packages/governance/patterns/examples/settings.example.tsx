import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@atlas/ui-web/compositions/Card/Card"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Switch } from "@atlas/ui-web/primitives/Switch/Switch"
import { TabsList, TabsRoot, TabsTrigger } from "@atlas/ui-web/patterns/Tabs/Tabs"

export function SettingsScreen({ onSignOut }: { onSignOut: () => void }) {
  const [push, setPush] = React.useState(true)
  const [email, setEmail] = React.useState(false)
  const [theme, setTheme] = React.useState("system")

  return (
    <div style={{ display: "grid", gap: "var(--atlas-spacing-6)" }}>
      <Card variant="outlined">
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent>
          <Switch label="Push notifications" description="Alerts on this device" checked={push} onCheckedChange={setPush} />
          <Switch label="Email" description="Receipts and account news" checked={email} onCheckedChange={setEmail} />
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
  )
}
