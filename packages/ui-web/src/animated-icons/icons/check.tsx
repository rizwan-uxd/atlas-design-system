import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const checkIcon: AnimatedIconDefinition = {
  glyph: <motion.path data-part="tick" data-draw d="M20 6 9 17l-5-5" />,
  appear: ({ animate, presets }) => {
    animate('[data-part="tick"]', { pathLength: [0, 1] }, presets.emphasis)
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="tick"]', { scale: [1, 1.15, 1] }, presets.enter)
  },
  success: ({ animate, presets }) => {
    animate('[data-part="tick"]', { pathLength: [0, 1], scale: [0.8, 1.2, 1] }, presets.emphasis)
  },
}
