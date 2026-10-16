import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useTheme } from '../../theme/useTheme'
import { useReducedMotion } from '../../utils/useReducedMotion'
import { duration, easing } from '../../tokens/atlas.tokens'
import { createProgressStyles } from './Progress.styles'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProgressProps {
  /** Current value, clamped to 0…`max`. Ignored when `indeterminate`. @default 0 */
  value?: number
  /** Value at which the bar is full. @default 100 */
  max?: number
  /** Unknown duration: a segment slides along the track and no value is announced. */
  indeterminate?: boolean
  /** Text above the bar; also the accessible name. */
  label?: string
  /** Value text beside the label, e.g. "62%". */
  valueLabel?: string
  /** Text below the bar. */
  helperText?: string
  /** Screen-reader name when there is no visible `label`. */
  accessibilityLabel?: string
  /** Readable value for assistive tech, e.g. "3 of 5 steps". */
  accessibilityValueText?: string
}

/** The sliding segment is this fraction of the track wide. */
const SEGMENT = 0.4
/** Where the segment rests when the slide is stopped (Reduce Motion), as a fraction of the track. */
const SEGMENT_REST = 0.3

// ─── Component ────────────────────────────────────────────────────────────────

export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  valueLabel,
  helperText,
  accessibilityLabel,
  accessibilityValueText,
}: ProgressProps) {
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion()
  const styles = createProgressStyles(colors)

  const safeMax = max > 0 ? max : 100
  const now = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax)
  const fraction = now / safeMax

  // Determinate: the fill width animates to the new fraction with duration/base.
  const fill = useRef(new Animated.Value(fraction)).current
  useEffect(() => {
    if (indeterminate) return
    if (reduceMotion) {
      fill.setValue(fraction)
      return
    }
    const anim = Animated.timing(fill, {
      toValue:         fraction,
      duration:        duration.base,
      easing:          Easing.bezier(...easing.standard),
      useNativeDriver: false,   // width is not a native-driven property
    })
    anim.start()
    return () => anim.stop()
  }, [fraction, indeterminate, reduceMotion, fill])

  // Indeterminate: a segment slides across the track over duration/pulse, linear, looping.
  // Under Reduce Motion the slide stops and the segment rests in place.
  const [trackWidth, setTrackWidth] = useState(0)
  const slide = useRef(new Animated.Value(0)).current
  useEffect(() => {
    slide.setValue(0)
    if (!indeterminate || reduceMotion || trackWidth === 0) return
    const loop = Animated.loop(
      Animated.timing(slide, {
        toValue:         1,
        duration:        duration.pulse,
        easing:          Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [indeterminate, reduceMotion, trackWidth, slide])

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)
  const segmentWidth = trackWidth * SEGMENT
  const translateX = reduceMotion
    ? trackWidth * SEGMENT_REST
    : slide.interpolate({ inputRange: [0, 1], outputRange: [-segmentWidth, trackWidth] })

  const hasHeader = !!label || !!valueLabel

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={
        indeterminate
          ? undefined
          : { min: 0, max: safeMax, now, text: accessibilityValueText }
      }
      accessibilityState={{ busy: indeterminate }}
    >
      {hasHeader && (
        <View style={styles.labelRow}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {!!valueLabel && <Text style={styles.valueLabel}>{valueLabel}</Text>}
        </View>
      )}

      <View style={styles.track} onLayout={onTrackLayout}>
        {indeterminate ? (
          <Animated.View
            style={[styles.segment, { width: segmentWidth, transform: [{ translateX }] }]}
          />
        ) : (
          <Animated.View
            style={[
              styles.fill,
              { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        )}
      </View>

      {!!helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  )
}

export default Progress
