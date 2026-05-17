import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

// ─── Size tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<ButtonSize, {
  height:            number
  paddingHorizontal: number
  fontSize:          number
  iconSize:          number
  gap:               number
}> = {
  sm: {
    height:            tokens.touchTarget.min,        // 44 — minimum touch target even on sm
    paddingHorizontal: tokens.spacing[3],              // 12
    fontSize:          tokens.fontSize.sm,             // 14
    iconSize:          16,
    gap:               tokens.spacing[1],              // 4
  },
  md: {
    height:            tokens.touchTarget.comfortable, // 48
    paddingHorizontal: tokens.spacing[4],              // 16
    fontSize:          tokens.fontSize.base,           // 16
    iconSize:          18,
    gap:               tokens.spacing[1.5],            // 6
  },
  lg: {
    height:            tokens.touchTarget.spacious,    // 56
    paddingHorizontal: tokens.spacing[6],              // 24
    fontSize:          tokens.fontSize.lg,             // 18
    iconSize:          20,
    gap:               tokens.spacing[2],              // 8
  },
}

// ─── Variant colours ──────────────────────────────────────────────────────────

export function getButtonColors(variant: ButtonVariant, colors: Theme) {
  switch (variant) {
    case 'primary':
      return {
        background:        colors.primary,
        backgroundPressed: colors.primaryActive,
        text:              colors.primaryForeground,
        border:            'transparent',
      }
    case 'secondary':
      return {
        background:        'transparent',
        backgroundPressed: colors.backgroundMuted,
        text:              colors.foreground,
        border:            colors.border,
      }
    case 'ghost':
      return {
        background:        'transparent',
        backgroundPressed: colors.backgroundMuted,
        text:              colors.foreground,
        border:            'transparent',
      }
    case 'danger':
      return {
        background:        colors.danger,
        backgroundPressed: colors.dangerHover,
        text:              colors.dangerForeground,
        border:            'transparent',
      }
  }
}

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createButtonStyles(
  variant: ButtonVariant,
  size: ButtonSize,
  colors: Theme,
  fullWidth: boolean,
) {
  const s = sizeTokens[size]
  const c = getButtonColors(variant, colors)

  return StyleSheet.create({
    pressable: {
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    },
    container: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      height:            s.height,
      paddingHorizontal: s.paddingHorizontal,
      backgroundColor:   c.background,
      borderRadius:      tokens.radius.md,
      borderWidth:       variant === 'secondary' ? tokens.borderWidth[1] : 0,
      borderColor:       c.border,
      gap:               s.gap,
    },
    containerPressed: {
      backgroundColor: c.backgroundPressed,
      opacity:         tokens.opacity.hover,   // 0.9 — subtle press feedback
    },
    label: {
      color:      c.text,
      fontSize:   s.fontSize,
      fontWeight: tokens.fontWeight.semibold,
      lineHeight: s.fontSize * tokens.lineHeight.tight,
    },
    iconSize: s.iconSize,
    iconColor: c.text,
  })
}
