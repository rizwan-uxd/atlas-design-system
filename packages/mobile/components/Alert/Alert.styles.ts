import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import tokens from '../../tokens/atlas.tokens'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export function getAlertColors(variant: AlertVariant, colors: Theme) {
  switch (variant) {
    case 'info':
      return { background: colors.infoSubtle,    icon: colors.info,    text: colors.foreground, border: colors.info }
    case 'success':
      return { background: colors.successSubtle, icon: colors.success, text: colors.foreground, border: colors.success }
    case 'warning':
      return { background: colors.warningSubtle, icon: colors.warning, text: colors.foreground, border: colors.warning }
    case 'danger':
      return { background: colors.dangerSubtle,  icon: colors.danger,  text: colors.foreground, border: colors.danger }
  }
}

export function createAlertStyles(variant: AlertVariant, colors: Theme) {
  const c = getAlertColors(variant, colors)

  return StyleSheet.create({
    container: {
      flexDirection:   'row',
      backgroundColor: c.background,
      borderRadius:    tokens.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: c.border,
      padding:         tokens.spacing[3],   // 12
      gap:             tokens.spacing[2],   // 8
      alignItems:      'flex-start',
    },
    iconWrapper: {
      marginTop: 1,                         // optical alignment with first text line
    },
    body: {
      flex: 1,
      gap:  tokens.spacing[0.5],            // 2
    },
    title: {
      color:      c.text,
      fontSize:   tokens.fontSize.sm,       // 14
      fontWeight: tokens.fontWeight.semibold,
      lineHeight: tokens.fontSize.sm * tokens.lineHeight.normal,
    },
    description: {
      color:      c.text,
      fontSize:   tokens.fontSize.sm,       // 14
      fontWeight: tokens.fontWeight.regular,
      lineHeight: tokens.fontSize.sm * tokens.lineHeight.normal,
    },
    dismissButton: {
      padding:      tokens.spacing[0.5],   // 2 — extra tap area
      marginTop:    -2,
      marginRight:  -2,
    },
    iconColor: c.icon,                     // expose for icon component
  })
}
