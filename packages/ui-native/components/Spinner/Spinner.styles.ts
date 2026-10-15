import { StyleSheet } from 'react-native'
import type { Theme } from '../../tokens/atlas.tokens'
import { iconSize, iconStroke } from '../../tokens/atlas.tokens'

export type SpinnerVariant = 'default' | 'custom'
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

// ─── Glyph geometry ───────────────────────────────────────────────────────────
// Both glyphs are the Lucide icons the Figma set uses, drawn in a 24-unit space
// and scaled to the icon size. Stroke follows the icon-stroke token in that space.

const GLYPH = 24
const ARC_RADIUS = 9      // loader-circle: radius 9 around (12, 12)
const ARC_SWEEP = 288     // degrees, clockwise from 3 o'clock
const ARC_START = 90      // 3 o'clock, as degrees clockwise from 12 o'clock
const TICK_INNER = 6      // loader: eight ticks from radius 6 to radius 10
const TICK_OUTER = 10
export const TICK_COUNT = 8

export function getSpinnerGeometry(size: SpinnerSize) {
  const box = iconSize[size]
  const k = box / GLYPH
  const stroke = iconStroke[size] * k
  const radius = ARC_RADIUS * k
  const ring = 2 * radius + stroke            // outer diameter of the arc ring
  const half = ring / 2
  const rad = (deg: number) => (deg * Math.PI) / 180
  // Round end caps: a stroke-wide dot on the arc centre line at each end.
  const cap = (deg: number) => ({
    start: half + radius * Math.sin(rad(deg)) - stroke / 2,
    top:   half - radius * Math.cos(rad(deg)) - stroke / 2,
  })
  return {
    box, stroke, ring, half,
    ringOffset: (box - ring) / 2,
    capStart: cap(0),
    capEnd:   cap(ARC_SWEEP),
    // Each half rotates a 180 degree arc (top and right borders) into its half.
    rotateRight: `${Math.min(ARC_SWEEP, 180) - 135}deg`,
    rotateLeft:  `${Math.max(ARC_SWEEP - 180, 0) + 45}deg`,
    arcOffset:   `${ARC_START}deg`,
    tickLength:  (TICK_OUTER - TICK_INNER) * k + stroke,
    tickCenter:  ((TICK_OUTER + TICK_INNER) / 2) * k,
  }
}

export type SpinnerGeometry = ReturnType<typeof getSpinnerGeometry>

// ─── StyleSheet factory ───────────────────────────────────────────────────────

export function createSpinnerStyles(g: SpinnerGeometry, colors: Theme) {
  const color = colors.foreground
  const ringBase = {
    position:     'absolute' as const,
    top:          0,
    width:        g.ring,
    height:       g.ring,
    borderRadius: g.half,
    borderWidth:  g.stroke,
    borderColor:  'transparent',
    borderTopColor:   color,
    borderRightColor: color,
  }

  return StyleSheet.create({
    box: {
      width:  g.box,
      height: g.box,
    },
    glyph: {
      position: 'absolute',
      width:    g.box,
      height:   g.box,
    },
    arc: {
      position: 'absolute',
      top:      g.ringOffset,
      start:    g.ringOffset,
      width:    g.ring,
      height:   g.ring,
    },
    // The clips overlap by a hairline so no seam shows where the halves meet.
    clipRight: {
      position: 'absolute',
      top:      0,
      start:    g.half - StyleSheet.hairlineWidth,
      width:    g.half + StyleSheet.hairlineWidth,
      height:   g.ring,
      overflow: 'hidden',
    },
    clipLeft: {
      position: 'absolute',
      top:      0,
      start:    0,
      width:    g.half,
      height:   g.ring,
      overflow: 'hidden',
    },
    ringInRight: { ...ringBase, start: StyleSheet.hairlineWidth - g.half },
    ringInLeft:  { ...ringBase, start: 0 },
    cap: {
      position:        'absolute',
      width:           g.stroke,
      height:          g.stroke,
      borderRadius:    g.stroke / 2,
      backgroundColor: color,
    },
    tickWrap: {
      position: 'absolute',
      width:    g.box,
      height:   g.box,
    },
    tick: {
      position:        'absolute',
      start:           (g.box - g.stroke) / 2,
      top:             g.box / 2 - g.tickCenter - g.tickLength / 2,
      width:           g.stroke,
      height:          g.tickLength,
      borderRadius:    g.stroke / 2,
      backgroundColor: color,
    },
  })
}
