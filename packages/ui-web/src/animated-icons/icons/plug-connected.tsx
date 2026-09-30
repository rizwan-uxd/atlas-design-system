import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

export const plugConnectedIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <motion.g data-part="lower">
        <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z" />
        <path d="M3 21l2.5 -2.5" />
        <motion.g data-part="legs">
          <path d="M10 11l-2 2" />
          <path d="M13 14l-2 2" />
        </motion.g>
      </motion.g>
      <motion.g data-part="upper">
        <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z" />
        <path d="M18.5 5.5l2.5 -2.5" />
      </motion.g>
    </>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="upper"]', { x: [4, 0], y: [-4, 0] }, presets.emphasis)
    animate('[data-part="lower"]', { x: [-4, 0], y: [4, 0] }, presets.emphasis)
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="upper"]', { x: -2, y: 2 }, presets.emphasis)
    animate('[data-part="lower"]', { x: 2, y: -2 }, presets.emphasis)
    animate('[data-part="legs"]', { opacity: 0 }, presets.emphasis)
  },
}
