import figma from "@figma/code-connect"
import { Slider } from "@atlas/ui-web/primitives/Slider/Slider"

/**
 * Atlas Slider — Code Connect
 * Figma node: 550:241 (Slider: Orientation, Range, State, plus Label, Value, Helper, Leading and
 * Trailing switches and text). The internal .Slider / Bar (550:96) and .Slider / Toggle (550:15)
 * are not connected. `range` makes `value` a [low, high] pair.
 */
figma.connect(
  Slider,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=550-241",
  {
    props: {
      orientation: figma.enum("Orientation", { horizontal: "horizontal", vertical: "vertical" }),
      range: figma.enum("Range", { false: false, true: true }),
      disabled: figma.enum("State", { disabled: true }),
      label: figma.boolean("Label", { true: figma.string("Label text"), false: undefined }),
      valueLabel: figma.boolean("Value", { true: figma.string("Value text"), false: undefined }),
      helperText: figma.boolean("Helper", { true: figma.string("Helper text"), false: undefined }),
      leading: figma.boolean("Leading", { true: figma.string("Leading text"), false: undefined }),
      trailing: figma.boolean("Trailing", { true: figma.string("Trailing text"), false: undefined }),
    },
    example: ({ orientation, range, disabled, label, valueLabel, helperText, leading, trailing }) => (
      <Slider
        orientation={orientation}
        range={range}
        disabled={disabled}
        defaultValue={range ? [30, 70] : 50}
        label={label}
        valueLabel={valueLabel}
        helperText={helperText}
        leading={leading}
        trailing={trailing}
        aria-label="Slider"
      />
    ),
  }
)
