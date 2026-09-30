import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const xIcon: AnimatedIconDefinition = {
  glyph: (
    <motion.g data-part="cross">
      <motion.path data-part="stroke-a" data-draw d="M18 6 6 18" />
      <motion.path data-part="stroke-b" data-draw d="m6 6 12 12" />
    </motion.g>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="stroke-a"]', { pathLength: [0, 1] }, presets.emphasis)
    animate('[data-part="stroke-b"]', { pathLength: [0, 1] }, { ...presets.emphasis, delay: presets.stagger })
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="cross"]', { rotate: 90 }, presets.emphasis)
  },
}
