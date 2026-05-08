import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

// ─── Size tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<BadgeSize, {
  paddingHorizontal: number
  paddingVertical: number
  fontSize: number
  fontWeight: '400' | '500' | '600' | '700'
  letterSpacing: number
  dotSize: number
  borderRadius: number
}> = {
  sm: {
    paddingHorizontal: tokens.spacing[1.5],  // 6
    paddingVertical:   tokens.spacing[0.5],  // 2
    fontSize:          tokens.fontSize.xs,   // 12
    fontWeight:        tokens.fontWeight.medium,
    letterSpacing:     tokens.letterSpacing.wide,
    dotSize:           6,
    borderRadius:      tokens.radius.full,
  },
  md: {
    paddingHorizontal: tokens.spacing[2],    // 8
    paddingVertical:   tokens.spacing[0.5],  // 2
    fontSize:          tokens.fontSize.xs,   // 12
    fontWeight:        tokens.fontWeight.medium,
    letterSpacing:     tokens.letterSpacing.wide,
    dotSize:           8,
    borderRadius:      tokens.radius.full,
  },
  lg: {
    paddingHorizontal: tokens.spacing[2],    // 8
    paddingVertical:   tokens.spacing[1],    // 4
    fontSize:          tokens.fontSize.sm,   // 14
    fontWeight:        tokens.fontWeight.medium,
    letterSpacing:     tokens.letterSpacing.normal,
    dotSize:           10,
    borderRadius:      tokens.radius.full,
  },
}

// ─── Variant colours (derived from theme) ────────────────────────────────────

export function getVariantColors(variant: BadgeVariant, colors: Theme) {
  switch (variant) {
    case 'neutral':
      return { background: colors.backgroundMuted, text: colors.foregroundMuted }
    case 'brand':
      return { background: colors.primarySubtle, text: colors.primary }
    case 'success':
      return { background: colors.successSubtle, text: colors.success }
    case 'warning':
      return { background: colors.warningSubtle, text: colors.warning }
    case 'danger':
      return { background: colors.dangerSubtle, text: colors.danger }
    case 'info':
      return { background: colors.infoSubtle, text: colors.info }
  }
}

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createBadgeStyles(
  variant: BadgeVariant,
  size: BadgeSize,
  colors: Theme,
) {
  const s = sizeTokens[size]
  const c = getVariantColors(variant, colors)

  return StyleSheet.create({
    container: {
      flexDirection:    'row',
      alignItems:       'center',
      alignSelf:        'flex-start',         // shrink to content width
      backgroundColor:  c.background,
      borderRadius:     s.borderRadius,
      paddingHorizontal: s.paddingHorizontal,
      paddingVertical:  s.paddingVertical,
    },
    label: {
      color:         c.text,
      fontSize:      s.fontSize,
      fontWeight:    s.fontWeight,
      letterSpacing: s.letterSpacing,
      lineHeight:    s.fontSize * 1.5,
    },
    dot: {
      width:         s.dotSize,
      height:        s.dotSize,
      borderRadius:  s.dotSize / 2,
      backgroundColor: c.text,
    },
  })
}
