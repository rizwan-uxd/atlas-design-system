/**
 * Atlas Header — M10 · Mobile (Phase 3 · Layout)
 *
 * Top navigation header with safe-area awareness.
 *
 * Variants:
 *   default      — opaque surface + bottom border. Standard screen header.
 *   transparent  — no background; positioned absolute so content scrolls beneath it.
 *                  Use with a scroll listener to crossfade to opaque on scroll.
 *   elevated     — surface + drop shadow, no border. Floating effect.
 *
 * Slots:
 *   leftAction   — back button, hamburger, close icon, or any ReactNode.
 *                  Fixed 40pt wide so the title stays centred.
 *   rightAction  — icon button, avatar, badge, or any ReactNode.
 *                  Fixed 40pt wide, mirrors the left slot.
 *   title        — centred string. Pass titleStyle to override colour, e.g.
 *                  for transparent variant over a dark image.
 *
 * Safe area:
 *   useSafeAreaInsets().top is applied as paddingTop on the container so the
 *   header never overlaps the status bar or Dynamic Island on any device.
 *
 * Accessibility:
 *   The header container has accessibilityRole="header" so screen readers
 *   announce it as a landmark. The title Text is the visible label.
 *   leftAction / rightAction children should each carry their own
 *   accessibilityLabel (e.g. "Go back", "Open menu").
 *
 * Usage:
 *   // Default
 *   <Header title="Settings" leftAction={<BackButton />} />
 *
 *   // Transparent over a hero image
 *   <Header variant="transparent" title="Profile" titleStyle={{ color: '#fff' }} />
 *
 *   // Elevated with right action
 *   <Header variant="elevated" title="Home" rightAction={<AvatarButton />} />
 */

import React from 'react'
import { View, Text, type TextStyle, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme }          from '../../theme/useTheme'
import { createHeaderStyles } from './NavBar.styles'
import type { HeaderVariant } from './NavBar.styles'

export type { HeaderVariant }

// ─── Props ────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  /** Centred title string. */
  title?: string
  /** Visual treatment of the header surface. @default 'default' */
  variant?: HeaderVariant
  /** Inline-start slot — back button, menu icon, or any ReactNode. */
  leftAction?: React.ReactNode
  /** Inline-end slot — icon button, avatar, or any ReactNode. */
  rightAction?: React.ReactNode
  /**
   * Override the title text style — useful for transparent variant where
   * you need white text over a dark hero image.
   */
  titleStyle?: TextStyle
  /** Additional style merged onto the outer container. */
  style?: ViewStyle
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Header({
  title,
  variant     = 'default',
  leftAction,
  rightAction,
  titleStyle,
  style,
}: HeaderProps) {
  const { colors, colorScheme } = useTheme()
  const insets  = useSafeAreaInsets()
  const styles  = createHeaderStyles(variant, colors, colorScheme)

  return (
    <View
      style={[
        styles.container,
        // Dynamic safe-area top inset — keeps header below status bar / notch.
        { paddingTop: insets.top },
        style,
      ]}
      accessibilityRole="header"
    >
      <View style={styles.content}>
        {/* ── Left slot ──────────────────────────────────────────────────── */}
        <View style={styles.leftSlot}>
          {leftAction ?? null}
        </View>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        {title !== undefined && (
          <Text
            style={[
              styles.title,
              variant === 'transparent' && styles.titleTransparent,
              titleStyle,
            ]}
            numberOfLines={1}
            accessibilityRole="text"
          >
            {title}
          </Text>
        )}

        {/* ── Right slot ─────────────────────────────────────────────────── */}
        <View style={styles.rightSlot}>
          {rightAction ?? null}
        </View>
      </View>
    </View>
  )
}

export default Header
