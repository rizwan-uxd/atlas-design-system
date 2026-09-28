import figma from "@figma/code-connect"
import { NavBar } from "@atlas/ui-web/layouts/NavBar/NavBar"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"

/**
 * Atlas NavBar — Code Connect
 * Figma node: 148:306
 *
 * Figma variant → React variant mapping (DISC-010/025/026, 2026-09-27):
 *   default     → "default"
 *   bordered    → "bordered"
 *   floating    → "floating"
 *   transparent → "transparent"
 *
 * Dashboard mode (B3, 2026-09-28): breadcrumb + search ReactNode slots.
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
      /* Marketing: links + actions; Dashboard: breadcrumb + search + actions */
      <NavBar
        variant={variant}
        size={size}
        brand="Atlas"
        links={[
          { label: "Products", href: "/products" },
          { label: "Docs", href: "/docs" },
        ]}
        breadcrumb={<>{/* Breadcrumb — omit links when using */}</>}
        search={<Input placeholder="Search..." />}
        actions={<Button size="sm">Sign in</Button>}
      />
    ),
  }
)
