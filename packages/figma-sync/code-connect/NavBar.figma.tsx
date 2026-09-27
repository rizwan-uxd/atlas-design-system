import figma from "@figma/code-connect"
import { NavBar } from "@atlas/ui-web/layouts/NavBar/NavBar"
import { Button } from "@atlas/ui-web/primitives/Button/Button"

/**
 * Atlas NavBar — Code Connect
 * Figma node: 148:306
 *
 * Figma variant → React variant mapping (DISC-010/025/026, 2026-09-27):
 *   default     → "default"
 *   bordered    → "bordered"
 *   floating    → "floating"
 *   transparent → "transparent"
 */
figma.connect(
  NavBar,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=148-306",
  {
    props: {
      variant: figma.enum("Variant", {
        default:     "default",
        bordered:    "bordered",
        floating:    "floating",
        transparent: "transparent",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        md: "md",
        lg: "lg",
      }),
    },
    example: ({ variant, size }) => (
      <NavBar
        variant={variant}
        size={size}
        brand={<span>Atlas</span>}
        actions={<Button size="sm">Sign in</Button>}
      />
    ),
  }
)
