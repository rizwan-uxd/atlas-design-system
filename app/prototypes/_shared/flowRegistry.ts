/**
 * Prototype flow registry
 *
 * Add an entry here for every flow you create under app/prototypes/<slug>/.
 * The index page reads from this list — no other wiring needed.
 */

export type FlowMeta = {
  slug: string
  name: string
  description: string
  /** What the flow exercises in the design system */
  exercises: string[]
  /** Optional tag — "in-progress" | "stable" | "experimental" */
  status?: "in-progress" | "stable" | "experimental"
}

export const flows: FlowMeta[] = []
