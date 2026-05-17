/**
 * Atlas Switch — M8 · Mobile
 *
 * Custom Pressable + Animated thumb implementation (Option B).
 * The built-in RN <Switch> was skipped because it doesn't support size variants
 * and uses platform-native styling that diverges from Atlas tokens.
 *
 * Sizes:   sm · md · lg
 * States:  off · on · disabled
 *
 * Touch target:
 *   Full row (track + label) is one Pressable with minHeight: 44pt.
 *
 * Animation:
 *   Thumb translates on the X-axis from thumbOff → thumbOn (or back).
 *   The track background colour switches instantly on state change —
 *   backgroundColor cannot use the native driver, so we re-render the style
 *   rather than animating it (avoids a JS-thread animation).
 *   Duration collapses to 0 when Reduce Motion is on.
 *
 * Accessibility:
 *   accessibilityRole="switch"
 *   accessibilityState.checked = value (true = on, false = off)
 *   accessibilityState.disabled = disabled
 *   accessibilityLabel = label prop (or explicit accessibilityLabel for track-only use)
 */

import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

import { useTheme }                      from '../../theme/useTheme'
import { useReducedMotion, getDuration } from '../../utils/useReducedMotion'
import { createSwitchStyles, TRACK }     from './Switch.styles'
import type { SwitchSize }               from './Switch.styles'
import tokens                            from '../../tokens/atlas.tokens'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SwitchProps {
  /** Current on/off state. @default false */
  value?: boolean
  /** Prevents interaction; renders at 50% opacity. @default false */
  disabled?: boolean
  /** Track and thumb size. @default 'md' */
  size?: SwitchSize
  /** Label text rendered to the right of the track. Full row is tappable. */
  label?: string
  /** Called with the next value when the row is pressed. */
  onValueChange?: (value: boolean) => void
  /**
   * Screen-reader label for track-only usage (when no visible `label` is set).
   * When `label` is provided it is used as the accessible name automatically.
   */
  accessibilityLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Switch({
  value                          = false,
  disabled                       = false,
  size                           = 'md',
  label,
  onValueChange,
  accessibilityLabel: a11yLabel,
}: SwitchProps) {
  const { colors }   = useTheme()
  const reduceMotion = useReducedMotion()

  // ── Thumb translation animation ───────────────────────────────────────────
  //
  // Initialise to the current value's position so there is no pop on mount.
  const track       = TRACK[size]
  const translateAnim = useRef(
    new Animated.Value(value ? track.thumbOn : track.thumbOff),
  ).current

  useEffect(() => {
    // Re-derive track dimensions in case size changes at runtime.
    const t = TRACK[size]
    Animated.timing(translateAnim, {
      toValue:         value ? t.thumbOn : t.thumbOff,
      duration:        getDuration(tokens.duration.base, reduceMotion), // 200 ms | 0
      useNativeDriver: true,  // translateX only — no layout changes
    }).start()
  }, [value, size, reduceMotion])

  // ── Derived ───────────────────────────────────────────────────────────────
  const styles = createSwitchStyles(size, value, disabled, colors)

  // ── Press handler ─────────────────────────────────────────────────────────
  function handlePress() {
    onValueChange?.(!value)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && { opacity: tokens.opacity.hover },
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label ?? a11yLabel}
    >
      {/* ── Track ──────────────────────────────────────────────────────────── */}
      {/*
       * Track background colour is controlled via the style factory (re-render)
       * rather than Animated.timing so translateX can stay on the native driver.
       */}
      <View style={styles.track}>
        {/* ── Thumb ────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: translateAnim }] },
          ]}
        />
      </View>

      {/* ── Label ──────────────────────────────────────────────────────────── */}
      {label && (
        <Text style={styles.label} numberOfLines={0}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export default Switch
