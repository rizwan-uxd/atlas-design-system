import figma from "@figma/code-connect"
import { PasswordInput } from "@atlas/ui-web/compositions/PasswordInput/PasswordInput"

figma.connect(
  PasswordInput,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=909-770",
  {
    props: {
      size:           figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      defaultVisible: figma.enum("Visibility", { hidden: false, shown: true }),
      disabled:       figma.enum("State", { disabled: true }),
      invalid:        figma.enum("State", { error: true }),
      showStrength:   figma.boolean("Strength"),
    },
    example: ({ size, defaultVisible, disabled, invalid, showStrength }) => (
      <PasswordInput
        size={size}
        defaultVisible={defaultVisible}
        disabled={disabled}
        invalid={invalid}
        showStrength={showStrength}
        autoComplete="new-password"
        aria-label="Password"
      />
    ),
  },
)
