import figma from "@figma/code-connect"
import { Spinner } from "@atlas/ui-web/primitives/Spinner/Spinner"

/**
 * Atlas Spinner — Code Connect
 * Figma node: 527:63 (Spinner)
 *
 * Figma properties: Variant (default | custom) · Size (xs | sm | md | lg)
 */
figma.connect(
  Spinner,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=527-63",
  {
    props: {
      variant: figma.enum("Variant", { default: "default", custom: "custom" }),
      size: figma.enum("Size", { xs: "xs", sm: "sm", md: "md", lg: "lg" }),
    },
    example: ({ variant, size }) => <Spinner variant={variant} size={size} />,
  }
)
