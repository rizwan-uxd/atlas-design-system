import figma from "@figma/code-connect"
import { Label } from "@atlas/ui-web/primitives/Label/Label"

figma.connect(
  Label,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=50-48",
  {
    props: {
      variant:  figma.enum("Variant",        { default: "default", inline: "inline" }),
      size:     figma.enum("Size",           { sm: "sm", md: "md", lg: "lg" }),
      required: figma.boolean("Required"),
      optional: figma.boolean("Optional"),
    },
    example: ({ variant, size, required, optional }) => (
      <Label variant={variant} size={size} required={required} optional={optional}>Field label</Label>
    ),
  }
)
