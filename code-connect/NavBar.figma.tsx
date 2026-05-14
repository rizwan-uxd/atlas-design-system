import figma from "@figma/code-connect"
import { NavBar } from "@/components/NavBar/NavBar"

/**
 * Atlas NavBar — Code Connect
 * Figma node: 148:306
 *
 * Figma variant → React variant mapping:
 *   default  → "default"
 *   bordered → "default"   (bordered is a Figma presentation detail;
 *                            code controls border via CSS token)
 *   floating → "elevated"  (floating uses the elevated surface token)
 */
figma.connect(
  NavBar,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=148-306",
  {
    props: {
      variant: figma.enum("Variant", {
        default:  "default",
        bordered: "default",
        floating: "elevated",
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
