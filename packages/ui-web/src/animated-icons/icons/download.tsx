import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const downloadIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <motion.path data-part="tray" data-draw d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <motion.g data-part="arrow">
        <path d="M12 15V3" />
        <path d="m7 10 5 5 5-5" />
      </motion.g>
    </>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="tray"]', { pathLength: [0, 1] }, presets.emphasis)
    animate('[data-part="arrow"]', { y: [-6, 0], opacity: [0, 1] }, presets.emphasis)
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="arrow"]', { y: [0, 3, 0] }, presets.emphasis)
  },
  loop: ({ animate, presets }) => {
    animate('[data-part="arrow"]', { y: [0, 3, 0] }, { ...presets.pulse, ease: presets.enter.ease })
  },
}
