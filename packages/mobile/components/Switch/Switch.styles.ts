import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SwitchSize = 'sm' | 'md' | 'lg'

// ─── Track + thumb geometry ──────────────────────────────────────────────────

/**
 * Per-size dimensions for the pill track and circular thumb.
 *
 * Formula:
 *   thumbSize = trackHeight - 4  (2 pt gap on each side)
 *   thumbOff  = 2                (left-edge padding when off)
 *   thumbOn   = trackWidth - thumbSize - 2  (right-edge padding when on)
 *
 * All values are in logical points (pt).
 */
export const TRACK: Record<SwitchSize, {
  width:     number
  height:    number
  thumbSize: number
  thumbOff:  number   // translateX when value=false
  thumbOn:   number   // translateX when value=true
}> = {
  sm: { width: 32, height: 20, thumbSize: 16, thumbOff: 2, thumbOn: 14 },
  md: { width: 44, height: 26, thumbSize: 22, thumbOff: 2, thumbOn: 20 },
  lg: { width: 52, height: 30, thumbSize: 26, thumbOff: 2, thumbOn: 24 },
}

/** Label font scale — mirrors the Label component. */
const LABEL_FONT: Record<SwitchSize, { fontSize: number; lineHeight: number }> = {
  sm: {
    fontSize:   tokens.fontSize.sm,
    lineHeight: Math.ceil(tokens.fontSize.sm   * tokens.lineHeight.normal), // 21
  },
  md: {
    fontSize:   tokens.fontSize.base,
    lineHeight: Math.ceil(tokens.fontSize.base * tokens.lineHeight.normal), // 24
  },
  lg: {
    fontSize:   tokens.fontSize.lg,
    lineHeight: Math.ceil(tokens.fontSize.lg   * tokens.lineHeight.normal), // 27
  },
}

// ─── Style factory ────────────────────────────────────────────────────────────

/**
 * createSwitchStyles
 *
 * Returns a StyleSheet for the given (size × value × disabled) combination.
 * The thumb is absolutely positioned inside the track so translateX drives it
 * from left to right without fighting flexbox alignment.
 *
 * @param size     - 'sm' | 'md' | 'lg'
 * @param value    - current on/off state (drives track background colour)
 * @param disabled - suppresses interaction and reduces opacity
 * @param colors   - resolved semantic colour tokens from useTheme()
 */
export function createSwitchStyles(
  size:     SwitchSize,
  value:    boolean,
  disabled: boolean,
  colors:   Theme,
) {
  const t     = TRACK[size]
  const label = LABEL_FONT[size]

  return StyleSheet.create({
    /**
     * Full-row Pressable.
     * minHeight: 44pt — WCAG 2.5.5 / Apple HIG minimum touch target.
     * The label extends the tappable area to the right of the track.
     */
    row: {
      flexDirection:   'row',
      alignItems:      'center',
      minHeight:       tokens.touchTarget.min,   // 44
      paddingVertical: tokens.spacing[2],          // 8
      opacity:         disabled ? tokens.opacity.disabled : 1,
    },

    /**
     * Pill-shaped track.
     * Background transitions between borderStrong (off) and primary (on) —
     * done by re-computing styles on each render rather than animating
     * backgroundColor (which can't use native driver).
     */
    track: {
      width:           t.width,
      height:          t.height,
      borderRadius:    tokens.radius.full,
      backgroundColor: value ? colors.primary : colors.borderStrong,
      flexShrink:      0,
    },

    /**
     * Circular thumb — absolutely positioned inside the track.
     * top: 2 centres it vertically (thumbSize = trackHeight − 4, so 2pt gap).
     * translateX is animated from thumbOff → thumbOn by the component.
     */
    thumb: {
      position:        'absolute',
      top:             2,
      width:           t.thumbSize,
      height:          t.thumbSize,
      borderRadius:    tokens.radius.full,
      backgroundColor: colors.primaryForeground,   // white in both themes
      // Subtle elevation so the thumb "floats" above the track
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 1 },
      shadowOpacity:   0.18,
      shadowRadius:    2,
      elevation:       2,
    },

    /** Label text to the right of the track. */
    label: {
      flex:       1,
      marginLeft: tokens.spacing[3],    // 12
      fontSize:   label.fontSize,
      lineHeight: label.lineHeight,
      color:      colors.foreground,
    },
  })
}
