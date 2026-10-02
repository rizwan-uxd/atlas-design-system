import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, lerp, pose, sample, track } from "../timeline"
import { noMotion } from "./toggle-shared"

/** Geometry and timing from useanimations "play-pause" (play-pause.json), 8 frames. */
const FRAMES = 8

/** Left bar: five points that open into a play triangle (offsets from the group origin (8, 12)). */
const BAR_FROM = [-2, -8, 2, -8, 2, 0, 2, 8, -2, 8] as const
const BAR_TO = [-3.06, -9, -3, -9, 11.06, 0, -3.06, 9, -3.06, 9.06] as const

const polygon = (pts: readonly number[]) => {
  let d = `M${pts[0]} ${pts[1]}`
  for (let i = 2; i < pts.length; i += 2) d += `L${pts[i]} ${pts[i + 1]}`
  return `${d}Z`
}

export const playPauseIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <g transform="translate(8 12)">
        <path data-track="bar-left" d={polygon(BAR_FROM)} />
      </g>
      <g transform="translate(16 12)">
        <path data-track="bar-right" d="M-2 -8H2V8H-2Z" />
      </g>
    </>
  ),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => {
      const morph = sample([[0, 0, EASE.linear], [8, 1]], frame)
      track(root, "bar-left")?.setAttribute("d", polygon(BAR_FROM.map((v, i) => Number(lerp(v, BAR_TO[i], morph).toFixed(3)))))
      // The right bar scales away over the whole run and fades out in the first half.
      const scale = sample([[0, 1, EASE.inOut], [8, 0]], frame)
      const right = track(root, "bar-right")
      pose(right, 0, 0, scale, scale)
      if (right) right.style.opacity = String(sample([[0, 1, EASE.inOut], [4, 0]], frame))
    },
  },
}
