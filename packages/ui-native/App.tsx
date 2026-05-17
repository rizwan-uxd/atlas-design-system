import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './theme'
import { shadowHelper } from './utils/shadowHelper'
import { useReducedMotion } from './utils/useReducedMotion'

// Phase 1 components
import { Badge } from './components/Badge/Badge'
import { Label } from './components/Label/Label'
import { Alert } from './components/Alert/Alert'
import { Button } from './components/Button/Button'

// Phase 2 components
import { Input }     from './components/Input/Input'
import { Textarea }  from './components/Textarea/Textarea'
import { Checkbox }  from './components/Checkbox/Checkbox'
import { Switch }    from './components/Switch/Switch'

// Phase 3 components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/Card/Card'
import { Header } from './components/NavBar/Header'
import { TabBar } from './components/NavBar/TabBar'
import { Dialog } from './components/Dialog/Dialog'
import { Tabs }   from './components/Tabs/Tabs'
import { Ionicons } from '@expo/vector-icons'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  const { colors, tokens } = useTheme()
  return (
    <Text style={{
      fontSize:      tokens.fontSize.xs,
      fontWeight:    tokens.fontWeight.semibold,
      color:         colors.foregroundMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom:  tokens.spacing[2],
      marginTop:     tokens.spacing[4],
    }}>
      {children}
    </Text>
  )
}

/** Lightweight demo shell used by Phase 0–2 sections before the Atlas Card existed. */
function DemoShell({ children }: { children: React.ReactNode }) {
  const { colors, tokens, colorScheme } = useTheme()
  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius:    tokens.radius.lg,
      padding:         tokens.spacing[4],
      borderWidth:     tokens.borderWidth[1],
      borderColor:     colors.border,
      gap:             tokens.spacing[3],
      ...shadowHelper('sm', colorScheme),
    }}>
      {children}
    </View>
  )
}

// ─── Phase 0 section (collapsed to a single status row) ──────────────────────

function PhaseZeroStatus() {
  const { colors, tokens, colorScheme } = useTheme()
  const reduceMotion = useReducedMotion()

  return (
    <DemoShell>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.foreground, fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.semibold }}>
          Phase 0 — Foundation
        </Text>
        <Badge variant="success" size="sm">✅ Complete</Badge>
      </View>
      <View style={{ flexDirection: 'row', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
        <Badge variant="neutral" size="sm">Dark mode: {colorScheme}</Badge>
        <Badge variant="neutral" size="sm">Reduce motion: {String(reduceMotion)}</Badge>
      </View>
    </DemoShell>
  )
}

// ─── M1 · Badge demo ──────────────────────────────────────────────────────────

function BadgeDemo() {
  return (
    <DemoShell>
      {/* Variants */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="brand">Brand</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
      </View>

      {/* Sizes */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="brand" size="sm">Small</Badge>
        <Badge variant="brand" size="md">Medium</Badge>
        <Badge variant="brand" size="lg">Large</Badge>
      </View>

      {/* Dot */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Badge variant="success" dot accessibilityLabel="success status" />
        <Badge variant="warning" dot accessibilityLabel="warning status" />
        <Badge variant="danger"  dot accessibilityLabel="danger status" />
        <Badge variant="info"    dot accessibilityLabel="info status" />
        <Badge variant="neutral" size="lg">Dot variants →</Badge>
      </View>

      {/* Long label overflow */}
      <Badge variant="neutral">This is a very long badge label to test overflow</Badge>
    </DemoShell>
  )
}

// ─── M2 · Label demo ─────────────────────────────────────────────────────────

function LabelDemo() {
  return (
    <DemoShell>
      {/* Sizes */}
      <View style={{ gap: 4 }}>
        <Label size="sm">Small label</Label>
        <Label size="md">Medium label</Label>
        <Label size="lg">Large label</Label>
      </View>

      {/* Required */}
      <View style={{ gap: 4 }}>
        <Label required>Email address</Label>
        <Label size="lg" required>Full name (large + required)</Label>
      </View>

      {/* Disabled */}
      <Label disabled>Disabled label (50% opacity)</Label>
      <Label disabled required>Disabled + required</Label>
    </DemoShell>
  )
}

// ─── M3 · Alert demo ─────────────────────────────────────────────────────────

function AlertDemo() {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})

  return (
    <DemoShell>
      {!dismissed['info'] && (
        <Alert
          variant="info"
          title="Heads up"
          description="This is an informational alert with a dismiss button."
          onDismiss={() => setDismissed(d => ({ ...d, info: true }))}
        />
      )}
      {!dismissed['success'] && (
        <Alert
          variant="success"
          title="All done"
          description="Your changes have been saved successfully."
          onDismiss={() => setDismissed(d => ({ ...d, success: true }))}
        />
      )}
      {!dismissed['warning'] && (
        <Alert
          variant="warning"
          description="Your session will expire in 5 minutes."
          onDismiss={() => setDismissed(d => ({ ...d, warning: true }))}
        />
      )}
      {!dismissed['danger'] && (
        <Alert
          variant="danger"
          title="Error"
          description="Something went wrong. Please try again."
          onDismiss={() => setDismissed(d => ({ ...d, danger: true }))}
        />
      )}
      {/* No icon / no dismiss */}
      <Alert
        variant="info"
        description="Alert without icon or dismiss button."
        icon={false}
      />
      {Object.keys(dismissed).length > 0 && (
        <Button variant="ghost" size="sm" onPress={() => setDismissed({})}>
          Reset dismissed alerts
        </Button>
      )}
    </DemoShell>
  )
}

// ─── M4 · Button demo ────────────────────────────────────────────────────────

function ButtonDemo() {
  const [loading, setLoading] = useState(false)

  const simulateLoad = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <DemoShell>
      {/* Variants */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="primary"   size="sm">Primary</Button>
        <Button variant="secondary" size="sm">Secondary</Button>
        <Button variant="ghost"     size="sm">Ghost</Button>
        <Button variant="danger"    size="sm">Danger</Button>
      </View>

      {/* Sizes */}
      <View style={{ gap: 8 }}>
        <Button variant="primary" size="sm" fullWidth>Small — full width</Button>
        <Button variant="primary" size="md" fullWidth>Medium — full width</Button>
        <Button variant="primary" size="lg" fullWidth>Large — full width</Button>
      </View>

      {/* States */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="primary"   disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </View>

      {/* Loading */}
      <Button
        variant="primary"
        loading={loading}
        onPress={simulateLoad}
        fullWidth
      >
        {loading ? 'Saving…' : 'Tap to load (2s)'}
      </Button>
    </DemoShell>
  )
}

// ─── M5 · Input demo ─────────────────────────────────────────────────────────

function InputDemo() {
  const { tokens } = useTheme()
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')

  return (
    <DemoShell>
      {/* Variants — md size, default state */}
      <Input
        label="Default variant"
        placeholder="Type something…"
        helperText="Border appears on focus"
        value={text}
        onChangeText={setText}
      />
      <Input
        variant="filled"
        label="Filled variant"
        placeholder="Muted background, no border at rest"
        helperText="Border appears on focus"
      />
      <Input
        variant="ghost"
        label="Ghost variant"
        placeholder="No border at rest"
        helperText="Border and focus ring appear on tap"
      />

      {/* Sizes */}
      <View style={{ gap: tokens.spacing[2] }}>
        <Input size="sm" placeholder="Small (sm)" />
        <Input size="md" placeholder="Medium (md) — default" />
        <Input size="lg" placeholder="Large (lg)" />
      </View>

      {/* States */}
      <Input
        label="Error state"
        state="error"
        value="bad-input@"
        errorText="Enter a valid email address"
      />
      <Input
        label="Success state"
        state="success"
        value="riz@example.com"
        successText="Email looks good"
      />
      <Input
        label="Disabled state"
        state="disabled"
        value="cannot edit this"
        helperText="Interaction is suppressed at 50% opacity"
      />

      {/* With icons (using emoji as stand-in — replace with Ionicons in production) */}
      <Input
        label="With icons"
        placeholder="Search…"
        leadingIcon={<Text style={{ fontSize: 16 }}>🔍</Text>}
        trailingIcon={<Text style={{ fontSize: 16 }}>✕</Text>}
        helperText="leadingIcon + trailingIcon slots"
      />

      {/* Secure text / password */}
      <Input
        label="Password"
        placeholder="Enter password"
        secureTextEntry
        required
        value={password}
        onChangeText={setPassword}
        helperText="secureTextEntry — system eye toggle on iOS"
      />
    </DemoShell>
  )
}

// ─── M8 · Switch demo ────────────────────────────────────────────────────────

function SwitchDemo() {
  const { tokens } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [darkMode,      setDarkMode]      = useState(false)
  const [autoSave,      setAutoSave]      = useState(true)

  return (
    <DemoShell>
      {/* Off / on static */}
      <Switch label="Off (default)" value={false} />
      <Switch label="On" value={true} />

      {/* Sizes */}
      <Switch size="sm" label="Small (sm)" value={true} />
      <Switch size="md" label="Medium (md) — default" value={true} />
      <Switch size="lg" label="Large (lg)" value={true} />

      {/* Controlled — interactive */}
      <Switch
        label="Enable notifications"
        value={notifications}
        onValueChange={setNotifications}
      />
      <Switch
        label="Dark mode"
        value={darkMode}
        onValueChange={setDarkMode}
      />
      <Switch
        label="Auto-save drafts"
        value={autoSave}
        onValueChange={setAutoSave}
      />

      {/* Disabled states */}
      <Switch label="Disabled off" disabled value={false} />
      <Switch label="Disabled on"  disabled value={true} />

      {/* Track-only (no label) */}
      <View style={{ flexDirection: 'row', gap: tokens.spacing[4], alignItems: 'center' }}>
        <Switch accessibilityLabel="Option A" value={false} />
        <Switch accessibilityLabel="Option B" value={true} />
        <Switch accessibilityLabel="Option C" size="lg" value={true} />
      </View>
    </DemoShell>
  )
}

// ─── M7 · Checkbox demo ──────────────────────────────────────────────────────

function CheckboxDemo() {
  const [agreed, setAgreed]           = useState(false)
  const [newsletter, setNewsletter]   = useState(true)
  const [allSelected, setAllSelected] = useState<boolean | 'indeterminate'>('indeterminate')

  // Cycle: unchecked → checked → indeterminate → unchecked
  function cycleGroup() {
    setAllSelected(prev =>
      prev === false ? true : prev === true ? 'indeterminate' : false,
    )
  }

  return (
    <DemoShell>
      {/* Unchecked / checked / indeterminate states */}
      <Checkbox
        label="Unchecked (default)"
        checked={false}
      />
      <Checkbox
        label="Checked"
        checked={true}
      />
      <Checkbox
        label="Indeterminate — tap to cycle states"
        checked={allSelected === true}
        indeterminate={allSelected === 'indeterminate'}
        onValueChange={cycleGroup}
      />

      {/* Sizes */}
      <Checkbox size="sm" label="Small (sm)" checked={true} />
      <Checkbox size="md" label="Medium (md) — default" checked={true} />
      <Checkbox size="lg" label="Large (lg)" checked={true} />

      {/* Controlled — interactive */}
      <Checkbox
        label="I agree to the Terms of Service"
        checked={agreed}
        onValueChange={setAgreed}
      />
      <Checkbox
        label="Subscribe to product updates"
        checked={newsletter}
        onValueChange={setNewsletter}
      />

      {/* Disabled states */}
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked"   disabled checked />
      <Checkbox label="Disabled indeterminate" disabled indeterminate />

      {/* No label — box only (caller provides accessibilityLabel via prop) */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Checkbox accessibilityLabel="Option A" />
        <Checkbox accessibilityLabel="Option B" checked />
        <Checkbox accessibilityLabel="Option C" indeterminate />
      </View>
    </DemoShell>
  )
}

// ─── M6 · Textarea demo ───────────────────────────────────────────────────────

function TextareaDemo() {
  const { tokens } = useTheme()
  const [bio, setBio]             = useState('')
  const [limited, setLimited]     = useState('')
  const [autoText, setAutoText]   = useState('')

  return (
    <DemoShell>
      {/* Default variant — fixed 3-row height */}
      <Textarea
        label="Default variant"
        placeholder="Write something…"
        helperText="Fixed height — 3 rows"
        value={bio}
        onChangeText={setBio}
        rows={3}
      />

      {/* Filled variant */}
      <Textarea
        variant="filled"
        label="Filled variant"
        placeholder="Muted background, no border at rest"
        helperText="Border appears on focus"
        rows={3}
      />

      {/* Sizes */}
      <View style={{ gap: tokens.spacing[2] }}>
        <Textarea size="sm" placeholder="Small (sm) — 3 rows"  rows={3} />
        <Textarea size="md" placeholder="Medium (md) — default" rows={3} />
        <Textarea size="lg" placeholder="Large (lg) — 3 rows"  rows={3} />
      </View>

      {/* States */}
      <Textarea
        label="Error state"
        state="error"
        value="too short"
        errorText="Bio must be at least 20 characters"
        rows={3}
      />
      <Textarea
        label="Disabled state"
        state="disabled"
        value="This field cannot be edited right now."
        rows={3}
      />

      {/* Character counter */}
      <Textarea
        label="With character limit"
        placeholder="Max 120 characters…"
        value={limited}
        onChangeText={setLimited}
        maxLength={120}
        rows={3}
        helperText="Counter turns red at the limit"
      />

      {/* Auto-grow with maxRows cap */}
      <Textarea
        label="Auto-grow (max 6 rows)"
        placeholder="Start typing — field expands up to 6 rows, then scrolls…"
        value={autoText}
        onChangeText={setAutoText}
        autoGrow
        rows={3}
        maxRows={6}
        helperText="autoGrow + maxRows=6"
      />
    </DemoShell>
  )
}

// ─── M9 · Card demo ───────────────────────────────────────────────────────────

function CardDemo() {
  const { colors, tokens } = useTheme()
  const [tapped, setTapped] = useState(false)

  return (
    <View style={{ gap: tokens.spacing[4] }}>

      {/* ── Variant: elevated (default) ───────────────────────────────────── */}
      <Card variant="elevated" padding="md">
        <CardHeader>
          <CardTitle>Elevated card</CardTitle>
          <CardDescription>Cross-platform shadow via shadowHelper — iOS + Android.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.sm }}>
            Any content goes here — text, images, form fields, etc.
          </Text>
        </CardContent>
        <CardFooter justify="end">
          <Badge variant="neutral" size="sm">variant=elevated</Badge>
        </CardFooter>
      </Card>

      {/* ── Variant: outlined ─────────────────────────────────────────────── */}
      <Card variant="outlined" padding="md">
        <CardHeader>
          <CardTitle>Outlined card</CardTitle>
          <CardDescription>1 pt border in semantic border colour. No shadow.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Badge variant="neutral" size="sm">variant=outlined</Badge>
        </CardFooter>
      </Card>

      {/* ── Variant: filled ───────────────────────────────────────────────── */}
      <Card variant="filled" padding="md">
        <CardHeader>
          <CardTitle>Filled card</CardTitle>
          <CardDescription>backgroundSubtle tinted surface — no border, no shadow.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Badge variant="neutral" size="sm">variant=filled</Badge>
        </CardFooter>
      </Card>

      {/* ── Padding variants ──────────────────────────────────────────────── */}
      <Card variant="outlined" padding="none">
        <View style={{ padding: tokens.spacing[2] }}>
          <Text style={{ color: colors.foreground, fontSize: tokens.fontSize.sm }}>padding=none (0 pt)</Text>
        </View>
      </Card>
      <Card variant="outlined" padding="sm">
        <CardTitle>padding=sm (12 pt)</CardTitle>
      </Card>
      <Card variant="outlined" padding="lg">
        <CardTitle>padding=lg (24 pt)</CardTitle>
        <CardDescription>Extra breathing room for content-heavy surfaces.</CardDescription>
      </Card>

      {/* ── CardHeader with leading + action slots ────────────────────────── */}
      <Card variant="elevated" padding="md">
        <CardHeader
          leading={
            <View style={{
              width: 40, height: 40,
              borderRadius: tokens.radius.md,
              backgroundColor: colors.primarySubtle,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>🧩</Text>
            </View>
          }
          action={
            <Badge variant="brand" size="sm">New</Badge>
          }
        >
          <CardTitle>With leading + action</CardTitle>
          <CardDescription>Icon in the leading slot, badge in the action slot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.sm }}>
            CardHeader rows flow: leading → main (title + description) → action.
          </Text>
        </CardContent>
      </Card>

      {/* ── Tappable card ─────────────────────────────────────────────────── */}
      <Card
        variant="elevated"
        padding="md"
        onPress={() => setTapped(t => !t)}
        accessibilityLabel="Tappable card — tap to toggle"
      >
        <CardHeader>
          <CardTitle>{tapped ? '✅ Tapped!' : 'Tappable card'}</CardTitle>
          <CardDescription>Pass onPress to make the entire card interactive. Press feedback via opacity.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Badge variant={tapped ? 'success' : 'neutral'} size="sm">
            {tapped ? 'pressed = true' : 'tap me'}
          </Badge>
        </CardFooter>
      </Card>

      {/* ── Disabled tappable card ────────────────────────────────────────── */}
      <Card
        variant="elevated"
        padding="md"
        onPress={() => {}}
        disabled
        accessibilityLabel="Disabled card"
      >
        <CardHeader>
          <CardTitle>Disabled card</CardTitle>
          <CardDescription>disabled=true — 50% opacity, press blocked.</CardDescription>
        </CardHeader>
      </Card>

      {/* ── Footer justify variants ───────────────────────────────────────── */}
      <Card variant="outlined" padding="md">
        <CardTitle>Footer justify</CardTitle>
        <CardFooter justify="start">
          <Badge variant="brand"   size="sm">Start</Badge>
          <Badge variant="neutral" size="sm">(default)</Badge>
        </CardFooter>
        <CardFooter justify="between">
          <Badge variant="success" size="sm">Between</Badge>
          <Badge variant="neutral" size="sm">→</Badge>
        </CardFooter>
        <CardFooter justify="end">
          <Badge variant="info"    size="sm">End</Badge>
        </CardFooter>
      </Card>

    </View>
  )
}

// ─── M10 · NavBar demo ────────────────────────────────────────────────────────

function NavBarDemo() {
  const { colors, tokens } = useTheme()
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    {
      key:     'home',
      label:   'Home',
      icon:    ({ color, size }: { color: string; size: number }) =>
                 <Ionicons name="home" color={color} size={size} />,
      active:  activeTab === 'home',
      onPress: () => setActiveTab('home'),
    },
    {
      key:     'search',
      label:   'Search',
      icon:    ({ color, size }: { color: string; size: number }) =>
                 <Ionicons name="search" color={color} size={size} />,
      active:  activeTab === 'search',
      onPress: () => setActiveTab('search'),
    },
    {
      key:     'notifications',
      label:   'Alerts',
      icon:    ({ color, size }: { color: string; size: number }) =>
                 <Ionicons name="notifications" color={color} size={size} />,
      active:  activeTab === 'notifications',
      onPress: () => setActiveTab('notifications'),
      badge:   3,
    },
    {
      key:     'profile',
      label:   'Profile',
      icon:    ({ color, size }: { color: string; size: number }) =>
                 <Ionicons name="person" color={color} size={size} />,
      active:  activeTab === 'profile',
      onPress: () => setActiveTab('profile'),
    },
  ]

  return (
    <View style={{ gap: tokens.spacing[4] }}>

      {/* ── Header: default ───────────────────────────────────────────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=default
        </Badge></View>
        <View style={{ borderRadius: tokens.radius.lg, overflow: 'hidden' }}>
          <Header
            title="Settings"
            leftAction={
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            }
            rightAction={
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.foreground} />
            }
          />
        </View>
      </View>

      {/* ── Header: elevated ──────────────────────────────────────────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=elevated
        </Badge></View>
        <Header
          variant="elevated"
          title="Home"
          leftAction={
            <Ionicons name="menu" size={24} color={colors.foreground} />
          }
          rightAction={
            <View style={{
              width: 32, height: 32,
              borderRadius: tokens.radius.full,
              backgroundColor: colors.primarySubtle,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 14 }}>R</Text>
            </View>
          }
        />
      </View>

      {/* ── Header: transparent (shown over a coloured backdrop) ──────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=transparent
        </Badge></View>
        <View style={{ borderRadius: tokens.radius.lg, overflow: 'hidden' }}>
          {/* Hero backdrop to show the transparent effect */}
          <View style={{
            height: 120,
            backgroundColor: colors.primary,
            justifyContent: 'flex-end',
          }}>
            <Header
              variant="transparent"
              title="Profile"
              leftAction={
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              }
              rightAction={
                <Ionicons name="share-outline" size={24} color="#ffffff" />
              }
              style={{ paddingTop: 0 }}  // demo: no real safe-area offset needed
            />
          </View>
        </View>
      </View>

      {/* ── Header: title only (no actions) ──────────────────────────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          title only
        </Badge></View>
        <View style={{ borderRadius: tokens.radius.lg, overflow: 'hidden' }}>
          <Header title="Notifications" />
        </View>
      </View>

      {/* ── TabBar: default ───────────────────────────────────────────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          TabBar variant=default
        </Badge></View>
        <View style={{ borderRadius: tokens.radius.lg, overflow: 'hidden' }}>
          <TabBar tabs={tabs} variant="default" />
        </View>
        <Text style={{
          marginTop:  tokens.spacing[1],
          fontSize:   tokens.fontSize.xs,
          color:      colors.foregroundMuted,
        }}>
          Active tab: {activeTab} — tap to switch
        </Text>
      </View>

      {/* ── TabBar: floating ──────────────────────────────────────────────── */}
      <View>
        <View style={{ marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          TabBar variant=floating
        </Badge></View>
        {/* Simulated page background behind the floating pill */}
        <View style={{
          backgroundColor: colors.backgroundSubtle,
          borderRadius:    tokens.radius.lg,
          paddingVertical: tokens.spacing[3],
        }}>
          <TabBar tabs={tabs} variant="floating" />
        </View>
      </View>

    </View>
  )
}

// ─── M11 · Dialog demo ────────────────────────────────────────────────────────

function DialogDemo() {
  const { colors, tokens } = useTheme()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [alertOpen,  setAlertOpen]  = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  return (
    <View style={{ gap: tokens.spacing[3] }}>

      {/* Last action feedback */}
      {lastAction && (
        <View style={{
          backgroundColor: colors.successSubtle,
          borderRadius:    tokens.radius.md,
          padding:         tokens.spacing[3],
        }}>
          <Text style={{ color: colors.success, fontSize: tokens.fontSize.sm }}>
            ✓ {lastAction}
          </Text>
        </View>
      )}

      {/* ── Trigger buttons ─────────────────────────────────────────────── */}
      <Button variant="primary" fullWidth onPress={() => { setLastAction(null); setModalOpen(true) }}>
        Open modal dialog
      </Button>
      <Button variant="secondary" fullWidth onPress={() => { setLastAction(null); setSheetOpen(true) }}>
        Open bottom sheet
      </Button>
      <Button variant="danger" fullWidth onPress={() => { setLastAction(null); setAlertOpen(true) }}>
        Open alert dialog
      </Button>

      {/* ── Modal variant ───────────────────────────────────────────────── */}
      <Dialog
        variant="modal"
        visible={modalOpen}
        onDismiss={() => setModalOpen(false)}
        title="Save changes?"
        description="Your unsaved changes will be lost if you leave without saving."
        actions={
          <>
            <Button
              variant="primary"
              fullWidth
              onPress={() => { setModalOpen(false); setLastAction('Changes saved') }}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => { setModalOpen(false); setLastAction('Dismissed without saving') }}
            >
              Discard
            </Button>
          </>
        }
      />

      {/* ── Sheet variant ───────────────────────────────────────────────── */}
      <Dialog
        variant="sheet"
        visible={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        title="Add photo"
        description="Choose how you'd like to add a photo to your profile."
        actions={
          <>
            <Button
              variant="primary"
              fullWidth
              onPress={() => { setSheetOpen(false); setLastAction('Camera opened') }}
            >
              Take photo
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => { setSheetOpen(false); setLastAction('Library opened') }}
            >
              Choose from library
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onPress={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

      {/* ── Alert variant ───────────────────────────────────────────────── */}
      <Dialog
        variant="alert"
        visible={alertOpen}
        onDismiss={() => setAlertOpen(false)}
        title="Delete account?"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        actions={
          <>
            <Button
              variant="danger"
              fullWidth
              onPress={() => { setAlertOpen(false); setLastAction('Account deleted') }}
            >
              Delete account
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => setAlertOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

    </View>
  )
}

// ─── M12 · Tabs demo ──────────────────────────────────────────────────────────

/** Simple pane content rendered inside each tab. */
function PaneContent({ label, color }: { label: string; color: string }) {
  const { colors, tokens } = useTheme()
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[2],
      padding: tokens.spacing[4],
    }}>
      <View style={{
        width: 48, height: 48,
        borderRadius: tokens.radius.full,
        backgroundColor: color,
        opacity: 0.18,
      }} />
      <Text style={{ color: colors.foreground, fontWeight: tokens.fontWeight.semibold }}>
        {label}
      </Text>
      <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.sm, textAlign: 'center' }}>
        Swipe left/right or tap a tab to switch panes.
      </Text>
    </View>
  )
}

function TabsDemo() {
  const { colors, tokens } = useTheme()

  const basicTabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: <PaneContent label="Overview" color={colors.primary} />,
    },
    {
      value: 'details',
      label: 'Details',
      content: <PaneContent label="Details" color={colors.success} />,
    },
    {
      value: 'history',
      label: 'History',
      content: <PaneContent label="History" color={colors.warning} />,
    },
  ]

  const scrollableTabs = [
    'All', 'Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support',
  ].map((label, i) => ({
    value: label.toLowerCase(),
    label,
    content: <PaneContent label={label} color={colors.primary} />,
  }))

  // Tab with one disabled entry
  const tabsWithDisabled = [
    { value: 'active',   label: 'Active',   content: <PaneContent label="Active"   color={colors.primary} /> },
    { value: 'pending',  label: 'Pending',  content: <PaneContent label="Pending"  color={colors.warning} /> },
    { value: 'archived', label: 'Archived', disabled: true, content: <PaneContent label="Archived" color={colors.foregroundSubtle} /> },
  ]

  return (
    <View style={{ gap: tokens.spacing[5] }}>

      {/* ── Line (default) ────────────────────────────────────────────────── */}
      <View>
        <View style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=line (default)
        </Badge></View>
        <View style={{ height: 200, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: tokens.borderWidth[1], borderColor: colors.border }}>
          <Tabs
            variant="line"
            tabs={basicTabs}
            defaultValue="overview"
          />
        </View>
      </View>

      {/* ── Pill ──────────────────────────────────────────────────────────── */}
      <View>
        <View style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=pill
        </Badge></View>
        <View style={{ height: 200, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: tokens.borderWidth[1], borderColor: colors.border }}>
          <View style={{ padding: tokens.spacing[2], backgroundColor: colors.backgroundSubtle }}>
            <Tabs
              variant="pill"
              tabs={basicTabs}
              defaultValue="details"
            />
          </View>
        </View>
      </View>

      {/* ── Filled ────────────────────────────────────────────────────────── */}
      <View>
        <View style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          variant=filled
        </Badge></View>
        <View style={{ height: 200, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: tokens.borderWidth[1], borderColor: colors.border }}>
          <Tabs
            variant="filled"
            tabs={basicTabs}
            defaultValue="history"
          />
        </View>
      </View>

      {/* ── Scrollable strip ──────────────────────────────────────────────── */}
      <View>
        <View style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          scrollable=true · 7 tabs · variant=line
        </Badge></View>
        <View style={{ height: 180, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: tokens.borderWidth[1], borderColor: colors.border }}>
          <Tabs
            variant="line"
            scrollable
            tabs={scrollableTabs}
            defaultValue="all"
          />
        </View>
      </View>

      {/* ── Disabled tab ──────────────────────────────────────────────────── */}
      <View>
        <View style={{ alignSelf: 'flex-start', marginBottom: tokens.spacing[2] }}><Badge variant="neutral" size="sm">
          disabled tab · variant=pill
        </Badge></View>
        <View style={{ height: 180, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: tokens.borderWidth[1], borderColor: colors.border }}>
          <Tabs
            variant="pill"
            tabs={tabsWithDisabled}
            defaultValue="active"
          />
        </View>
      </View>

    </View>
  )
}

// ─── Main demo screen ─────────────────────────────────────────────────────────

function DemoScreen() {
  const { colors, tokens } = useTheme()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: tokens.spacing[4] }}>

          <Text style={{
            fontSize:   tokens.fontSize['2xl'],
            fontWeight: tokens.fontWeight.bold,
            color:      colors.foreground,
            marginBottom: tokens.spacing[1],
          }}>
            Atlas Mobile
          </Text>
          <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.sm, marginBottom: tokens.spacing[2] }}>
            Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅ · Phase 4 ✅ · All 12 components complete
          </Text>

          <SectionHeading>Phase 0 · Foundation</SectionHeading>
          <PhaseZeroStatus />

          <SectionHeading>M1 · Badge</SectionHeading>
          <BadgeDemo />

          <SectionHeading>M2 · Label</SectionHeading>
          <LabelDemo />

          <SectionHeading>M3 · Alert</SectionHeading>
          <AlertDemo />

          <SectionHeading>M4 · Button</SectionHeading>
          <ButtonDemo />

          <SectionHeading>M5 · Input</SectionHeading>
          <InputDemo />

          <SectionHeading>M8 · Switch</SectionHeading>
          <SwitchDemo />

          <SectionHeading>M7 · Checkbox</SectionHeading>
          <CheckboxDemo />

          <SectionHeading>M6 · Textarea</SectionHeading>
          <TextareaDemo />

          <SectionHeading>M9 · Card</SectionHeading>
          <CardDemo />

          <SectionHeading>M10 · NavBar</SectionHeading>
          <NavBarDemo />

          <SectionHeading>M11 · Dialog</SectionHeading>
          <DialogDemo />

          <SectionHeading>M12 · Tabs</SectionHeading>
          <TabsDemo />

          <View style={{ height: tokens.spacing[8] }} />
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DemoScreen />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
