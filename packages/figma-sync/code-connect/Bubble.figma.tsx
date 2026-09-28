import figma from "@figma/code-connect"
import { Bubble } from "@atlas/ui-web/primitives/Bubble/Bubble"

figma.connect(
  Bubble,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=656-27",
  {
    props: {
      variant:  figma.enum("Variant", {
        primary: "primary", secondary: "secondary", muted: "muted",
        tinted: "tinted", outline: "outline", destructive: "destructive",
      }),
      align:    figma.enum("Align", { start: "start", end: "end" }),
      children: figma.string("Text"),
    },
    example: ({ variant, align, children }) => (
      <Bubble variant={variant} align={align}>{children}</Bubble>
    ),
  }
)
