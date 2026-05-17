import figma from "@figma/code-connect"
import { Switch } from "@atlas/ui-web/primitives/Switch/Switch"

figma.connect(
  Switch,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=95-114",
  {
    props: {
      defaultChecked: figma.enum("Variant", { off: false, on: true }),
      size:           figma.enum("Size",    { sm: "sm", md: "md" }),
      disabled:       figma.enum("State",   { disabled: true }),
    },
    example: ({ defaultChecked, size, disabled }) => (
      <Switch
        defaultChecked={defaultChecked}
        size={size}
        disabled={disabled}
        label="Switch label"
      />
    ),
  }
)
