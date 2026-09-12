/**
 * mockApi — fake async helpers for prototypes.
 *
 * Use these to demo loading + error states with the design system's
 * loading / invalid props (Button.loading, Alert variant="danger", etc).
 */

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type MockOpts = {
  delayMs?: number
  /** Probability between 0 and 1 of a synthetic failure. */
  failRate?: number
  /** Error message used when the fake call rejects. */
  errorMessage?: string
}

export async function mockSubmit<T>(payload: T, opts: MockOpts = {}): Promise<T> {
  const { delayMs = 800, failRate = 0, errorMessage = "Something went wrong. Please try again." } = opts
  await delay(delayMs)
  if (failRate > 0 && Math.random() < failRate) {
    throw new Error(errorMessage)
  }
  return payload
}

/** Returns true after a random delay, simulating an OTP verification. */
export async function mockVerifyOtp(code: string, opts: MockOpts = {}): Promise<boolean> {
  const { delayMs = 700 } = opts
  await delay(delayMs)
  // Demo rule: "0000" always fails, anything else passes.
  if (code === "0000") {
    throw new Error("That code didn't match. Try again.")
  }
  return true
}
