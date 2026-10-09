import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, pose, sample, track } from "../timeline"
import { drawSlash, noMotion, slashed } from "./toggle-shared"

/** Geometry and timing from useanimations "microphone" (mic-on-off-001) and V2 (mic-on-off-002). */
const body = (
  <g data-track="body">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
  </g>
)

const FRAMES = 25

export const micIcon: AnimatedIconDefinition = {
  glyph: (id) => slashed(id, body),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => drawSlash(root, frame, 0, FRAMES),
  },
}

/** V2: the microphone also shrinks to 90% over the first 10 frames and stays there. */
export const micV2Icon: AnimatedIconDefinition = {
  glyph: (id) => slashed(id, body),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => {
      drawSlash(root, frame, 0, FRAMES)
      const scale = sample(
        [
          [0, 1, EASE.inOutSoft],
          [10, 0.9],
        ],
        frame,
      )
      pose(track(root, "body"), 0, 0, scale, scale, 12, 12)
    },
  },
}
