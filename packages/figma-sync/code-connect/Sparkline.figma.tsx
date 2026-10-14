import figma from "@figma/code-connect"
import { Sparkline } from "@atlas/ui-web/primitives/Sparkline/Sparkline"

/**
 * Atlas Sparkline — Code Connect
 * Figma node: 953:48 (Sparkline)
 *
 * Figma properties: Variant (line | area) · Tone (neutral | positive | negative) · Size (sm | md | lg)
 */
figma.connect(
  Sparkline,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=953-48",
  {
    props: {
      variant: figma.enum("Variant", { line: "line", area: "area" }),
      tone: figma.enum("Tone", { neutral: "neutral", positive: "positive", negative: "negative" }),
      size: figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
    },
    example: ({ variant, tone, size }) => (
      <Sparkline
        variant={variant}
        tone={tone}
        size={size}
        values={[8, 14, 10, 18, 15, 22, 19, 28]}
        label="Visitors, last 7 days, rising"
      />
    ),
  }
)
