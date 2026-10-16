import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import { fontSize, fontWeight, radius, spacing } from '../../tokens/atlas.tokens'

// ─── StyleSheet factory ───────────────────────────────────────────────────────
// A progress bar has no fixed width: it fills its container. Track is background-muted,
// fill is primary, height spacing-1 (4), full radius. Label row, bar and helper stack with
// spacing-2 (8), as in Figma.

export function createProgressStyles(colors: Theme) {
  return StyleSheet.create({
    root: {
      gap: spacing[2],   // 8
    },

    labelRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      gap:            spacing[2],
    },

    label: {
      flexShrink: 1,
      fontSize:   fontSize.base,
      fontWeight: fontWeight.regular,
      color:      colors.foreground,
    },

    valueLabel: {
      fontSize:   fontSize.sm,
      fontWeight: fontWeight.regular,
      color:      colors.foregroundMuted,
    },

    track: {
      height:          spacing[1],   // 4
      borderRadius:    radius.full,
      backgroundColor: colors.backgroundMuted,
      overflow:        'hidden',
    },

    fill: {
      height:          '100%',
      borderRadius:    radius.full,
      backgroundColor: colors.primary,
    },

    segment: {
      position:        'absolute',
      top:             0,
      bottom:          0,
      left:            0,
      borderRadius:    radius.full,
      backgroundColor: colors.primary,
    },

    helperText: {
      fontSize:   fontSize.sm,
      fontWeight: fontWeight.regular,
      color:      colors.foregroundMuted,
    },
  })
}
