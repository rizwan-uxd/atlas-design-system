"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * useFlowState — step state + form data for a multi-step prototype.
 *
 * - `step` is the active index (0-based).
 * - URL is kept in sync via `?step=N` so back/forward work and links share state.
 * - `data` is a typed bag of form values shared across steps.
 *
 * Refresh resets `data` (intentional — prototypes shouldn't persist).
 */
export function useFlowState<T extends Record<string, unknown>>(opts: {
  totalSteps: number
  initialData: T
  /** URL search param name. Default: "step". Pass null to disable URL sync. */
  param?: string | null
}) {
  const { totalSteps, initialData, param = "step" } = opts

  const [step, setStepState] = useState<number>(() => {
    if (typeof window === "undefined" || !param) return 0
    const url = new URL(window.location.href)
    const raw = url.searchParams.get(param)
    const parsed = raw ? parseInt(raw, 10) : 0
    if (Number.isNaN(parsed)) return 0
    return Math.max(0, Math.min(totalSteps - 1, parsed))
  })

  const [data, setData] = useState<T>(initialData)

  // Sync `step` → URL
  useEffect(() => {
    if (typeof window === "undefined" || !param) return
    const url = new URL(window.location.href)
    if (step === 0) {
      url.searchParams.delete(param)
    } else {
      url.searchParams.set(param, String(step))
    }
    window.history.replaceState(null, "", url.toString())
  }, [step, param])

  const goTo = useCallback(
    (next: number) => {
      setStepState(Math.max(0, Math.min(totalSteps - 1, next)))
    },
    [totalSteps],
  )

  const next = useCallback(() => goTo(step + 1), [goTo, step])
  const back = useCallback(() => goTo(step - 1), [goTo, step])
  const reset = useCallback(() => {
    setStepState(0)
    setData(initialData)
  }, [initialData])

  const patch = useCallback((partial: Partial<T>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  return {
    step,
    setStep: setStepState,
    goTo,
    next,
    back,
    reset,
    data,
    setData,
    patch,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
    totalSteps,
  }
}
