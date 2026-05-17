import figma from "@figma/code-connect"
import { Textarea } from "@atlas/ui-web/primitives/Textarea/Textarea"

figma.connect(
  Textarea,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=66-24",
  {
    props: {
      variant:  figma.enum("Variant", { default: "default", filled: "filled" }),
      size:     figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
      invalid:  figma.enum("State",   { error: true }),
      disabled: figma.enum("State",   { disabled: true }),
    },
    example: ({ variant, size, invalid, disabled }) => (
      <Textarea
        variant={variant}
        size={size}
        invalid={invalid}
        disabled={disabled}
        placeholder="Enter text…"
      />
    ),
  }
)
