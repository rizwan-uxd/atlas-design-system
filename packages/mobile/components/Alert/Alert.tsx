import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/useTheme'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { createAlertStyles } from './Alert.styles'
import type { AlertVariant } from './Alert.styles'
import tokens from '../../tokens/atlas.tokens'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_NAME: Record<AlertVariant, React.ComponentProps<typeof Ionicons>['name']> = {
  info:    'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger:  'close-circle',
}

const ICON_SIZE = 18

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AlertProps {
  /** Visual style and colour palette. */
  variant: AlertVariant
  /** Bold heading line (optional). */
  title?: string
  /** Main message text. */
  description: string
  /** When provided, a dismiss button is shown. Fires when the user taps it. */
  onDismiss?: () => void
  /** Show the leading icon. @default true */
  icon?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Alert({
  variant,
  title,
  description,
  onDismiss,
  icon = true,
}: AlertProps) {
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion()
  const styles = createAlertStyles(variant, colors)

  // Animated values for dismiss fade
  const opacity   = useRef(new Animated.Value(1)).current
  const maxHeight = useRef(new Animated.Value(300)).current  // generous cap

  const handleDismiss = () => {
    if (reduceMotion) {
      // Instant — skip animation, fire callback
      onDismiss?.()
      return
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue:         0,
        duration:        tokens.duration.base,   // 200ms
        useNativeDriver: false,
      }),
      Animated.timing(maxHeight, {
        toValue:         0,
        duration:        tokens.duration.base,
        useNativeDriver: false,
      }),
    ]).start(() => onDismiss?.())
  }

  return (
    <Animated.View style={{ opacity, maxHeight, overflow: 'hidden' }}>
      <View
        style={styles.container}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {/* Leading icon */}
        {icon && (
          <View style={styles.iconWrapper}>
            <Ionicons
              name={ICON_NAME[variant]}
              size={ICON_SIZE}
              color={styles.iconColor}
            />
          </View>
        )}

        {/* Body */}
        <View style={styles.body}>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            style={styles.dismissButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss alert"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="close"
              size={16}
              color={styles.iconColor}
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  )
}

export default Alert
