import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { createBadgeStyles } from './Badge.styles'
import type { BadgeVariant, BadgeSize } from './Badge.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BadgeProps {
  /** Visual style — maps to semantic colour palette. @default 'neutral' */
  variant?: BadgeVariant
  /** Size scale. @default 'md' */
  size?: BadgeSize
  /** When true, renders a dot indicator instead of a text label. */
  dot?: boolean
  /** The text label to display (ignored when dot={true}). */
  children?: React.ReactNode
  /** Accessibility label override (useful when dot={true} has no visible text). */
  accessibilityLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  accessibilityLabel,
}: BadgeProps) {
  const { colors } = useTheme()
  const styles = createBadgeStyles(variant, size, colors)

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? (dot ? variant : undefined)}
    >
      {dot ? (
        <View style={styles.dot} />
      ) : (
        <Text style={styles.label} numberOfLines={1}>
          {children}
        </Text>
      )}
    </View>
  )
}

export default Badge
