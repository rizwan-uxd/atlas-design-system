/**
 * Frame-based timelines for toggle icons.
 *
 * A toggle icon is one progress value (0 = unpressed, 1 = pressed) mapped to a source frame; its
 * `render(root, frame)` writes the pose for that frame. Because the pose is a pure function of the
 * frame, playing forward, reversing, and reversing mid-flight all use the same code, which is how
 * the source Lottie players behave. `motion/react` only drives the progress value (see
 * `animated-icon.tsx`); durations come from the icon definition.
 */

/** Source frame rate of the useanimations Lottie files. */
export const SOURCE_FPS = 30

/** Seconds a source timeline of `frames` frames takes to play 0 → frames − 1 at source speed. */
export const frameSeconds = (frames: number): number => (frames - 1) / SOURCE_FPS

export type Ease = readonly [number, number, number, number]

/** Segment easing curves read from the source files. */
export const EASE = {
  /** cubic-bezier(.33, 0, .67, 1): the source's default in/out. */
  inOut: [0.33, 0, 0.67, 1],
  /** cubic-bezier(.5, 0, .5, 1) */
  inOutSoft: [0.5, 0, 0.5, 1],
  /** Slash draw: cubic-bezier(.59, 0, .22, 1) */
  draw: [0.59, 0, 0.22, 1],
  /** Near-linear, used for path morphs and wipes. */
  linear: [0.17, 0.17, 0.83, 0.83],
} as const satisfies Record<string, Ease>

/** `[frame, value, easeToNext]`. The last key has no ease. */
export type Key = readonly [frame: number, value: number, ease?: Ease]

function bezier([x1, y1, x2, y2]: Ease, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  let lo = 0
  let hi = 1
  let u = t
  for (let i = 0; i < 24; i++) {
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3
    if (x < t) lo = u
    else hi = u
    u = (lo + hi) / 2
  }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3
}

/** Value of a keyframe track at `frame`. Holds the first and last value outside the keys. */
export function sample(keys: readonly Key[], frame: number): number {
  const first = keys[0]
  const last = keys[keys.length - 1]
  if (frame <= first[0]) return first[1]
  if (frame >= last[0]) return last[1]
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0, ease = EASE.linear] = keys[i]
    const [f1, v1] = keys[i + 1]
    if (frame >= f0 && frame < f1) return v0 + (v1 - v0) * bezier(ease, (frame - f0) / (f1 - f0))
  }
  return last[1]
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

const round = (n: number): number => Math.round(n * 1000) / 1000

/** Find a part by `data-track` inside an icon's svg. */
export function track(root: SVGSVGElement, name: string): SVGElement | null {
  return root.querySelector<SVGElement>(`[data-track="${name}"]`)
}

/** Translate by (x, y), then scale about (cx, cy). */
export function pose(el: SVGElement | null, x: number, y: number, scaleX = 1, scaleY = scaleX, cx = 0, cy = 0): void {
  el?.setAttribute(
    "transform",
    `translate(${round(x)} ${round(y)}) translate(${cx} ${cy}) scale(${round(scaleX)} ${round(scaleY)}) translate(${-cx} ${-cy})`,
  )
}

/**
 * Show only the `start`–`end` slice (0 to 1) of a path that carries `pathLength="1"`. An empty
 * slice hides the path, which also hides the round cap a zero-length dash would leave.
 */
export function trim(el: SVGElement | null, start: number, end: number): void {
  if (!el) return
  const length = Math.max(0, end - start)
  el.style.visibility = length < 0.001 ? "hidden" : "visible"
  el.style.strokeDasharray = `${round(length)} 2`
  el.style.strokeDashoffset = `${round(-start)}`
}
