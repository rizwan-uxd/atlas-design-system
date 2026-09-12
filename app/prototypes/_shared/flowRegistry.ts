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

export const flows: FlowMeta[] = [
  {
    slug: "tabby",
    name: "Tabby — iOS onboarding",
    description:
      "Multi-step onboarding clone: splash, country picker, marketing carousel, phone + OTP, PIN, trust device, privacy, and a stores home.",
    exercises: ["Button", "Input", "Label", "Card", "Dialog", "Alert", "Badge"],
    status: "in-progress",
  },
  {
    slug: "wise-home",
    name: "Wise — Home screen",
    description:
      "Mobile banking home screen: balance cards, transaction feed, promotional interest card, and bottom tab navigation — based on the Wise app design.",
    exercises: ["Button", "Card", "NavBar", "Badge"],
    status: "stable",
  },
]
