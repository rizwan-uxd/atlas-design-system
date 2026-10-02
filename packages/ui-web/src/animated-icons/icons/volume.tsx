import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, pose, sample, track, trim } from "../timeline"
import { drawSlash, noMotion, slashed } from "./toggle-shared"

/**
 * Geometry and timing from useanimations "volume" (volume-001), 30 frames. Speaker and waves slide
 * 5px right, the outer then inner wave collapse into the speaker, and the slash draws last.
 * A full run takes `--atlas-duration-spin` (1s); the source takes 29/30s.
 */
const FRAMES = 30

export const volumeIcon: AnimatedIconDefinition = {
  glyph: (id) =>
    slashed(
      id,
      <>
        <path data-track="speaker" d="M11 5 6 9H2v6h4l5 4z" />
        <path data-track="wave-inner" d="M15.54 8.46a5 5 0 0 1 0 7.07" pathLength="1" />
        <path data-track="wave-outer" d="M19.07 4.93a10 10 0 0 1 0 14.14" pathLength="1" />
      </>,
    ),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    duration: ({ spin }) => spin.duration ?? 1,
    render: (root, frame) => {
      const shift = sample(
        [
          [0, 0, EASE.inOutSoft],
          [20, 5],
        ],
        frame,
      )
      pose(track(root, "speaker"), shift, 0)
      // Outer wave collapses f0-7, inner wave f7-14, each toward its own centre.
      const outer = sample([[0, 0, EASE.inOutSoft], [7, 50]], frame) / 100
      const inner = sample([[7, 0, EASE.inOutSoft], [14, 50]], frame) / 100
      const outerEl = track(root, "wave-outer")
      const innerEl = track(root, "wave-inner")
      pose(outerEl, shift, 0)
      pose(innerEl, shift, 0)
      trim(outerEl, outer, 1 - outer)
      trim(innerEl, inner, 1 - inner)
      drawSlash(root, frame, 14, 29)
    },
  },
}
