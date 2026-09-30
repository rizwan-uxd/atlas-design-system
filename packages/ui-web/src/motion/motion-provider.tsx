"use client"

/**
 * MotionProvider — mount once near the app root.
 *
 * - Wraps `MotionConfig reducedMotion="user"`, so transform animation is disabled for users who ask
 *   for reduced motion.
 * - Resolves the motion tokens from the live CSS variables after mount and shares them (and the
 *   derived presets) with every animated component below it.
 *
 * Components still render without a provider, using `defaultMotionTokens`.
 */

import * as React from "react"
import { MotionConfig } from "motion/react"
import { createMotionPresets, type MotionPresets } from "./motion-presets"
import { defaultMotionTokens, resolveMotionTokens, type MotionTokens } from "./motion-tokens"

const MotionTokensContext = React.createContext<MotionTokens>(defaultMotionTokens)

// Token values do not change while the page is open, so they are read from the CSS once.
let resolvedTokens: MotionTokens | null = null
const subscribe = () => () => {}
const getSnapshot = () => (resolvedTokens ??= resolveMotionTokens())
const getServerSnapshot = () => defaultMotionTokens

export interface MotionProviderProps {
  children: React.ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  // Server and first client render use the defaults; the live CSS values swap in after hydration.
  const tokens = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <MotionConfig reducedMotion="user">
      <MotionTokensContext.Provider value={tokens}>{children}</MotionTokensContext.Provider>
    </MotionConfig>
  )
}

export function useMotionTokens(): MotionTokens {
  return React.useContext(MotionTokensContext)
}

export function useMotionPresets(): MotionPresets {
  const tokens = useMotionTokens()
  return React.useMemo(() => createMotionPresets(tokens), [tokens])
}
