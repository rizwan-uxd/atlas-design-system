import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const refreshIcon: AnimatedIconDefinition = {
  glyph: (
    <motion.g data-part="cycle">
      <motion.path data-draw d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <motion.path data-draw d="M21 3v5h-5" />
      <motion.path data-draw d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <motion.path data-draw d="M8 16H3v5" />
    </motion.g>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="cycle"]', { rotate: [-180, 0] }, presets.emphasis)
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="cycle"]', { rotate: 180 }, presets.emphasis)
  },
  loop: ({ animate, presets }) => {
    animate('[data-part="cycle"]', { rotate: [0, 360] }, presets.spin)
  },
}
