import figma from "@figma/code-connect"
import { Progress } from "@atlas/ui-web/primitives/Progress/Progress"

/**
 * Atlas Progress — Code Connect
 * Figma node: 541:28 (Progress, wraps the internal .Progress / Bar set 538:7)
 *
 * Figma properties: State (determinate | indeterminate), Label, Value, Helper (+ their text)
 */
figma.connect(
  Progress,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=541-28",
  {
    props: {
      indeterminate: figma.enum("State", { determinate: false, indeterminate: true }),
      label: figma.boolean("Label", { true: figma.string("Label text"), false: undefined }),
      valueLabel: figma.boolean("Value", { true: figma.string("Value text"), false: undefined }),
      helperText: figma.boolean("Helper", { true: figma.string("Helper text"), false: undefined }),
    },
    example: ({ indeterminate, label, valueLabel, helperText }) => (
      <Progress
        value={50}
        indeterminate={indeterminate}
        label={label}
        valueLabel={valueLabel}
        helperText={helperText}
      />
    ),
  }
)
