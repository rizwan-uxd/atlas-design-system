import figma from "@figma/code-connect"
import { ScrollProgress } from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"

/**
 * Atlas ScrollProgress — Code Connect
 * Figma node: 734:27 (Scroll Progress)
 *
 * Figma properties: Orientation (horizontal | vertical) · Scope (page | container) · Progress (0 | 50 | 100).
 * Progress is a drawn level only; in code the fill follows scroll position, so it is not mapped.
 */
figma.connect(
  ScrollProgress,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=734-27",
  {
    props: {
      orientation: figma.enum("Orientation", { horizontal: "horizontal", vertical: "vertical" }),
      scope: figma.enum("Scope", { page: "page", container: "container" }),
    },
    example: ({ orientation, scope }) => (
      <ScrollProgress orientation={orientation} scope={scope} aria-label="Reading progress" />
    ),
  }
)
