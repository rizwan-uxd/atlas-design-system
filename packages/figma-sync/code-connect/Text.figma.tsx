import figma from "@figma/code-connect"
import { Text } from "@atlas/ui-web/primitives/Text/Text"

figma.connect(
  Text,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=1120-31",
  {
    props: {
      variant:  figma.enum("Variant", {
        heading: "heading", title: "title", body: "body", "body-sm": "body-sm",
        label: "label", caption: "caption", overline: "overline",
      }),
      tone:     figma.enum("Tone", { default: "default", muted: "muted" }),
      children: figma.string("Text"),
    },
    example: ({ variant, tone, children }) => (
      <Text variant={variant} tone={tone}>{children}</Text>
    ),
  }
)
