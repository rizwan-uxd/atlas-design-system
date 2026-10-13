import figma from "@figma/code-connect"
import { Field } from "@atlas/ui-web/compositions/Field/Field"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import { Input } from "@atlas/ui-web/primitives/Input/Input"

figma.connect(
  Field,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=863-254",
  {
    props: {
      size:     figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      helpText: figma.boolean("Help", { true: figma.string("Help text"), false: undefined }),
      error:    figma.boolean("Invalid", { true: figma.string("Error text"), false: undefined }),
      labelAction: figma.boolean("Action", {
        true: <Button variant="link">Forgot password?</Button>,
        false: undefined,
      }),
    },
    example: ({ size, helpText, error, labelAction }) => (
      <Field size={size} label="Email" helpText={helpText} error={error} labelAction={labelAction}>
        {(control) => <Input size={size} placeholder="you@example.com" {...control} />}
      </Field>
    ),
  },
)
