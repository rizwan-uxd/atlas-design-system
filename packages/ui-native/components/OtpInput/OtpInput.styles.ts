import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'
import type { LabelSize } from '../Label/Label.styles'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OtpInputSize  = 'sm' | 'md' | 'lg'
export type OtpInputState = 'default' | 'error' | 'disabled'

// ─── Size tokens ──────────────────────────────────────────────────────────────
// A slot is a square as wide as the native Input is tall (36 / 44 / 52), so md meets the
// 44 pt touch target. Slots flex to fill the row up to this cap, so 8 slots still fit a phone.

const sizeTokens: Record<OtpInputSize, {
  slot:      number
  fontSize:  number
  labelSize: LabelSize
}> = {
  sm: { slot: 36,                       fontSize: tokens.fontSize.sm,   labelSize: 'sm' },
  md: { slot: tokens.touchTarget.min,   fontSize: tokens.fontSize.base, labelSize: 'md' },
  lg: { slot: 52,                       fontSize: tokens.fontSize.lg,   labelSize: 'lg' },
}

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createOtpInputStyles(
  size:   OtpInputSize,
  state:  OtpInputState,
  colors: Theme,
) {
  const s          = sizeTokens[size]
  const isDisabled = state === 'disabled'

  const slotBorder = (active: boolean): string =>
    state === 'error' ? colors.danger :
    active            ? colors.focusRing :
                        colors.border

  const styles = StyleSheet.create({
    root: {
      gap: tokens.spacing[1],   // 4 — label → slots → sub-text
    },

    // The real TextInput sits over the slots with no visible paint, so taps land on it
    slotsWrap: {
      position: 'relative',
    },

    slots: {
      flexDirection: 'row',
      gap:           tokens.spacing[2],   // 8
    },

    slot: {
      flex:            1,
      maxWidth:        s.slot,
      aspectRatio:     1,
      alignItems:      'center',
      justifyContent:  'center',
      backgroundColor: isDisabled ? colors.backgroundMuted : colors.surface,
      borderRadius:    tokens.radius.md,
      borderWidth:     tokens.borderWidth[1],
    },

    digit: {
      fontSize:   s.fontSize,
      fontWeight: tokens.fontWeight.regular,
      color:      isDisabled ? colors.foregroundMuted : colors.foreground,
    },

    hiddenInput: {
      position: 'absolute',
      top:      0,
      left:     0,
      right:    0,
      bottom:   0,
      opacity:  0,
      color:    'transparent',
    },

    helperText: {
      fontSize:   tokens.fontSize.xs,
      color:      colors.foregroundMuted,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },

    errorText: {
      fontSize:   tokens.fontSize.xs,
      color:      colors.danger,
      lineHeight: tokens.fontSize.xs * tokens.lineHeight.normal,
    },
  })

  return {
    ...styles,
    labelSize: s.labelSize,
    slotBorder,
  }
}
