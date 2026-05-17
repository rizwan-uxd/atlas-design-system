import figma from "@figma/code-connect"
import { Button } from "@/packages/ui-web/src/primitives/Button/Button"

/**
 * Atlas Button — Code Connect
 * Figma file  : https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig
 * Component   : Atlas/Web › Button (node 19:2)
 */
figma.connect(
  Button,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=19-2",
  {
    props: {
      variant: figma.enum("Variant", {
        primary:     "primary",
        secondary:   "secondary",
        outline:     "outline",
        ghost:       "ghost",
        destructive: "destructive",
        link:        "link",
      }),
      size: figma.enum("Size", {
        sm:   "sm",
        md:   "md",
        lg:   "lg",
        icon: "icon",
      }),
      loading:  figma.enum("State", { loading: true }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, size, loading, disabled }) => (
      <Button
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
      >
        Button label
      </Button>
    ),
  }
)
