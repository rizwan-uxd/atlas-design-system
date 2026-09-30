/**
 * Atlas motion presets — named transitions built from motion tokens. Icons and future animated
 * components pick a preset by intent; they never write a duration or easing themselves.
 */

import type { AnimationOptions } from "motion/react"
import type { MotionTokens } from "./motion-tokens"

export interface MotionPresets {
  /** Quick feedback: press, reset to rest. */
  quick: AnimationOptions
  /** Default enter / hover movement. */
  enter: AnimationOptions
  /** Leaving or returning to rest. */
  exit: AnimationOptions
  /** Deliberate emphasis: success pop, draw-in. */
  emphasis: AnimationOptions
  /** Continuous rotation, one turn per `--atlas-duration-spin`. */
  spin: AnimationOptions
  /** Continuous loading pulse over `--atlas-duration-pulse`. */
  pulse: AnimationOptions
  /** Delay between sibling parts of one icon, in seconds. */
  stagger: number
  /** Lowest opacity of the loading pulse. */
  pulseOpacity: number
}

export function createMotionPresets({ duration, easing, pulseOpacity }: MotionTokens): MotionPresets {
  return {
    quick: { duration: duration.fast, ease: [...easing.standard] },
    enter: { duration: duration.base, ease: [...easing.standard] },
    exit: { duration: duration.fast, ease: [...easing.exit] },
    emphasis: { duration: duration.slow, ease: [...easing.emphasized] },
    spin: { duration: duration.spin, ease: [...easing.linear], repeat: Infinity },
    pulse: { duration: duration.pulse, ease: [...easing.linear], repeat: Infinity },
    stagger: duration.fast / 3,
    pulseOpacity,
  }
}
