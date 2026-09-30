import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

const RING = [0, 14, -12, 8, -4, 0]
const SWING = [0, 1.2, -1.2, 0.6, 0]

export const bellIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <motion.path data-part="clapper" d="M10.268 21a2 2 0 0 0 3.464 0" />
      <motion.path
        data-part="body"
        style={{ originX: 0.5, originY: 0.1 }}
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
      />
    </>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="body"]', { rotate: [-10, 0] }, presets.emphasis)
  },
  hover: ({ animate, presets }) => {
    const ring = { ...presets.emphasis, duration: (presets.emphasis.duration ?? 0.32) * 2 }
    animate('[data-part="body"]', { rotate: RING }, ring)
    animate('[data-part="clapper"]', { x: SWING }, ring)
  },
  loop: ({ animate, presets }) => {
    const ring = {
      ...presets.emphasis,
      duration: (presets.emphasis.duration ?? 0.32) * 2,
      repeat: Infinity,
      repeatDelay: (presets.pulse.duration ?? 2) / 2,
    }
    animate('[data-part="body"]', { rotate: RING }, ring)
    animate('[data-part="clapper"]', { x: SWING }, ring)
  },
}
