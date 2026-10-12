import figma from "@figma/code-connect"
import { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

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
      actions:     figma.boolean("Actions", {
        true:  <Button variant="outline" size="sm">Retry</Button>,
        false: undefined,
      }),
    },
    example: ({ variant, size, dismissible, actions }) => (
      <Alert
        variant={variant}
        size={size}
        dismissible={dismissible}
        title="Alert title"
        description="Supporting description text."
        actions={actions}
      />
    ),
  }
)
