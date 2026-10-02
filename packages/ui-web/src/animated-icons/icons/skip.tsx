import type { AnimatedIconDefinition } from "../animated-icon.types"
import type { Ease, Key } from "../timeline"
import { frameSeconds, pose, sample, track } from "../timeline"
import { noMotion } from "./toggle-shared"

/**
 * Geometry and timing from useanimations "skip-forward" and "skip-back", 60 frames. Skip back is
 * the same timeline mirrored, so one definition builder serves both.
 *
 * Triangle A leaves (f0-15) and is wiped out from the right as it goes; the bar travels 16px and
 * returns (f20-60); triangle B appears (f40) and is wiped in from the left. The wipes are the
 * source's animated masks, kept as clip rectangles in the triangles' own coordinates.
 *
 * Source quirk, kept: skip-forward's triangle B scale keys end at f70, so the last playable frame
 * (f59) is at 95.7% rather than 100%; skip-back's end at f60.
 *
 * Momentary, as in the source: every click calls `playSegments([0, 60], true)`, so playback always
 * restarts forward from frame 0, never reverses, and holds the last frame.
 *
 * A full run takes `--atlas-duration-pulse` (2s); the source takes 59/30s.
 */
const FRAMES = 60

const TRIANGLE = "M5 4l10 8-10 8z"
const INOUT_FAST: Ease = [0.33, 0, 0, 1]

/** Right edge of the wipe window, with its width, per source frame. */
const WIPE_A: readonly Key[] = [
  [0, 19.13], [5, 19.23], [7, 18.17], [8, 17.39], [9, 16.26], [10, 14.6], [11, 12.1], [12, 8.93], [13, 3.93], [14, -2.9],
]
const WIPE_B: readonly Key[] = [
  [40, -0.33], [43, 2.83], [44, 6.67], [45, 10.33], [46, 13.17], [47, 15], [48, 17.67],
]
const WIDTH_A = 19
const WIDTH_B = 15.17

function build(triangleBEnd: number, mirror: boolean): AnimatedIconDefinition {
  const barKeys: Key[] = [[20, 0, [1, 0, 0.67, 1]], [40, -16.25, [0.33, 0, 0, 1]], [60, 0]]
  const bScale: Key[] = [[50, 0.75, INOUT_FAST], [triangleBEnd, 1]]
  const aScale: Key[] = [[0, 1, INOUT_FAST], [20, 0.75]]
  const aShift: Key[] = [[0, 0, [1, 0, 0.83, 1]], [15, 20]]

  return {
    glyph: (id) => (
      <g transform={mirror ? "translate(24 0) scale(-1 1)" : undefined}>
        <clipPath id={`${id}-a`}>
          <rect data-track="clip-a" y="-2" height="28" x="0" width={WIDTH_A} />
        </clipPath>
        <clipPath id={`${id}-b`}>
          <rect data-track="clip-b" y="-2" height="28" x="0" width={WIDTH_B} />
        </clipPath>
        <path data-track="bar" d="M19 5v14" />
        <g data-track="tri-b" style={{ display: "none" }}>
          <g clipPath={`url(#${id}-b)`}>
            <path d={TRIANGLE} />
          </g>
        </g>
        <g data-track="tri-a">
          <g clipPath={`url(#${id}-a)`}>
            <path d={TRIANGLE} />
          </g>
        </g>
      </g>
    ),
    appear: noMotion,
    hover: noMotion,
    toggle: {
      frames: FRAMES,
      momentary: true,
      duration: ({ pulse }) => pulse.duration ?? frameSeconds(FRAMES),
      render: (root, frame) => {
        pose(track(root, "bar"), sample(barKeys, frame), 0)

        const a = track(root, "tri-a")
        if (a) {
          a.style.display = frame < 15 ? "" : "none"
          const s = sample(aScale, frame)
          pose(a, sample(aShift, frame), 0, s, s, 12, 12)
          const edge = sample(WIPE_A, frame)
          track(root, "clip-a")?.setAttribute("x", String(edge - WIDTH_A))
        }

        const b = track(root, "tri-b")
        if (b) {
          b.style.display = frame >= 40 ? "" : "none"
          const s = sample(bScale, frame)
          pose(b, 0, 0, s, s, 12, 12)
          const edge = sample(WIPE_B, frame)
          track(root, "clip-b")?.setAttribute("x", String(edge - WIDTH_B))
        }
      },
    },
  }
}

export const skipForwardIcon = build(70, false)
export const skipBackIcon = build(60, true)
