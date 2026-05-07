import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Switch, ScrollView } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './theme'
import { shadowHelper } from './utils/shadowHelper'
import { useReducedMotion } from './utils/useReducedMotion'

// ??? Demo screen ??????????????????????????????????????????????????????????????
// Phase 0 sign-off screen: exercises ThemeProvider, useTheme, shadowHelper,
// and useReducedMotion before any real components are built.

function PhaseZeroDemo() {
  const { colors, tokens, colorScheme } = useTheme()
  const reduceMotion = useReducedMotion()

  const s = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safe: {
      flex: 1,
    },
    container: {
      padding: tokens.spacing[4],
      gap: tokens.spacing[4],
    },
    heading: {
      fontSize: tokens.fontSize['2xl'],
      fontWeight: tokens.fontWeight.bold,
      color: colors.foreground,
    },
    subheading: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: colors.foregroundMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: tokens.spacing[1],
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[4],
      borderWidth: tokens.borderWidth[1],
      borderColor: colors.border,
      ...shadowHelper('md', colorScheme),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: tokens.fontSize.base,
      color: colors.foreground,
    },
    value: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.semibold,
      color: colors.primary,
    },
    chip: {
      paddingHorizontal: tokens.spacing[3],
      paddingVertical: tokens.spacing[1],
      borderRadius: tokens.radius.full,
      alignSelf: 'flex-start',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: tokens.spacing[1],
    },
  })

  const tokenRows: Array<[string, string]> = [
    ['colorScheme',   colorScheme],
    ['primary',       colors.primary],
    ['background',    colors.background],
    ['surface',       colors.surface],
    ['foreground',    colors.foreground],
    ['border',        colors.border],
    ['danger',        colors.danger],
    ['success',       colors.success],
  ]

  return (
    <ScrollView style={s.scroll}>
      <SafeAreaView style={s.safe}>
        <View style={s.container}>

          <Text style={s.heading}>Atlas Mobile</Text>
          <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.sm }}>
            Phase 0 foundation sign-off
          </Text>

          {/* Theme tokens */}
          <Text style={s.subheading}>Semantic colours</Text>
          <View style={s.card}>
            {tokenRows.map(([key, val], i) => (
              <View key={key}>
                {i > 0 && <View style={s.divider} />}
                <View style={[s.row, { paddingVertical: tokens.spacing[1] }]}>
                  <Text style={s.label}>{key}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
                    {val.startsWith('#') && (
                      <View style={{
                        width: 16, height: 16,
                        borderRadius: tokens.radius.sm,
                        backgroundColor: val,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }} />
                    )}
                    <Text style={s.value}>{val}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Shadow helper */}
          <Text style={s.subheading}>Shadow helper</Text>
          <View style={{ flexDirection: 'row', gap: tokens.spacing[3] }}>
            {(['sm', 'md', 'lg', 'xl'] as const).map(level => (
              <View
                key={level}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  backgroundColor: colors.surface,
                  borderRadius: tokens.radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadowHelper(level, colorScheme),
                }}
              >
                <Text style={{ color: colors.foregroundMuted, fontSize: tokens.fontSize.xs }}>{level}</Text>
              </View>
            ))}
          </View>

          {/* Reduce motion */}
          <Text style={s.subheading}>Reduced motion</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Text style={s.label}>useReducedMotion()</Text>
              <View style={[s.chip, { backgroundColor: reduceMotion ? colors.successSubtle : colors.backgroundMuted }]}>
                <Text style={{ color: reduceMotion ? colors.success : colors.foregroundMuted, fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.semibold }}>
                  {reduceMotion ? 'true' : 'false'}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

// ??? Root ?????????????????????????????????????????????????????????????????????

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PhaseZeroDemo />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
