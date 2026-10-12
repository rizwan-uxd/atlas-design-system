import figma from "@figma/code-connect"
import { Progress } from "@atlas/ui-web/primitives/Progress/Progress"

/**
 * Atlas Progress — Code Connect
 * Figma node: 541:28 (Progress, wraps the internal .Progress / Bar set 538:7)
 *
 * Figma properties: State (determinate | indeterminate), Percent (0, 10 ... 100, the bar fill), Label, Value, Helper (+ their text).
 * Percent is a variant because Figma cannot bind a fill to a number (DEC-059); in code it is the `value` prop.
 */
figma.connect(
  Progress,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=541-28",
  {
    props: {
      indeterminate: figma.enum("State", { determinate: false, indeterminate: true }),
      value: figma.enum("Percent", {
        "0": 0, "10": 10, "20": 20, "30": 30, "40": 40, "50": 50, "60": 60, "70": 70, "80": 80, "90": 90, "100": 100,
      }),
      label: figma.boolean("Label", { true: figma.string("Label text"), false: undefined }),
      valueLabel: figma.boolean("Value", { true: figma.string("Value text"), false: undefined }),
      helperText: figma.boolean("Helper", { true: figma.string("Helper text"), false: undefined }),
    },
    example: ({ indeterminate, value, label, valueLabel, helperText }) => (
      <Progress
        value={value}
        indeterminate={indeterminate}
        label={label}
        valueLabel={valueLabel}
        helperText={helperText}
      />
    ),
  }
)
