import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

export type LabelSize = 'sm' | 'md' | 'lg'

const sizeTokens: Record<LabelSize, { fontSize: number; lineHeight: number }> = {
  sm: { fontSize: tokens.fontSize.xs,   lineHeight: tokens.fontSize.xs   * tokens.lineHeight.normal },
  md: { fontSize: tokens.fontSize.sm,   lineHeight: tokens.fontSize.sm   * tokens.lineHeight.normal },
  lg: { fontSize: tokens.fontSize.base, lineHeight: tokens.fontSize.base * tokens.lineHeight.normal },
}

export function createLabelStyles(
  size: LabelSize,
  disabled: boolean,
  colors: Theme,
) {
  const s = sizeTokens[size]

  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems:    'baseline',
      flexWrap:      'wrap',
      opacity:       disabled ? tokens.opacity.disabled : 1,
    },
    text: {
      color:      colors.foreground,
      fontSize:   s.fontSize,
      lineHeight: s.lineHeight,
      fontWeight: tokens.fontWeight.medium,
    },
    asterisk: {
      color:      colors.danger,
      fontSize:   s.fontSize,
      lineHeight: s.lineHeight,
      fontWeight: tokens.fontWeight.medium,
      marginLeft: 2,
    },
  })
}
