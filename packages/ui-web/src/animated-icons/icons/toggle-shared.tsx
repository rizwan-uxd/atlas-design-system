import type { ReactNode } from "react"
import type { IconAnimation } from "../animated-icon.types"
import { EASE, sample, trim, track } from "../timeline"

/** The useanimations Media icons have no appear or hover motion; they only toggle. */
export const noMotion: IconAnimation = () => {}

/**
 * Slash across an icon. The visible line runs (2, 2) → (22, 21.5). Under it, a mask cuts a gap
 * along the same line, offset (+1, −1), so the icon shows the real surface through the gap in both
 * themes. (The source draws the gap with a white stroke, which only works on white.)
 *
 * `body` is masked, and a clip transform belongs on an element *inside* `body`: a transform on the
 * masked element itself would scale the mask with it.
 */
export function slashed(id: string, body: ReactNode): ReactNode {
  const mask = `${id}-gap`
  return (
    <>
      <mask id={mask} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
        <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
        <path data-track="gap" d="M3 1 23 20.5" pathLength="1" stroke="black" strokeLinecap="butt" style={{ visibility: "hidden" }} />
      </mask>
      <g mask={`url(#${mask})`}>{body}</g>
      <path data-track="slash" d="M2 2 22 21.5" pathLength="1" style={{ visibility: "hidden" }} />
    </>
  )
}

/** Slash draw shared by every on/off icon: trim 0 → `progress` along the source curve. */
export function drawSlash(root: SVGSVGElement, frame: number, from: number, to: number): void {
  const p = sample(
    [
      [from, 0, EASE.draw],
      [to, 100],
    ],
    frame,
  ) / 100
  trim(track(root, "slash"), 0, p)
  trim(track(root, "gap"), 0, p)
}
