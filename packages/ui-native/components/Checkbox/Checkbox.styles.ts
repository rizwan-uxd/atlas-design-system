import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckboxSize = 'sm' | 'md' | 'lg'

// ─── Size scale ───────────────────────────────────────────────────────────────

/**
 * Box (square) edge length per size.
 * sm is touch-friendly when wrapped in the 44pt Pressable row.
 */
export const BOX_SIZE: Record<CheckboxSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
}

/**
 * Ionicons glyph size — slightly smaller than the box so the icon
 * sits inside the border without clipping.
 */
export const ICON_SIZE: Record<CheckboxSize, number> = {
  sm: 11,
  md: 14,
  lg: 17,
}

/** Label typography per size — mirrors the Label component scale. */
const LABEL_FONT: Record<CheckboxSize, { fontSize: number; lineHeight: number }> = {
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
 * createCheckboxStyles
 *
 * Returns a StyleSheet for the given (size × isActive × disabled) combination.
 * Call this inside render — React Native StyleSheet.create() caches at the
 * JS level so repeated calls with the same arguments are fast.
 *
 * @param size      - 'sm' | 'md' | 'lg'
 * @param isActive  - true when checked OR indeterminate (drives box fill + border)
 * @param disabled  - true when the checkbox is non-interactive
 * @param colors    - resolved semantic colour tokens from useTheme()
 */
export function createCheckboxStyles(
  size:     CheckboxSize,
  isActive: boolean,
  disabled: boolean,
  colors:   Theme,
) {
  const boxSize = BOX_SIZE[size]
  const label   = LABEL_FONT[size]

  return StyleSheet.create({
    /**
     * Outer Pressable row.
     *
     * minHeight: 44 — WCAG 2.5.5 / Apple HIG minimum touch target.
     * The row extends the tap area to cover the label text, not just the box.
     * paddingVertical gives breathing room so tall labels don't crowd the box.
     */
    row: {
      flexDirection:   'row',
      alignItems:      'center',
      minHeight:       tokens.touchTarget.min,  // 44
      paddingVertical: tokens.spacing[2],        // 8
      opacity:         disabled ? tokens.opacity.disabled : 1,
    },

    /**
     * The checkbox square.
     *
     * When isActive → filled brand background + brand border.
     * When inactive → transparent fill + strong neutral border.
     * borderRadius matches tokens.radius.sm (4) to distinguish from Switch's pill.
     */
    box: {
      width:           boxSize,
      height:          boxSize,
      borderRadius:    tokens.radius.sm,          // 4
      borderWidth:     tokens.borderWidth[2],      // 2
      borderColor:     isActive ? colors.primary : colors.borderStrong,
      backgroundColor: isActive ? colors.primary  : 'transparent',
      alignItems:      'center',
      justifyContent:  'center',
      flexShrink:      0,                          // prevent box from squishing on narrow screens
    },

    /**
     * Label text to the right of the box.
     * flex: 1 lets long labels wrap without overflowing.
     * marginLeft matches the spacing between box edge and first character.
     */
    label: {
      flex:       1,
      marginLeft: tokens.spacing[3],   // 12
      fontSize:   label.fontSize,
      lineHeight: label.lineHeight,
      color:      colors.foreground,
    },
  })
}
