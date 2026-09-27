import figma from "@figma/code-connect"
import { Switch } from "@atlas/ui-web/primitives/Switch/Switch"

figma.connect(
  Switch,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=95-114",
  {
    props: {
      defaultChecked: figma.enum("Checked", { off: false, on: true }),
      size:           figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
      disabled:       figma.enum("State",   { disabled: true }),
      invalid:        figma.boolean("Invalid"),
    },
    example: ({ defaultChecked, size, disabled, invalid }) => (
      <Switch
        defaultChecked={defaultChecked}
        size={size}
        disabled={disabled}
        invalid={invalid}
        label="Switch label"
      />
    ),
  }
)
