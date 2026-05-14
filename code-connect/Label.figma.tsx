import figma from "@figma/code-connect"
import { Label } from "@/components/Label/Label"

figma.connect(
  Label,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=50-48",
  {
    props: {
      size:     figma.enum("Size",           { sm: "sm", md: "md", lg: "lg" }),
      required: figma.boolean("Required"),
    },
    example: ({ size, required }) => (
      <Label size={size} required={required}>Field label</Label>
    ),
  }
)
