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
      disabled: figma.enum("State",          { disabled: true }),
      invalid:  figma.enum("State",          { error: true }),
    },
    example: ({ variant, size, required, optional, disabled, invalid }) => (
      <Label variant={variant} size={size} required={required} optional={optional} disabled={disabled} invalid={invalid}>Field label</Label>
    ),
  }
)
