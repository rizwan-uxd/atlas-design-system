import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import { radius, spacing } from '../../tokens/atlas.tokens'

export type SkeletonShape = 'rect' | 'circle'

// ─── StyleSheet factory ───────────────────────────────────────────────────────
// A skeleton has no fixed size: the rect fills its container's width and is
// spacing-4 tall, the circle is spacing-10 square. Override either with `style`.

export function createSkeletonStyles(shape: SkeletonShape, colors: Theme) {
  return StyleSheet.create({
    block:
      shape === 'circle'
        ? {
            width:           spacing[10],  // 40
            height:          spacing[10],
            borderRadius:    radius.full,
            backgroundColor: colors.backgroundMuted,
          }
        : {
            width:           '100%',
            height:          spacing[4],   // 16
            borderRadius:    radius.md,
            backgroundColor: colors.backgroundMuted,
          },
  })
}
