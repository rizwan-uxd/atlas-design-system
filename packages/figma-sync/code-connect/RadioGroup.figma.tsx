import figma from "@figma/code-connect"
import { RadioGroup, RadioGroupItem } from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"

/**
 * Atlas RadioGroup — Code Connect
 * Figma nodes: 545:98 (Radio Group: Direction, Variant) and 544:283 (Radio Group Item:
 * Variant, Checked, Size, State, Label, Description).
 * Selection lives on the group (value), so the item's Checked axis is not mapped to a prop.
 */
figma.connect(
  RadioGroup,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=545-98",
  {
    props: {
      direction: figma.enum("Direction", { vertical: "vertical", horizontal: "horizontal" }),
      variant: figma.enum("Variant", { default: "default", card: "card" }),
    },
    example: ({ direction, variant }) => (
      <RadioGroup aria-label="Options" direction={direction} variant={variant} defaultValue="two">
        <RadioGroupItem value="one" label="Option one" />
        <RadioGroupItem value="two" label="Option two" />
        <RadioGroupItem value="three" label="Option three" />
      </RadioGroup>
    ),
  }
)

figma.connect(
  RadioGroupItem,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=544-283",
  {
    props: {
      variant: figma.enum("Variant", { default: "default", card: "card" }),
      size: figma.enum("Size", { sm: "sm", md: "md" }),
      disabled: figma.enum("State", { disabled: true }),
      invalid: figma.enum("State", { invalid: true }),
      label: figma.boolean("Label", { true: figma.string("Label text"), false: undefined }),
      description: figma.boolean("Description", {
        true: figma.string("Description text"),
        false: undefined,
      }),
    },
    example: ({ variant, size, disabled, invalid, label, description }) => (
      <RadioGroupItem
        value="option"
        variant={variant}
        size={size}
        disabled={disabled}
        invalid={invalid}
        label={label}
        description={description}
      />
    ),
  }
)
