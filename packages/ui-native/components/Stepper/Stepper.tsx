import React, { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { useReducedMotion, getDuration } from '../../utils/useReducedMotion'
import { duration } from '../../tokens/atlas.tokens'
import { createStepperStyles } from './Stepper.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StepperStep {
  /** Step name shown beside the ring and read out by screen readers. */
  label: string
}

export interface StepperProps {
  /** Ordered steps. The ring shows `current / steps.length`. */
  steps: StepperStep[]
  /** 1-based current step, clamped to 1..steps.length. @default 1 */
  current?: number
  /** Accessibility label for the whole stepper. */
  accessibilityLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Stepper({ steps, current = 1, accessibilityLabel }: StepperProps) {
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion()
  const styles = createStepperStyles(colors)

  const count = steps.length
  const step = count === 0 ? 0 : Math.min(Math.max(Math.round(current), 1), count)
  const fraction = count === 0 ? 0 : step / count

  // 0..1 progress; the initial value is seeded so mount does not animate.
  const progress = useRef(new Animated.Value(fraction)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue:         fraction,
      duration:        getDuration(duration.base, reduceMotion),
      useNativeDriver: true,
    }).start()
  }, [fraction, reduceMotion, progress])

  // Each half rotates its 180° arc into its own half of the circle.
  const rotateRight = progress.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: ['-135deg', '45deg', '45deg'],
  })
  const rotateLeft = progress.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: ['45deg', '45deg', '225deg'],
  })

  const label = steps[step - 1]?.label ?? ''
  const next = step < count ? steps[step]?.label : undefined
  const summary = `Step ${step} of ${count}: ${label}${next ? `. Next: ${next}` : ''}`

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: Math.max(count, 1), now: step, text: summary }}
    >
      <View style={styles.ringWrap}>
        <View style={styles.track} />
        <View style={styles.clipRight}>
          <Animated.View style={[styles.ringInRight, { transform: [{ rotate: rotateRight }] }]} />
        </View>
        <View style={styles.clipLeft}>
          <Animated.View style={[styles.ringInLeft, { transform: [{ rotate: rotateLeft }] }]} />
        </View>
        <View style={styles.count}>
          <Text style={styles.countText}>{step} of {count}</Text>
        </View>
      </View>
      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        {next ? <Text style={styles.next} numberOfLines={1}>Next: {next}</Text> : null}
      </View>
    </View>
  )
}

export default Stepper
