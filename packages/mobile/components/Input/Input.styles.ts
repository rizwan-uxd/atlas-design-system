import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import type { LabelSize } from '../Label/Label.styles'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputVariant = 'default' | 'filled' | 'ghost'
export type InputSize    = 'sm' | 'md' | 'lg'
export type InputState   = 'default' | 'error' | 'success' | 'disabled'

// ─── Size tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<InputSize, {
  minHeight:         number
  paddingHorizontal: number
  fontSize:          number
  iconSize:          number
  labelSize:         LabelSize
}> = {
  sm: {
    minHeight:         36,
    paddingHorizontal: tokens.spacing[3],   // 12
    fontSize:          tokens.fontSize.sm,  // 14
    iconSize:          16,
    labelSize:         'sm',
  },
  md: {
    minHeight:         tokens.touchTarget.min,  // 44 — minimum touch target
    paddingHorizontal: tokens.spacing[4],       // 16
    fontSize:          tokens.fontSize.base,    // 16
    iconSize:          18,
    labelSize:         'md',
  },
  lg: {
    minHeight:         52,
    paddingHorizontal: tokens.spacing[4],   // 16
    fontSize:          tokens.fontSize.lg,  // 18
    iconSize:          20,
    labelSize:         'lg',
  },
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function getBorderColor(
  state: InputState,
  isFocused: boolean,
  variant: InputVariant,
  colors: Theme,
): string {
  if (state === 'error')   return colors.danger
  if (state === 'success') return colors.success
  if (isFocused)           return colors.focusRing
  if (variant === 'ghost') return 'transparent'
  return colors.border
}

function getBackground(variant: InputVariant, colors: Theme): string {
  if (variant === 'filled') return colors.backgroundMuted
  if (variant === 'ghost')  return 'transparent'
  return colors.surface
}

/**
 * ghost → borderless at rest, gains border on focus/error/success
 * default/filled → always 1px border
 */
function getBorderWidth(
  variant: InputVariant,
  state: InputState,
  isFocused: boolean,
): number {
  if (variant === 'ghost' && state === 'default' && !isFocused) return 0
  return tokens.borderWidth[1]
}

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createInputStyles(
  variant:   InputVariant,
  size:      InputSize,
  state:     InputState,
  isFocused: boolean,
  colors:    Theme,
) {
  const s          = sizeTokens[size]
  const borderColor = getBorderColor(state, isFocused, variant, colors)
  const background  = getBackground(variant, colors)
  const borderWidth = getBorderWidth(variant, state, isFocused)
  const isDisabled  = state === 'disabled'

  // Icon / sub-text tint follows state → focus → muted
  const iconColor =
    state === 'error'   ? colors.danger        :
    state === 'success' ? colors.success       :
    isFocused           ? colors.focusRing     :
                          colors.foregroundMuted

  const styles = StyleSheet.create({
    root: {
      gap: tokens.spacing[1],   // 4 — label → input row → sub-text
    },

    inputRow: {
      flexDirection:     'row',
      alignItems:        'center',
      minHeight:         s.minHeight,
      paddingHorizontal: s.paddingHorizontal,
      backgroundColor:   background,
      borderRadius:      tokens.radius.md,
      borderWidth,
      borderColor,
      gap:               tokens.spacing[2],   // 8 — icon ↔ text
      opacity:           isDisabled ? tokens.opacity.disabled : 1,
    },

    textInput: {
      flex:            1,
      fontSize:        s.fontSize,
      fontWeight:      tokens.fontWeight.regular,
      color:           colors.foreground,
      // Reset RN default padding — row alignment handles vertical centering
      paddingVertical: 0,
      margin:          0,
    },

    iconWrapper: {
      alignItems:     'center',
      justifyContent: 'center',
    },

    helperText: {
      fontSize:   tokens.fontSize.xs,   // 12
      color:      colors.foregroundMuted,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },

    errorText: {
      fontSize:   tokens.fontSize.xs,
      color:      colors.danger,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },

    successText: {
      fontSize:   tokens.fontSize.xs,
      color:      colors.success,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },
  })

  return {
    ...styles,
    // Pass-through values that can't live inside StyleSheet
    labelSize:        s.labelSize,
    iconSize:         s.iconSize,
    iconColor,
    placeholderColor: colors.foregroundSubtle,
  }
}
