import figma from "@figma/code-connect"
import { Divider } from "@atlas/ui-web/primitives/Divider/Divider"

/**
 * Atlas Divider — Code Connect
 * Figma node: 498:11 (Divider)
 *
 * Figma properties: Orientation (horizontal | vertical) · Tone (default | strong | subtle | inverse)
 */
figma.connect(
  Divider,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=498-11",
  {
    props: {
      orientation: figma.enum("Orientation", { horizontal: "horizontal", vertical: "vertical" }),
      tone: figma.enum("Tone", { default: "default", strong: "strong", subtle: "subtle", inverse: "inverse" }),
    },
    example: ({ orientation, tone }) => <Divider orientation={orientation} tone={tone} />,
  }
)
