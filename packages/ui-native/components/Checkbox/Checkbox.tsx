/**
 * Atlas Checkbox — M7 · Mobile
 *
 * A custom Pressable + Animated checkmark implementation.
 * No Radix — React Native has no DOM, so we build the full control here.
 *
 * States:    unchecked · checked · indeterminate
 * Sizes:     sm · md · lg
 * Disabled:  renders at 50% opacity, no interaction
 *
 * Touch target:
 *   The entire row (box + label) is one Pressable with minHeight: 44pt, so
 *   every size meets the WCAG 2.5.5 / Apple HIG minimum tap area.
 *
 * Animation:
 *   Checkmark scales from 0 → 1 on check, 1 → 0 on uncheck.
 *   Duration collapses to 0 when the user has "Reduce Motion" enabled.
 *   The Animated.View is always mounted so the scale-out has something to
 *   animate — scale: 0 makes the icon invisible without unmounting it.
 *
 * Indeterminate → checked:
 *   Pressing an indeterminate checkbox sets checked = true (same UX as web).
 *
 * Accessibility:
 *   accessibilityRole="checkbox"
 *   accessibilityState.checked = true | false | 'mixed' (indeterminate)
 *   accessibilityState.disabled = true | false
 *   accessibilityLabel = label prop (announce the control name to screen readers)
 */

import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme }                        from '../../theme/useTheme'
import { useReducedMotion, getDuration }   from '../../utils/useReducedMotion'
import { createCheckboxStyles, BOX_SIZE, ICON_SIZE } from './Checkbox.styles'
import type { CheckboxSize }               from './Checkbox.styles'
import tokens                              from '../../tokens/atlas.tokens'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  /** Whether the checkbox is checked. @default false */
  checked?: boolean
  /**
   * Shows a dash (–) instead of a checkmark; represents a partially-selected
   * group. Pressing an indeterminate checkbox resolves to checked = true.
   * @default false
   */
  indeterminate?: boolean
  /** Prevents interaction and renders at 50% opacity. @default false */
  disabled?: boolean
  /** Box and row size. @default 'md' */
  size?: CheckboxSize
  /** Label text rendered to the right of the box. Full row is tappable. */
  label?: string
  /** Called with the next checked value when the row is pressed. */
  onValueChange?: (checked: boolean) => void
  /**
   * Screen-reader label for box-only usage (when no visible `label` is provided).
   * When `label` is set, that string is used as the accessible name automatically.
   */
  accessibilityLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Checkbox({
  checked       = false,
  indeterminate = false,
  disabled      = false,
  size                           = 'md',
  label,
  onValueChange,
  accessibilityLabel: a11yLabel,
}: CheckboxProps) {
  const { colors }   = useTheme()
  const reduceMotion = useReducedMotion()

  const isActive = checked || indeterminate

  // ── Scale animation (0 → 1 when active, 1 → 0 when inactive) ────────────
  //
  // Initialise to the current state so there is no pop-in on first render.
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current

  // ── Icon name ref — hold the last active glyph during scale-out ──────────
  //
  // Without this, switching from indeterminate→unchecked would flip the dash
  // to a checkmark mid-animation (both are scale: 0 → invisible, but a glyph
  // change causes a visual jump on some RN versions).
  const iconNameRef = useRef<'checkmark' | 'remove'>(
    indeterminate ? 'remove' : 'checkmark',
  )
  // Only update when the checkbox is active — let the ref hold the last icon
  // during the scale-out transition.
  if (isActive) {
    iconNameRef.current = indeterminate ? 'remove' : 'checkmark'
  }

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue:         isActive ? 1 : 0,
      duration:        getDuration(tokens.duration.fast, reduceMotion), // 120 ms | 0 ms
      useNativeDriver: true,
    }).start()
  }, [isActive, reduceMotion])

  // ── Derived values ────────────────────────────────────────────────────────
  const styles   = createCheckboxStyles(size, isActive, disabled, colors)
  const iconSize = ICON_SIZE[size]

  // ── Press handler ─────────────────────────────────────────────────────────
  function handlePress() {
    // Indeterminate → checked is the conventional pattern (matches web Atlas)
    onValueChange?.(indeterminate ? true : !checked)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        // Subtle opacity shift on press — keeps the box readable while pressed.
        // Disabled rows skip this because they're already at 50% opacity.
        pressed && !disabled && { opacity: tokens.opacity.hover },
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked:  indeterminate ? 'mixed' : checked,
        disabled,
      }}
      // accessibilityLabel: prefer the visible label string; fall back to the
      // explicit accessibilityLabel prop for box-only (no visible label) usage.
      accessibilityLabel={label ?? a11yLabel}
    >
      {/* ── Box ──────────────────────────────────────────────────────────── */}
      <View style={styles.box}>
        {/*
         * Animated.View is always mounted so Animated.timing has a node to
         * drive even during the scale-out. scale: 0 keeps the icon invisible.
         */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={iconNameRef.current}
            size={iconSize}
            color={colors.primaryForeground}
          />
        </Animated.View>
      </View>

      {/* ── Label ────────────────────────────────────────────────────────── */}
      {label && (
        <Text style={styles.label} numberOfLines={0}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export default Checkbox
