import figma from "@figma/code-connect"
import { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"

/**
 * Atlas Skeleton — Code Connect
 * Figma node: 531:5 (Skeleton)
 *
 * Figma properties: Shape (rect | circle)
 */
figma.connect(
  Skeleton,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=531-5",
  {
    props: {
      shape: figma.enum("Shape", { rect: "rect", circle: "circle" }),
    },
    example: ({ shape }) => <Skeleton shape={shape} />,
  }
)
