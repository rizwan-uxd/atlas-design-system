/**
 * Atlas TabBar — M10 · Mobile (Phase 3 · Layout)
 *
 * Bottom tab navigation bar with safe-area awareness.
 *
 * Variants:
 *   default   — full-width bar anchored to the bottom edge, surface colour +
 *               top border. Matches the native iOS/Android tab bar position.
 *   floating  — pill-shaped card that hovers above the home indicator with
 *               horizontal margin and an elevated shadow. Useful for a more
 *               expressive or modern navigation style.
 *
 * Icon API:
 *   Each tab's `icon` prop is a render function:
 *     icon: (props: { color: string; size: number }) => React.ReactNode
 *   This pattern lets callers pass any icon library (Ionicons, SF Symbols via
 *   expo-symbols, custom SVGs) without TabBar importing one directly.
 *
 * Active / inactive state:
 *   Active   → icon and label rendered in `colors.primary`
 *   Inactive → icon and label rendered in `colors.foregroundSubtle`
 *
 * Safe area:
 *   useSafeAreaInsets().bottom is applied as paddingBottom on the container so
 *   the bar always clears the home indicator on notchless and notched devices.
 *   The floating variant adds its own marginBottom on top of that inset.
 *
 * Touch targets:
 *   Each tab item has minHeight: 56pt (> WCAG 2.5.5 44pt minimum).
 *
 * Accessibility:
 *   accessibilityRole="tablist" on the container.
 *   Each tab item: accessibilityRole="tab", accessibilityState.selected,
 *   accessibilityLabel = tab label.
 *
 * Usage:
 *   import { Ionicons } from '@expo/vector-icons'
 *
 *   const [active, setActive] = useState('home')
 *
 *   <TabBar
 *     variant="default"
 *     tabs={[
 *       {
 *         key:    'home',
 *         label:  'Home',
 *         icon:   ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
 *         active: active === 'home',
 *         onPress: () => setActive('home'),
 *       },
 *       // …
 *     ]}
 *   />
 */

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme }          from '../../theme/useTheme'
import { createTabBarStyles } from './NavBar.styles'
import type { TabBarVariant } from './NavBar.styles'
import tokens                 from '../../tokens/atlas.tokens'

export type { TabBarVariant }

// ─── Types ────────────────────────────────────────────────────────────────────

/** Icon render prop — receives resolved color and size from TabBar. */
export type TabIconRenderer = (props: { color: string; size: number }) => React.ReactNode

export interface TabItem {
  /** Unique key for this tab — used as React key and for identification. */
  key: string
  /** Visible label below the icon. */
  label: string
  /**
   * Icon render function.
   * @example ({ color, size }) => <Ionicons name="home" color={color} size={size} />
   */
  icon: TabIconRenderer
  /** Whether this tab is the currently active route. */
  active: boolean
  /** Called when the tab is pressed. */
  onPress: () => void
  /** Optional badge count or dot. Pass a number for count, true for a dot. */
  badge?: number | boolean
}

export interface TabBarProps {
  /** Array of tab descriptors. @min 2  @max 5 (HIG recommendation) */
  tabs: TabItem[]
  /** Visual treatment. @default 'default' */
  variant?: TabBarVariant
}

// ─── Badge helper ─────────────────────────────────────────────────────────────

function TabBadge({ value, color }: { value: number | boolean; color: string }) {
  const isDot   = value === true
  const count   = typeof value === 'number' ? value : 0
  const label   = count > 99 ? '99+' : String(count)

  return (
    <View
      style={{
        position:        'absolute',
        top:             -2,
        right:           isDot ? -2 : -6,
        minWidth:        isDot ? 8 : 16,
        height:          isDot ? 8 : 16,
        borderRadius:    tokens.radius.full,
        backgroundColor: color,
        alignItems:      'center',
        justifyContent:  'center',
        paddingHorizontal: isDot ? 0 : 4,
      }}
      accessibilityLabel={isDot ? 'notification' : `${label} notifications`}
    >
      {!isDot && (
        <Text style={{
          fontSize:   9,
          fontWeight: tokens.fontWeight.bold,
          color:      '#ffffff',
          lineHeight: 12,
        }}>
          {label}
        </Text>
      )}
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabBar({ tabs, variant = 'default' }: TabBarProps) {
  const { colors, colorScheme } = useTheme()
  const insets  = useSafeAreaInsets()
  const styles  = createTabBarStyles(variant, colors, colorScheme)

  // For the floating variant the container has its own marginBottom, so
  // we still need to add the home-indicator inset so the pill sits above it.
  const bottomPad = insets.bottom

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottomPad },
      ]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const iconColor = tab.active ? colors.primary : colors.foregroundSubtle

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              pressed && { opacity: tokens.opacity.hover },
            ]}
            onPress={tab.onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.active }}
            accessibilityLabel={tab.label}
          >
            {/* ── Icon + optional badge ──────────────────────────────────── */}
            <View style={{ position: 'relative' }}>
              {tab.icon({ color: iconColor, size: 24 })}
              {tab.badge !== undefined && tab.badge !== false && (
                <TabBadge value={tab.badge} color={colors.danger} />
              )}
            </View>

            {/* ── Label ─────────────────────────────────────────────────── */}
            <Text
              style={[
                styles.label,
                { color: iconColor },
                tab.active && { fontWeight: tokens.fontWeight.semibold },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default TabBar
