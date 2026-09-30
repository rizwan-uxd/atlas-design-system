"use client"

import { useReducedMotion, useReducedMotionConfig } from "motion/react"

/**
 * True when motion should be reduced: the user asks for it in their OS, or an enclosing
 * `MotionConfig` forces it (`reducedMotion="always"`). `MotionConfig reducedMotion="user"` already
 * drops transform animation library-wide; components read this hook to also drop opacity, path and
 * loop animation and fall back to the static end state.
 */
export function usePrefersReducedMotion(): boolean {
  const configured = useReducedMotionConfig()
  const system = useReducedMotion()
  return Boolean(configured || system)
}
