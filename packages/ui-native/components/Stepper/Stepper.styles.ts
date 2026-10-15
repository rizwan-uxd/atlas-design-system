import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import { spacing, fontSize, fontWeight } from '../../tokens/atlas.tokens'

// ─── Ring geometry ────────────────────────────────────────────────────────────

export const RING_SIZE = spacing[12]  // 48
export const RING_BAND = spacing[1]   // 4
const HALF = RING_SIZE / 2

// ─── StyleSheet factory ───────────────────────────────────────────────────────
//
// The arc is two half-circle clips. Each clip holds a full-size ring whose top
// and right borders are coloured (a 180° arc); rotating that ring sweeps the
// arc into view. The right clip shows 0–180°, the left clip 180–360°.

export function createStepperStyles(colors: Theme) {
  const ring = {
    position:     'absolute' as const,
    width:        RING_SIZE,
    height:       RING_SIZE,
    borderRadius: HALF,
    borderWidth:  RING_BAND,
    borderColor:  'transparent',
    borderTopColor:   colors.primary,
    borderRightColor: colors.primary,
  }

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems:    'center',
    },
    ringWrap: {
      width:  RING_SIZE,
      height: RING_SIZE,
    },
    track: {
      position:     'absolute',
      width:        RING_SIZE,
      height:       RING_SIZE,
      borderRadius: HALF,
      borderWidth:  RING_BAND,
      borderColor:  colors.border,
    },
    clipRight: {
      position: 'absolute',
      top:      0,
      start:    HALF,
      width:    HALF,
      height:   RING_SIZE,
      overflow: 'hidden',
    },
    clipLeft: {
      position: 'absolute',
      top:      0,
      start:    0,
      width:    HALF,
      height:   RING_SIZE,
      overflow: 'hidden',
    },
    ringInRight: { ...ring, top: 0, start: -HALF },
    ringInLeft:  { ...ring, top: 0, start: 0 },
    count: {
      ...StyleSheet.absoluteFillObject,
      alignItems:     'center',
      justifyContent: 'center',
    },
    countText: {
      color:      colors.foreground,
      fontSize:   fontSize.xs,
      fontWeight: fontWeight.medium,
    },
    text: {
      flexShrink:  1,
      marginStart: spacing[3],
    },
    label: {
      color:      colors.foreground,
      fontSize:   fontSize.base,
      fontWeight: fontWeight.semibold,
    },
    next: {
      color:    colors.foregroundMuted,
      fontSize: fontSize.sm,
    },
  })
}
