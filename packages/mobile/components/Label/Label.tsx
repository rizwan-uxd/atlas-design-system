import React from 'react'
import { Text, View } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { createLabelStyles } from './Label.styles'
import type { LabelSize } from './Label.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LabelProps {
  /** Typography size scale — passed explicitly (no CSS cascade in RN). @default 'md' */
  size?: LabelSize
  /** Appends a required asterisk (*) in danger colour. */
  required?: boolean
  /** Reduces opacity to tokens.opacity.disabled. Suppresses interaction hints. */
  disabled?: boolean
  /**
   * Native ID to expose to sibling Input via accessibilityLabelledBy.
   * Set this to a unique string and pass the same value to Input's
   * `accessibilityLabelledBy` prop.
   */
  nativeID?: string
  children: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Label({
  size = 'md',
  required = false,
  disabled = false,
  nativeID,
  children,
}: LabelProps) {
  const { colors } = useTheme()
  const styles = createLabelStyles(size, disabled, colors)

  return (
    <View
      style={styles.root}
      nativeID={nativeID}
      accessibilityRole="text"
    >
      <Text style={styles.text}>{children}</Text>
      {required && (
        <Text
          style={styles.asterisk}
          accessibilityLabel="required"
          importantForAccessibility="no"
        >
          {' *'}
        </Text>
      )}
    </View>
  )
}

export default Label
