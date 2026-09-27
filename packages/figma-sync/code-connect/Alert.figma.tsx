import figma from "@figma/code-connect"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"

figma.connect(
  Alert,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=127-24",
  {
    props: {
      variant: figma.enum("Variant", {
        info:    "info",
        success: "success",
        warning: "warning",
        danger:  "danger",
        neutral: "neutral",
      }),
      size:        figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      dismissible: figma.boolean("Dismissible"),
    },
    example: ({ variant, size, dismissible }) => (
      <Alert
        variant={variant}
        size={size}
        dismissible={dismissible}
        title="Alert title"
        description="Supporting description text."
      />
    ),
  }
)
