import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, pose, sample, track } from "../timeline"
import { drawSlash, noMotion, slashed } from "./toggle-shared"

/** Geometry and timing from useanimations "video" (video-on-off-001) and V2 (video-on-off-002). */
const body = (
  <g data-track="body">
    <path d="M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    <path d="M23 7v10l-7-5Z" />
  </g>
)

const FRAMES = 16

export const videoIcon: AnimatedIconDefinition = {
  glyph: (id) => slashed(id, body),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => drawSlash(root, frame, 0, FRAMES - 1),
  },
}

/** V2: the camera also shrinks to 90% over the first 10 frames and stays there. */
export const videoV2Icon: AnimatedIconDefinition = {
  glyph: (id) => slashed(id, body),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => {
      drawSlash(root, frame, 0, FRAMES - 1)
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
