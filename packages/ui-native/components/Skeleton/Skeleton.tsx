import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { duration, easing, opacity } from '../../tokens/atlas.tokens'
import { createSkeletonStyles } from './Skeleton.styles'
import type { SkeletonShape } from './Skeleton.styles'

export type { SkeletonShape }

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SkeletonProps {
  /** Rounded block (`rect`) or round (`circle`, for avatars). @default 'rect' */
  shape?: SkeletonShape
  /** Override the default size, e.g. `{ width: 120 }` or `{ height: 24 }`. */
  style?: StyleProp<ViewStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Skeleton({ shape = 'rect', style }: SkeletonProps) {
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion()
  const styles = createSkeletonStyles(shape, colors)

  // Opacity goes 1 -> opacity/pulse -> 1 over duration/pulse. Under Reduce
  // Motion the block stays at full opacity.
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    pulse.setValue(1)
    if (reduceMotion) return
    const half = duration.pulse / 2
    const ease = Easing.bezier(...easing.standard)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: opacity.pulse, duration: half, easing: ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,             duration: half, easing: ease, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, pulse])

  // Hidden from assistive tech: the loading container owns the busy state.
  return (
    <Animated.View
      style={[styles.block, style, { opacity: pulse }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  )
}

export default Skeleton
