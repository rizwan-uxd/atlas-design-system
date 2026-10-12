import figma from "@figma/code-connect"
import { Input } from "@atlas/ui-web/primitives/Input/Input"

figma.connect(
  Input,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=43-111",
  {
    props: {
      variant:  figma.enum("Variant", { default: "default", filled: "filled", unstyled: "unstyled" }),
      size:     figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
      invalid:  figma.enum("State",   { error: true }),
      disabled: figma.enum("State",   { disabled: true }),
      leadingIcon:  figma.boolean("Leading icon",  { true: figma.instance("Leading icon slot"),  false: undefined }),
      trailingIcon: figma.boolean("Trailing icon", { true: figma.instance("Trailing icon slot"), false: undefined }),
    },
    example: ({ variant, size, invalid, disabled, leadingIcon, trailingIcon }) => (
      <Input
        variant={variant}
        size={size}
        invalid={invalid}
        disabled={disabled}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        placeholder="Enter value…"
      />
    ),
  }
)
