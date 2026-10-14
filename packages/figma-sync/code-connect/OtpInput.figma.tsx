import figma from "@figma/code-connect"
import { OtpInput } from "@atlas/ui-web/compositions/OtpInput/OtpInput"

figma.connect(
  OtpInput,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=979-1039",
  {
    props: {
      size:     figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      length:   figma.enum("Length", { "4": 4, "5": 5, "6": 6, "7": 7, "8": 8 }),
      disabled: figma.enum("State", { disabled: true }),
      invalid:  figma.enum("State", { error: true }),
    },
    example: ({ size, length, disabled, invalid }) => (
      <OtpInput size={size} length={length} disabled={disabled} invalid={invalid} aria-label="Verification code" />
    ),
  },
)
