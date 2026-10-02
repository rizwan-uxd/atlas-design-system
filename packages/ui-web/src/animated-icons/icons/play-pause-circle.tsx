import type { AnimatedIconDefinition } from "../animated-icon.types"
import { EASE, lerp, pose, sample, track } from "../timeline"
import { noMotion } from "./toggle-shared"

/** Geometry and timing from useanimations "play-pause-circle" (play-pause-circle.json), 8 frames. */
const FRAMES = 8

/** Right bar: three points that bend from a vertical line into the play triangle's slanted edges. */
const FROM = [14, 15, 14, 12, 14, 9] as const
const TO = [10, 15.56, 15.63, 12.13, 10.06, 8.44] as const

const line = (pts: readonly number[]) => `M${pts[0]} ${pts[1]}L${pts[2]} ${pts[3]}L${pts[4]} ${pts[5]}`

export const playPauseCircleIcon: AnimatedIconDefinition = {
  glyph: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path data-track="bar-left" d="M10 15V9" />
      <path data-track="bar-right" d={line(FROM)} />
    </>
  ),
  appear: noMotion,
  hover: noMotion,
  toggle: {
    frames: FRAMES,
    render: (root, frame) => {
      const t = sample([[0, 0, EASE.inOut], [8, 1]], frame)
      track(root, "bar-right")?.setAttribute("d", line(FROM.map((v, i) => Number(lerp(v, TO[i], t).toFixed(3)))))
      // Left bar stretches to 120% about its own centre.
      pose(track(root, "bar-left"), 0, 0, 1, lerp(1, 1.2, t), 9.99, 12.04)
    },
  },
}
