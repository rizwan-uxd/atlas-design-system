import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const searchIcon: AnimatedIconDefinition = {
  glyph: (
    <motion.g data-part="glass">
      <motion.circle data-part="lens" data-draw cx="11" cy="11" r="8" />
      <motion.path data-part="handle" data-draw d="m21 21-4.34-4.34" />
    </motion.g>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="lens"]', { pathLength: [0, 1] }, presets.emphasis)
    animate('[data-part="handle"]', { pathLength: [0, 1] }, { ...presets.emphasis, delay: presets.stagger })
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="glass"]', { rotate: [0, -12, 10, 0] }, presets.emphasis)
  },
}
