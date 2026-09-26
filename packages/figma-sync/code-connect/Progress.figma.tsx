import figma from "@figma/code-connect"
import { Progress } from "@atlas/ui-web/primitives/Progress/Progress"

/**
 * Atlas Progress — Code Connect
 * Figma node: 538:7 (Progress)
 *
 * Figma properties: State (determinate | indeterminate)
 */
figma.connect(
  Progress,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=538-7",
  {
    props: {
      indeterminate: figma.enum("State", { determinate: false, indeterminate: true }),
    },
    example: ({ indeterminate }) => (
      <Progress value={50} indeterminate={indeterminate} label="Uploading" valueLabel="50%" />
    ),
  }
)
