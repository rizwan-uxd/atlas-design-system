import figma from "@figma/code-connect"
import { Checkbox } from "@/packages/ui-web/src/primitives/Checkbox/Checkbox"

figma.connect(
  Checkbox,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=82-24",
  {
    props: {
      checked: figma.enum("Variant", {
        unchecked:     false,
        checked:       true,
        indeterminate: "indeterminate",
      }),
      size:     figma.enum("Size",  { sm: "sm", md: "md" }),
      disabled: figma.enum("State", { disabled: true }),
    },
    example: ({ checked, size, disabled }) => (
      <Checkbox
        checked={checked}
        size={size}
        disabled={disabled}
        label="Checkbox label"
      />
    ),
  }
)
