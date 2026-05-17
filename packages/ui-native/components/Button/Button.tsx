import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { createButtonStyles } from './Button.styles'
import type { ButtonVariant, ButtonSize } from './Button.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps {
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant
  /** Size scale. @default 'md' */
  size?: ButtonSize
  /** Disables all interaction and dims the button. */
  disabled?: boolean
  /** Shows a spinner and suppresses interaction (e.g. during async action). */
  loading?: boolean
  /** Icon rendered before the label. */
  iconLeft?: React.ReactNode
  /** Icon rendered after the label. */
  iconRight?: React.ReactNode
  /** Stretches the button to fill its parent container. */
  fullWidth?: boolean
  /** Label text. */
  children: React.ReactNode
  /** Press handler. */
  onPress?: (event: GestureResponderEvent) => void
  /** Accessibility label override. */
  accessibilityLabel?: string
  /** Accessibility hint. */
  accessibilityHint?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme()
  const styles = createButtonStyles(variant, size, colors, fullWidth)

  const isInteractionDisabled = disabled || loading

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pressable,
        isInteractionDisabled && { opacity: 0.5 },
      ]}
      onPress={isInteractionDisabled ? undefined : onPress}
      disabled={isInteractionDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.container,
            pressed && !isInteractionDisabled && styles.containerPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={styles.iconColor}
            />
          ) : (
            <>
              {iconLeft}
              <Text style={styles.label} numberOfLines={1}>
                {children}
              </Text>
              {iconRight}
            </>
          )}
        </View>
      )}
    </Pressable>
  )
}

export default Button
