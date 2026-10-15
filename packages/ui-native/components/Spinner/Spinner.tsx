import React, { useEffect, useRef } from 'react'
import { View, Animated, Easing } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { duration } from '../../tokens/atlas.tokens'
import {
  createSpinnerStyles,
  getSpinnerGeometry,
  TICK_COUNT,
} from './Spinner.styles'
import type { SpinnerVariant, SpinnerSize } from './Spinner.styles'

export type { SpinnerVariant, SpinnerSize }

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpinnerProps {
  /** Glyph: the arc (`default`) or eight ticks (`custom`). @default 'default' */
  variant?: SpinnerVariant
  /** Icon size: 16, 20, 24 or 32 pt. @default 'md' */
  size?: SpinnerSize
  /** Accessible name announced to screen readers. @default 'Loading' */
  label?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Spinner({ variant = 'default', size = 'md', label = 'Loading' }: SpinnerProps) {
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion()
  const g = getSpinnerGeometry(size)
  const styles = createSpinnerStyles(g, colors)

  // 0..1 is one clockwise turn. Under Reduce Motion the glyph stays still.
  const turn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    turn.setValue(0)
    if (reduceMotion) return
    const loop = Animated.loop(
      Animated.timing(turn, {
        toValue:         1,
        duration:        duration.spin,
        easing:          Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, turn])

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <View
      style={styles.box}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <Animated.View style={[styles.glyph, { transform: [{ rotate }] }]}>
        {variant === 'default' ? (
          <View style={[styles.arc, { transform: [{ rotate: g.arcOffset }] }]}>
            <View style={styles.clipRight}>
              <View style={[styles.ringInRight, { transform: [{ rotate: g.rotateRight }] }]} />
            </View>
            <View style={styles.clipLeft}>
              <View style={[styles.ringInLeft, { transform: [{ rotate: g.rotateLeft }] }]} />
            </View>
            <View style={[styles.cap, { start: g.capStart.start, top: g.capStart.top }]} />
            <View style={[styles.cap, { start: g.capEnd.start, top: g.capEnd.top }]} />
          </View>
        ) : (
          Array.from({ length: TICK_COUNT }, (_, i) => (
            <View
              key={i}
              style={[styles.tickWrap, { transform: [{ rotate: `${(360 / TICK_COUNT) * i}deg` }] }]}
            >
              <View style={styles.tick} />
            </View>
          ))
        )}
      </Animated.View>
    </View>
  )
}

export default Spinner
