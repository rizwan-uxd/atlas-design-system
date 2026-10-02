import { motion } from "motion/react"
import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, SOURCE_FPS } from "../timeline"
import { noMotion } from "./toggle-shared"

/**
 * Geometry and timing from useanimations "airplay" (airplay-001): a loop of 30 frames, which is
 * exactly `--atlas-duration-spin`. The arrow bobs up and down twice, and the monitor outline
 * shortens to 5-95% at the same two beats. Frames 18-30 rest, so there is a pause before the loop.
 */
const LOOP_FRAMES = 30
const at = (...frames: number[]) => frames.map((f) => f / LOOP_FRAMES)

/** Frames 0, 3, 6, 10, 14, 18, then rest to 30. Offsets are from the arrow's resting position. */
const ARROW_Y = [0, 0.51, -2.5, 0, -1.12, 0, 0]
const ARROW_TIMES = at(0, 3, 6, 10, 14, 18, 30)
/** Monitor trim, as length and offset of a 0-1 path: 5-95% is length 0.9, offset 0.05. */
const MONITOR_LENGTH = [1, 1, 0.9, 1, 1, 0.9, 1, 1]
const MONITOR_OFFSET = [0, 0, 0.05, 0, 0, 0.05, 0, 0]
const MONITOR_TIMES = at(0, 4, 6, 10, 12, 14, 18, 30)

export const airplayIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <motion.path data-part="monitor" data-draw d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <motion.path data-part="arrow" d="M12 15l5 6H7z" />
    </>
  ),
  appear: noMotion,
  hover: noMotion,
  loop: ({ animate, presets }) => {
    // One loop is the spin token (1s = 30 frames at the source rate).
    const loop = { ...presets.spin, duration: presets.spin.duration ?? LOOP_FRAMES / SOURCE_FPS }
    animate(
      '[data-part="arrow"]',
      { y: ARROW_Y },
      { ...loop, times: ARROW_TIMES, ease: ARROW_Y.slice(1).map(() => [...EASE.inOut]) },
    )
    animate(
      '[data-part="monitor"]',
      { pathLength: MONITOR_LENGTH, pathOffset: MONITOR_OFFSET },
      { ...loop, times: MONITOR_TIMES, ease: MONITOR_LENGTH.slice(1).map(() => [...EASE.linear]) },
    )
  },
}
