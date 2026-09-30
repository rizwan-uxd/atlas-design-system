import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"

/** Sidebar toggle. Geometry is Lucide's `panel-left-open` (ISC); the motion is Atlas's own. */
export const panelLeftOpenIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <motion.rect data-part="frame" data-draw width="18" height="18" x="3" y="3" rx="2" />
      <motion.path data-part="divider" data-draw d="M9 3v18" />
      <motion.path data-part="chevron" d="m14 9 3 3-3 3" />
    </>
  ),
  appear: ({ animate, presets }) => {
    animate('[data-part="frame"]', { pathLength: [0, 1] }, presets.emphasis)
    animate('[data-part="divider"]', { pathLength: [0, 1] }, { ...presets.emphasis, delay: presets.stagger })
    animate('[data-part="chevron"]', { x: [-3, 0], opacity: [0, 1] }, { ...presets.emphasis, delay: presets.stagger * 2 })
  },
  hover: ({ animate, presets }) => {
    animate('[data-part="chevron"]', { x: [0, 2, 0] }, presets.emphasis)
  },
  press: ({ animate, presets }) => {
    animate('[data-part="divider"]', { x: [0, 2, 0] }, presets.quick)
  },
}
