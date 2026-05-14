import figma from "@figma/code-connect"
import { Input } from "@/components/Input/Input"

figma.connect(
  Input,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=43-111",
  {
    props: {
      variant:  figma.enum("Variant", { default: "default", filled: "filled", unstyled: "unstyled" }),
      size:     figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
      invalid:  figma.enum("State",   { error: true }),
      disabled: figma.enum("State",   { disabled: true }),
    },
    example: ({ variant, size, invalid, disabled }) => (
      <Input
        variant={variant}
        size={size}
        invalid={invalid}
        disabled={disabled}
        placeholder="Enter value…"
      />
    ),
  }
)
