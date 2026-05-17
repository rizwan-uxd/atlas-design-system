import figma from "@figma/code-connect"
import { Badge } from "@/packages/ui-web/src/primitives/Badge/Badge"

figma.connect(
  Badge,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=123-24",
  {
    props: {
      variant: figma.enum("Variant", {
        neutral: "default",
        primary: "secondary",
        success: "success",
        warning: "warning",
        danger:  "danger",
        info:    "info",
      }),
      size:     figma.enum("Size",  { sm: "sm", md: "md", lg: "lg" }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, size, disabled }) => (
      <Badge variant={variant} size={size} disabled={disabled}>
        Label
      </Badge>
    ),
  }
)
