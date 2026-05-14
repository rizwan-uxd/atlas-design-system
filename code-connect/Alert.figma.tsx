import figma from "@figma/code-connect"
import { Alert } from "@/components/Alert/Alert"

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
      }),
      size:        figma.enum("Size",  { sm: "sm", md: "md", lg: "lg" }),
      dismissible: figma.enum("State", { dismissible: true }),
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
