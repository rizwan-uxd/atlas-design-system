import figma from "@figma/code-connect"
import { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"

figma.connect(
  Checkbox,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=82-24",
  {
    props: {
      variant: figma.enum("Variant", { default: "default", card: "card" }),
      checked: figma.enum("Checked", {
        unchecked:     false,
        checked:       true,
        indeterminate: "indeterminate",
      }),
      size:     figma.enum("Size",  { sm: "sm", md: "md", lg: "lg" }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ variant, checked, size, disabled }) => (
      <Checkbox
        variant={variant}
        checked={checked}
        size={size}
        disabled={disabled}
        label="Checkbox label"
      />
    ),
  }
)
