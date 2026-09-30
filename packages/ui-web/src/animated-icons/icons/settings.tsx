import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const settingsIcon: AnimatedIconDefinition = {
  glyph: (
    <motion.g data-part="gear">
      <motion.path
        data-part="cog"
        data-draw
        d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
      />
      <motion.circle data-part="hub" data-draw cx="12" cy="12" r="3" />
    </motion.g>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="cog"]', { pathLength: [0, 1] }, presets.emphasis)
    animate('[data-part="hub"]', { pathLength: [0, 1] }, { ...presets.emphasis, delay: presets.stagger })
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="gear"]', { rotate: 90 }, presets.emphasis)
  },
  loop: ({ animate, presets }) => {
    animate('[data-part="gear"]', { rotate: [0, 360] }, presets.spin)
  },
}
