import figma from "@figma/code-connect"
import { Badge } from "@atlas/ui-web/primitives/Badge/Badge"

figma.connect(
  Badge,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=123-24",
  {
    props: {
      variant: figma.enum("Variant", {
        neutral: "neutral",
        primary: "primary",
        success: "success",
        warning: "warning",
        danger:  "danger",
        info:    "info",
      }),
      appearance: figma.enum("Appearance", { default: "default", outline: "outline" }),
      size:       figma.enum("Size",  { sm: "sm", md: "md", lg: "lg" }),
      disabled:   figma.enum("State", { disabled: true }),
    },
    example: ({ variant, appearance, size, disabled }) => (
      <Badge variant={variant} appearance={appearance} size={size} disabled={disabled}>
        Label
      </Badge>
    ),
  }
)
