import figma from "@figma/code-connect"
import { Stepper } from "@atlas/ui-web/patterns/Stepper/Stepper"

const STEPS = [{ label: "Account" }, { label: "Profile" }, { label: "Team" }, { label: "Review" }, { label: "Launch" }]

figma.connect(
  Stepper,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=984-3356",
  {
    props: {
      orientation: figma.enum("Orientation", { horizontal: "horizontal", vertical: "vertical" }),
      size:        figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      steps:       figma.enum("Steps", { "3": STEPS.slice(0, 3), "4": STEPS.slice(0, 4), "5": STEPS }),
      current:     figma.enum("Current", { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 }),
    },
    example: ({ orientation, size, steps, current }) => (
      <Stepper orientation={orientation} size={size} steps={steps} current={current} aria-label="Progress" />
    ),
  },
)
