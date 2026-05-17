"use client"

import { useState } from "react"
import { Button } from "@/packages/ui-web/src/primitives/Button/Button"
import { Input } from "@/packages/ui-web/src/primitives/Input/Input"
import { Label } from "@/packages/ui-web/src/primitives/Label/Label"
import { Textarea } from "@/packages/ui-web/src/primitives/Textarea/Textarea"
import { Checkbox } from "@/packages/ui-web/src/primitives/Checkbox/Checkbox"
import { Switch } from "@/packages/ui-web/src/primitives/Switch/Switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/packages/ui-web/src/compositions/Card/Card"
import { Badge } from "@/packages/ui-web/src/primitives/Badge/Badge"
import { Alert } from "@/packages/ui-web/src/compositions/Alert/Alert"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from "@/packages/ui-web/src/compositions/Dialog/Dialog"
import { Tabs } from "@/packages/ui-web/src/patterns/Tabs/Tabs"
import { NavBar } from "@/packages/ui-web/src/layouts/NavBar/NavBar"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>
      <div style={{
        fontSize: "var(--atlas-font-size-xs)", fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "var(--atlas-foreground-muted)",
        borderBottom: "1px solid var(--atlas-border)", paddingBottom: "var(--atlas-spacing-2)",
      }}>
        {title}
      </div>
      {children}
    </section>
  )
}

function Row({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)", flexWrap: wrap ? "wrap" : "nowrap" }}>
      {children}
    </div>
  )
}

export default function SandboxPage() {
  const [dark, setDark] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState<boolean | "indeterminate">(false)
  const [switchOn, setSwitchOn] = useState(false)

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "var(--atlas-background)", color: "var(--atlas-foreground)",
      fontFamily: "var(--atlas-font-sans)",
    }}>
      {/* NavBar */}
      <NavBar
        brand="🎨 Atlas"
        links={[
          { label: "Components", active: true },
          { label: "Tokens" },
          { label: "Guidelines" },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {dark ? "☀ Light" : "☾ Dark"}
          </Button>
        }
      />

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "var(--atlas-spacing-10) var(--atlas-spacing-6)", display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-12)" }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--atlas-font-size-3xl, 1.875rem)", fontWeight: 700, color: "var(--atlas-foreground)" }}>
            Atlas Design System — v1 Sandbox
          </h1>
          <p style={{ margin: "var(--atlas-spacing-2) 0 0", color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-base)" }}>
            Visual test for all 12 components. Toggle dark mode via the NavBar.
          </p>
        </div>

        {/* ── BUTTON ── */}
        <Section title="Button">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-3)" }}>
            <Row>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Upload">⬆</Button>
            </Row>
            <Row>
              <Button loading>Loading</Button>
              <Button loading trailingIcon={<span>→</span>}>Loading + trailing</Button>
              <Button disabled>Disabled</Button>
              <Button variant="primary" leadingIcon={<span>★</span>}>Leading icon</Button>
              <Button variant="secondary" trailingIcon={<span>→</span>}>Trailing icon</Button>
            </Row>
          </div>
        </Section>

        {/* ── INPUT ── */}
        <Section title="Input">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-3)", maxWidth: 400 }}>
            <div>
              <Label htmlFor="i1">Default input (md)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i1" placeholder="Type something…" />
              </div>
            </div>
            <div>
              <Label htmlFor="i1sm">Small input</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i1sm" size="sm" placeholder="Small — 32px" />
              </div>
            </div>
            <div>
              <Label htmlFor="i1lg">Large input</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i1lg" size="lg" placeholder="Large — 48px" />
              </div>
            </div>
            <div>
              <Label htmlFor="i2" optional>Filled input</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i2" variant="filled" placeholder="Filled variant" />
              </div>
            </div>
            <div>
              <Label htmlFor="i2u">Unstyled input</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i2u" variant="unstyled" placeholder="Unstyled — border on focus" />
              </div>
            </div>
            <div>
              <Label htmlFor="i3" required>Error state</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i3" invalid placeholder="Invalid input" defaultValue="bad@" aria-describedby="i3-error" />
              </div>
              <div id="i3-error" style={{ marginTop: "var(--atlas-spacing-1)", fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-danger)" }}>
                Please enter a valid email address.
              </div>
            </div>
            <div>
              <Label htmlFor="i4">With icons</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i4" leadingIcon={<span style={{ fontSize: 13 }}>🔍</span>} trailingIcon={<span style={{ fontSize: 13 }}>✕</span>} placeholder="Search…" />
              </div>
            </div>
            <div>
              <Label htmlFor="i5">Prefix &amp; suffix affixes</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i5" prefix="$" suffix=".00" placeholder="0" />
              </div>
            </div>
            <div>
              <Label htmlFor="i6">URL suffix</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Input id="i6" suffix=".com" placeholder="yoursite" />
              </div>
            </div>
            <Input disabled placeholder="Disabled input" />
          </div>
        </Section>

        {/* ── LABEL ── */}
        <Section title="Label">
          {/* Variants + markers */}
          <Row>
            <Label>Default label</Label>
            <Label required>Required field</Label>
            <Label optional>Optional field</Label>
          </Row>

          {/* Sizes */}
          <Row>
            <Label size="sm">Small (text-sm)</Label>
            <Label size="md">Medium (text-body-sm)</Label>
            <Label size="lg">Large (text-body)</Label>
          </Row>

          {/* States */}
          <Row>
            <Label disabled>Disabled label</Label>
            <Label disabled required>Disabled + required</Label>
            <Label invalid>Error / invalid label</Label>
          </Row>

          {/* Inline variant beside an Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--atlas-spacing-3)" }}>
            <Label variant="inline" htmlFor="l-inline">Inline label</Label>
            <Input id="l-inline" placeholder="Sits level with label" style={{ maxWidth: 240 }} />
          </div>
        </Section>

        {/* ── TEXTAREA ── */}
        <Section title="Textarea">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)", maxWidth: 400 }}>
            {/* Sizes */}
            <div>
              <Label htmlFor="ta-sm">Small (80px min-height)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta-sm" size="sm" placeholder="Small textarea…" />
              </div>
            </div>
            <div>
              <Label htmlFor="ta1">Medium — default (96px min-height)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta1" placeholder="Write something…" />
              </div>
            </div>
            <div>
              <Label htmlFor="ta-lg">Large (128px min-height)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta-lg" size="lg" placeholder="Large textarea…" />
              </div>
            </div>

            {/* Character counter — fixed prop: showCount + maxLength */}
            <div>
              <Label htmlFor="ta2">With character counter (max 100)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta2" placeholder="Type to see counter…" showCount maxLength={100} />
              </div>
            </div>

            {/* Filled + invalid */}
            <div>
              <Label htmlFor="ta3" required>Filled + invalid</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta3" variant="filled" invalid placeholder="Error state" aria-describedby="ta3-error" />
              </div>
              <div id="ta3-error" style={{ marginTop: "var(--atlas-spacing-1)", fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-danger)" }}>
                This field is required.
              </div>
            </div>

            {/* Disabled */}
            <div>
              <Label htmlFor="ta4" disabled>Disabled</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta4" disabled placeholder="Disabled textarea" />
              </div>
            </div>

            {/* autoGrow */}
            <div>
              <Label htmlFor="ta5">Auto-grow (max 6 rows)</Label>
              <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                <Textarea id="ta5" autoGrow maxRows={6} placeholder="Grows as you type…" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── CHECKBOX ── */}
        <Section title="Checkbox">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-3)" }}>
            {/* md size — all states */}
            <Row>
              <Checkbox id="cb1" label="Unchecked" />
              <Checkbox id="cb2" checked={true} label="Checked" onCheckedChange={() => {}} />
              <Checkbox id="cb3" checked="indeterminate" label="Indeterminate" onCheckedChange={() => {}} />
            </Row>

            {/* sm size */}
            <Row>
              <Checkbox id="cb-sm1" size="sm" label="Small unchecked" />
              <Checkbox id="cb-sm2" size="sm" checked={true} label="Small checked" onCheckedChange={() => {}} />
              <Checkbox id="cb-sm3" size="sm" checked="indeterminate" label="Small indeterminate" onCheckedChange={() => {}} />
            </Row>

            {/* Error states — unchecked, checked, indeterminate */}
            <Row>
              <Checkbox id="cb4" disabled label="Disabled" />
              <Checkbox id="cb5" invalid label="Error unchecked" />
              <Checkbox id="cb5b" invalid checked={true} label="Error checked" onCheckedChange={() => {}} />
              <Checkbox id="cb5c" invalid checked="indeterminate" label="Error indeterminate" onCheckedChange={() => {}} />
            </Row>

            {/* Card variant — interactive */}
            <div>
              <Checkbox
                id="cb6"
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
                label="Interactive card checkbox"
                description="Click anywhere on the card to toggle"
                variant="card"
              />
            </div>
            <Checkbox
              id="cb7"
              label="Card variant"
              description="Whole card is the click target"
              variant="card"
            />
            <Checkbox
              id="cb8"
              invalid
              label="Card — error state"
              description="Error border on the card surface"
              variant="card"
            />
          </div>
        </Section>

        {/* ── SWITCH ── */}
        <Section title="Switch">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-3)" }}>
            <Row>
              <Switch label="Off by default" />
              <Switch label="On by default" defaultChecked />
            </Row>
            <Row>
              <Switch size="sm" label="Small switch" />
              <Switch size="md" label="Medium switch" />
            </Row>
            <Switch
              checked={switchOn}
              onCheckedChange={setSwitchOn}
              label={switchOn ? "Notifications on" : "Notifications off"}
              description="Toggle to enable or disable push notifications"
            />
            <Switch disabled label="Disabled switch" />
          </div>
        </Section>

        {/* ── CARD ── */}
        <Section title="Card">
          {/* 4 variants */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--atlas-spacing-4)" }}>
            {(["default", "elevated", "outlined", "filled"] as const).map(variant => (
              <Card key={variant} variant={variant}>
                <CardHeader>
                  <CardTitle>Card · {variant}</CardTitle>
                  <CardDescription>This is the {variant} card variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)", lineHeight: 1.6 }}>
                    Card body content goes here.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                  <Button size="sm" variant="ghost">Cancel</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Sizes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--atlas-spacing-4)" }}>
            {(["sm", "md", "lg"] as const).map(size => (
              <Card key={size} size={size}>
                <CardContent>
                  <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>
                    Size: {size} padding
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leading visual + action slot */}
          <Card>
            <CardHeader
              leading={<span style={{ fontSize: 24 }}>🖼️</span>}
              action={<Button size="sm" variant="ghost">⋯</Button>}
            >
              <CardTitle>With leading &amp; action</CardTitle>
              <CardDescription>Leading visual at inline-start, action menu at inline-end</CardDescription>
            </CardHeader>
            <CardContent>
              <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>
                Card content area.
              </p>
            </CardContent>
            <CardFooter justify="between">
              <Button size="sm" variant="ghost">Cancel</Button>
              <Button size="sm">Confirm</Button>
            </CardFooter>
          </Card>

          {/* Interactive + selected */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--atlas-spacing-4)" }}>
            <Card interactive onClick={() => {}}>
              <CardHeader>
                <CardTitle>Interactive card</CardTitle>
                <CardDescription>Hover for bg shift, Tab + focus for ring</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Click anywhere on the card.</p>
              </CardContent>
            </Card>

            <Card variant="elevated" interactive onClick={() => {}}>
              <CardHeader>
                <CardTitle>Elevated interactive</CardTitle>
                <CardDescription>Hover lifts shadow to shadow-lg</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Hover to see the shadow lift.</p>
              </CardContent>
            </Card>

            <Card selected>
              <CardHeader>
                <CardTitle>Selected card</CardTitle>
                <CardDescription>Primary border on all variants</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Border turns primary when selected.</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── BADGE ── */}
        <Section title="Badge">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>

            {/* All 7 variants — md size */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>7 variants (md)</p>
              <Row>
                {(["default", "secondary", "success", "warning", "danger", "info", "outline"] as const).map(v => (
                  <Badge key={v} variant={v}>{v}</Badge>
                ))}
              </Row>
            </div>

            {/* Sizes — sm / md / lg */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sizes</p>
              <Row>
                <Badge size="sm" variant="default">sm — 18px</Badge>
                <Badge size="md" variant="default">md — 22px</Badge>
                <Badge size="lg" variant="default">lg — 26px</Badge>
                <Badge size="sm" variant="success">sm success</Badge>
                <Badge size="lg" variant="danger">lg danger</Badge>
              </Row>
            </div>

            {/* Outline variant with all intents */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Outline + intent</p>
              <Row>
                <Badge variant="outline">outline (default)</Badge>
                <Badge variant="outline" intent="success">outline success</Badge>
                <Badge variant="outline" intent="warning">outline warning</Badge>
                <Badge variant="outline" intent="danger">outline danger</Badge>
                <Badge variant="outline" intent="info">outline info</Badge>
              </Row>
            </div>

            {/* Dot indicator */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dot indicator (inherits variant fg)</p>
              <Row>
                <Badge variant="default" dot>Default</Badge>
                <Badge variant="success" dot>Success</Badge>
                <Badge variant="warning" dot>Warning</Badge>
                <Badge variant="danger" dot>Danger</Badge>
                <Badge variant="info" dot>Info</Badge>
              </Row>
            </div>

            {/* Icon slots */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Icon slots</p>
              <Row>
                <Badge variant="info" leadingIcon={<span style={{ fontSize: "0.75em" }}>ℹ</span>}>Leading icon</Badge>
                <Badge variant="success" trailingIcon={<span style={{ fontSize: "0.75em" }}>✓</span>}>Trailing icon</Badge>
                <Badge variant="warning" leadingIcon={<span style={{ fontSize: "0.75em" }}>⚠</span>} trailingIcon={<span style={{ fontSize: "0.75em" }}>!</span>}>Both icons</Badge>
              </Row>
            </div>

            {/* Removable */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Removable (× fires callback)</p>
              <Row>
                <Badge variant="default" removable onRemove={() => alert("removed: default")}>Default</Badge>
                <Badge variant="success" removable onRemove={() => alert("removed: success")}>Success</Badge>
                <Badge variant="danger" removable onRemove={() => alert("removed: danger")}>Danger</Badge>
                <Badge variant="outline" intent="info" removable onRemove={() => alert("removed: outline info")}>Outline info</Badge>
              </Row>
            </div>

            {/* Square prop */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Square (radius-sm instead of full)</p>
              <Row>
                <Badge square>Default square</Badge>
                <Badge square variant="success">Success square</Badge>
                <Badge square variant="outline">Outline square</Badge>
                <Badge square variant="danger" size="lg">Large square</Badge>
              </Row>
            </div>

            {/* Disabled */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Disabled (opacity-disabled, non-interactive)</p>
              <Row>
                <Badge disabled>Disabled default</Badge>
                <Badge disabled variant="success">Disabled success</Badge>
                <Badge disabled variant="outline" intent="danger">Disabled outline</Badge>
                <Badge disabled removable onRemove={() => {}}>Disabled removable</Badge>
              </Row>
            </div>

          </div>
        </Section>

        {/* ── ALERT ── */}
        <Section title="Alert">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>

            {/* All 4 variants — md size with title + description */}
            <p style={{ margin: 0, fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>4 variants (md, title + description)</p>
            <Alert variant="info" title="Info" description="Here's some helpful context you might want to know." />
            <Alert variant="success" title="Success" description="Your changes have been saved successfully." />
            <Alert variant="warning" title="Warning" description="This action may have unintended side effects." />
            <Alert variant="danger" title="Error" description="Something went wrong. Please try again or contact support." />

            {/* Description only (no title) */}
            <p style={{ margin: "var(--atlas-spacing-2) 0 0", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Description only (no title)</p>
            <Alert variant="info" description="Your session will expire in 5 minutes. Save your work." />
            <Alert variant="danger" description="Failed to connect to the server." />

            {/* Dismissible */}
            <p style={{ margin: "var(--atlas-spacing-2) 0 0", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dismissible (× has 44px touch target)</p>
            <Alert variant="success" title="File uploaded" description="Your file has been processed and is ready." dismissible onDismiss={() => alert("dismissed")} />
            <Alert variant="warning" title="Storage almost full" description="You're using 90% of your storage quota." dismissible onDismiss={() => alert("dismissed")} />

            {/* With actions slot */}
            <p style={{ margin: "var(--atlas-spacing-2) 0 0", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>With actions</p>
            <Alert
              variant="warning"
              title="Unsaved changes"
              description="You have unsaved changes that will be lost if you leave."
              actions={
                <>
                  <Button size="sm" variant="outline">Discard</Button>
                  <Button size="sm">Save now</Button>
                </>
              }
            />
            <Alert
              variant="danger"
              title="Account suspended"
              description="Your account has been temporarily suspended."
              dismissible
              onDismiss={() => alert("dismissed")}
              actions={<Button size="sm" variant="outline">Learn more</Button>}
            />

            {/* sm size */}
            <p style={{ margin: "var(--atlas-spacing-2) 0 0", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>sm size</p>
            <Alert size="sm" variant="info" title="Compact info" description="Small padding, smaller type." />
            <Alert size="sm" variant="success" description="Saved." dismissible onDismiss={() => {}} />

            {/* hideIcon + icon override */}
            <p style={{ margin: "var(--atlas-spacing-2) 0 0", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>hideIcon / icon override</p>
            <Alert variant="info" title="No icon" description="Icon hidden via hideIcon prop." hideIcon />
            <Alert variant="success" icon={<span>🎉</span>} title="Custom icon" description="Overrides the default check with a custom node." />

          </div>
        </Section>

        {/* ── DIALOG ── */}
        <Section title="Dialog">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>

            {/* Modal — default */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Modal (md) — focus trap · Esc · scroll lock · overlay click</p>
              <Row>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Open modal</Button>
                  </DialogTrigger>
                  <DialogContent variant="modal" size="md">
                    <DialogHeader>
                      <DialogTitle>Confirm action</DialogTitle>
                      <DialogDescription>This will permanently delete the item. This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <Alert variant="warning" description="The item will be removed from all projects." />
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="destructive">Delete</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* sm size */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modal sm</Button>
                  </DialogTrigger>
                  <DialogContent variant="modal" size="sm">
                    <DialogHeader>
                      <DialogTitle>Small dialog</DialogTitle>
                      <DialogDescription>Max-width 400px. Good for confirmations.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Compact content area with smaller padding.</p>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <DialogClose asChild><Button>OK</Button></DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* lg size */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modal lg</Button>
                  </DialogTrigger>
                  <DialogContent variant="modal" size="lg">
                    <DialogHeader>
                      <DialogTitle>Large dialog</DialogTitle>
                      <DialogDescription>Max-width 720px for complex content.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Use for forms, multi-step flows, or rich content that needs more horizontal room.</p>
                    </DialogBody>
                    <DialogFooter justify="between">
                      <Button variant="ghost" size="sm">Learn more</Button>
                      <div style={{ display: "flex", gap: "var(--atlas-spacing-3)" }}>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <DialogClose asChild><Button>Save</Button></DialogClose>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Row>
            </div>

            {/* Sheet variant */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sheet — slides up from bottom · drag handle closes</p>
              <Row>
                <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open sheet</Button>
                  </DialogTrigger>
                  <DialogContent variant="sheet">
                    <DialogHeader>
                      <DialogTitle>Sheet title</DialogTitle>
                      <DialogDescription>Slides up from the bottom. Tap the handle or press Esc to dismiss.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)", lineHeight: 1.6 }}>
                        Sheet content goes here. Typically used for mobile-first interactions — filter panels, share menus, or action menus. The drag handle at the top can be tapped to dismiss.
                      </p>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Dismiss</Button></DialogClose>
                      <DialogClose asChild><Button>Confirm</Button></DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Row>
            </div>

            {/* Drawer variant */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Drawer — slides from inline-end (RTL-safe)</p>
              <Row>
                <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open drawer</Button>
                  </DialogTrigger>
                  <DialogContent variant="drawer" size="sm" side="end">
                    <DialogHeader>
                      <DialogTitle>Filter options</DialogTitle>
                      <DialogDescription>Adjust filters for your results.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-4)" }}>
                        <div>
                          <Label htmlFor="dr-status">Status</Label>
                          <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                            <Input id="dr-status" placeholder="All statuses" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="dr-owner">Owner</Label>
                          <div style={{ marginTop: "var(--atlas-spacing-1)" }}>
                            <Input id="dr-owner" placeholder="Any owner" />
                          </div>
                        </div>
                        <Switch label="Active only" />
                      </div>
                    </DialogBody>
                    <DialogFooter justify="between">
                      <DialogClose asChild><Button variant="ghost">Reset</Button></DialogClose>
                      <DialogClose asChild><Button>Apply</Button></DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Row>
            </div>

          </div>
        </Section>

        {/* ── TABS ── */}
        <Section title="Tabs">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-8)" }}>

            {/* 3 variants — md size */}
            {(["underline", "pills", "enclosed"] as const).map(variant => (
              <div key={variant}>
                <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {variant} · md · arrow keys · disabled tab skipped
                </p>
                <Tabs
                  variant={variant}
                  items={[
                    { id: `${variant}-overview`, label: "Overview", content: <p style={{ margin: 0, color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-sm)" }}>Overview panel — switch tabs with ← → arrow keys.</p> },
                    { id: `${variant}-details`,  label: "Details",  content: <p style={{ margin: 0, color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-sm)" }}>Details panel content.</p> },
                    { id: `${variant}-settings`, label: "Settings", content: <p style={{ margin: 0, color: "var(--atlas-foreground-muted)", fontSize: "var(--atlas-font-size-sm)" }}>Settings panel content.</p> },
                    { id: `${variant}-disabled`, label: "Disabled", disabled: true, content: <></> },
                  ]}
                />
              </div>
            ))}

            {/* Sizes — underline */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-3)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Sizes — sm / md / lg (underline)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--atlas-spacing-6)" }}>
                {(["sm", "md", "lg"] as const).map(size => (
                  <div key={size}>
                    <p style={{ margin: "0 0 var(--atlas-spacing-1)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-subtle)" }}>{size}</p>
                    <Tabs
                      variant="underline"
                      size={size}
                      items={[
                        { id: `sz-${size}-a`, label: "First", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Size {size} — First panel</p> },
                        { id: `sz-${size}-b`, label: "Second", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Size {size} — Second panel</p> },
                        { id: `sz-${size}-c`, label: "Third", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Size {size} — Third panel</p> },
                      ]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* With icon + badge in trigger */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Leading icon · trailing badge (pills)
              </p>
              <Tabs
                variant="pills"
                items={[
                  {
                    id: "ib-inbox",
                    label: "Inbox",
                    icon: <span style={{ fontSize: "0.875em" }}>📥</span>,
                    badge: <Badge size="sm" variant="danger">4</Badge>,
                    content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Inbox — 4 unread messages</p>,
                  },
                  {
                    id: "ib-sent",
                    label: "Sent",
                    icon: <span style={{ fontSize: "0.875em" }}>📤</span>,
                    content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Sent items</p>,
                  },
                  {
                    id: "ib-archived",
                    label: "Archived",
                    icon: <span style={{ fontSize: "0.875em" }}>🗄️</span>,
                    content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Archived messages</p>,
                  },
                ]}
              />
            </div>

            {/* Manual activation mode */}
            <div>
              <p style={{ margin: "0 0 var(--atlas-spacing-2)", fontSize: "var(--atlas-font-size-xs)", color: "var(--atlas-foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Manual activation (enclosed) — arrow keys move focus, Enter/Space activates
              </p>
              <Tabs
                variant="enclosed"
                activationMode="manual"
                items={[
                  { id: "man-a", label: "Design", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Design panel — press Enter or Space to activate a focused tab</p> },
                  { id: "man-b", label: "Develop", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Develop panel</p> },
                  { id: "man-c", label: "Review", content: <p style={{ margin: 0, fontSize: "var(--atlas-font-size-sm)", color: "var(--atlas-foreground-muted)" }}>Review panel</p> },
                ]}
              />
            </div>

          </div>
        </Section>

      </div>
    </div>
  )
}
