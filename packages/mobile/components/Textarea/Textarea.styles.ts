import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import type { LabelSize } from '../Label/Label.styles'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextareaVariant = 'default' | 'filled'
export type TextareaSize    = 'sm' | 'md' | 'lg'
export type TextareaState   = 'default' | 'error' | 'disabled'

// ─── Size tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<TextareaSize, {
  paddingHorizontal: number
  paddingVertical:   number
  fontSize:          number
  lineHeight:        number   // absolute px line height
  labelSize:         LabelSize
}> = {
  sm: {
    paddingHorizontal: tokens.spacing[3],   // 12
    paddingVertical:   tokens.spacing[2],   // 8
    fontSize:          tokens.fontSize.sm,  // 14
    lineHeight:        Math.ceil(tokens.fontSize.sm * tokens.lineHeight.normal),  // 21
    labelSize:         'sm',
  },
  md: {
    paddingHorizontal: tokens.spacing[4],    // 16
    paddingVertical:   tokens.spacing[3],    // 12
    fontSize:          tokens.fontSize.base, // 16
    lineHeight:        Math.ceil(tokens.fontSize.base * tokens.lineHeight.normal), // 24
    labelSize:         'md',
  },
  lg: {
    paddingHorizontal: tokens.spacing[4],   // 16
    paddingVertical:   tokens.spacing[3],   // 12
    fontSize:          tokens.fontSize.lg,  // 18
    lineHeight:        Math.ceil(tokens.fontSize.lg * tokens.lineHeight.normal),   // 27
    labelSize:         'lg',
  },
}

// ─── Height helpers ───────────────────────────────────────────────────────────

/**
 * Computes the minimum height for a given (size × rows) combination.
 * rows  = number of visible text lines
 * + 2 × paddingVertical for top/bottom inset
 */
export function computeMinHeight(size: TextareaSize, rows: number): number {
  const s = sizeTokens[size]
  return rows * s.lineHeight + s.paddingVertical * 2
}

/**
 * Computes the maximum height allowed for auto-grow mode.
 * Uses the same formula as computeMinHeight.
 */
export function computeMaxHeight(size: TextareaSize, maxRows: number): number {
  return computeMinHeight(size, maxRows)
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function getBorderColor(
  state:     TextareaState,
  isFocused: boolean,
  variant:   TextareaVariant,
  colors:    Theme,
): string {
  if (state === 'error') return colors.danger
  if (isFocused)         return colors.focusRing
  if (variant === 'filled') return 'transparent'
  return colors.border
}

function getBackground(variant: TextareaVariant, colors: Theme): string {
  return variant === 'filled' ? colors.backgroundMuted : colors.surface
}

function getBorderWidth(
  variant:   TextareaVariant,
  state:     TextareaState,
  isFocused: boolean,
): number {
  // filled → borderless at rest, gains border on focus / error
  if (variant === 'filled' && state === 'default' && !isFocused) return 0
  return tokens.borderWidth[1]
}

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createTextareaStyles(
  variant:    TextareaVariant,
  size:       TextareaSize,
  state:      TextareaState,
  isFocused:  boolean,
  colors:     Theme,
  rows:       number,
  maxRows:    number | undefined,
  autoGrow:   boolean,
) {
  const s           = sizeTokens[size]
  const borderColor = getBorderColor(state, isFocused, variant, colors)
  const background  = getBackground(variant, colors)
  const borderWidth = getBorderWidth(variant, state, isFocused)
  const isDisabled  = state === 'disabled'

  const minHeight = computeMinHeight(size, rows)
  const maxHeight = autoGrow && maxRows !== undefined
    ? computeMaxHeight(size, maxRows)
    : undefined

  const styles = StyleSheet.create({
    root: {
      gap: tokens.spacing[1],   // 4 — label → textarea → sub-text
    },

    textareaWrapper: {
      minHeight,
      ...(maxHeight !== undefined ? { maxHeight } : {}),
      paddingHorizontal: s.paddingHorizontal,
      paddingVertical:   s.paddingVertical,
      backgroundColor:   background,
      borderRadius:      tokens.radius.md,
      borderWidth,
      borderColor,
      opacity:           isDisabled ? tokens.opacity.disabled : 1,
    },

    textInput: {
      flex:              1,
      fontSize:          s.fontSize,
      fontWeight:        tokens.fontWeight.regular,
      lineHeight:        s.lineHeight,
      color:             colors.foreground,
      // Reset RN defaults — wrapper padding handles insets
      padding:           0,
      margin:            0,
      // Android: ensure text starts at the top-left of the field
      textAlignVertical: 'top' as const,
    },

    // Sub-text row (below the textarea)
    subTextRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      gap:            tokens.spacing[2],
    },

    helperText: {
      flex:       1,
      fontSize:   tokens.fontSize.xs,
      color:      colors.foregroundMuted,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },

    errorText: {
      flex:       1,
      fontSize:   tokens.fontSize.xs,
      color:      colors.danger,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },

    charCounter: {
      fontSize:   tokens.fontSize.xs,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },
  })

  return {
    ...styles,
    // Pass-through values that can't live in a StyleSheet
    labelSize:        s.labelSize,
    placeholderColor: colors.foregroundSubtle,
    charCounterColor: (charCount: number, maxLength: number) =>
      charCount >= maxLength ? colors.danger : colors.foregroundMuted,
  }
}
