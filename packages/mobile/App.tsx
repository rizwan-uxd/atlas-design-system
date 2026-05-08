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
import { Input }    from './components/Input/Input'
import { Textarea } from './components/Textarea/Textarea'

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

function Card({ children }: { children: React.ReactNode }) {
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
    <Card>
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
    </Card>
  )
}

// ─── M1 · Badge demo ──────────────────────────────────────────────────────────

function BadgeDemo() {
  return (
    <Card>
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
    </Card>
  )
}

// ─── M2 · Label demo ─────────────────────────────────────────────────────────

function LabelDemo() {
  return (
    <Card>
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
    </Card>
  )
}

// ─── M3 · Alert demo ─────────────────────────────────────────────────────────

function AlertDemo() {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})

  return (
    <Card>
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
    </Card>
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
    <Card>
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
    </Card>
  )
}

// ─── M5 · Input demo ─────────────────────────────────────────────────────────

function InputDemo() {
  const { tokens } = useTheme()
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Card>
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
    </Card>
  )
}

// ─── M6 · Textarea demo ───────────────────────────────────────────────────────

function TextareaDemo() {
  const { tokens } = useTheme()
  const [bio, setBio]             = useState('')
  const [limited, setLimited]     = useState('')
  const [autoText, setAutoText]   = useState('')

  return (
    <Card>
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
    </Card>
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
            Phase 1 · Primitives ✅ · Phase 2 · Forms (M5–M6 done)
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

          <SectionHeading>M6 · Textarea</SectionHeading>
          <TextareaDemo />

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
