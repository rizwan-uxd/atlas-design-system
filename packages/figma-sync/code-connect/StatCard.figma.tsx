import figma from "@figma/code-connect"
import { Activity } from "lucide-react"
import { StatCard } from "@atlas/ui-web/compositions/StatCard/StatCard"

figma.connect(
  StatCard,
  "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=867-351",
  {
    props: {
      size:      figma.enum("Size", { sm: "sm", md: "md", lg: "lg" }),
      loading:   figma.enum("State", { default: false, loading: true }),
      sentiment: figma.enum("Sentiment", { positive: "positive", negative: "negative", neutral: "neutral" }),
      icon:      figma.enum("Leading icon", { off: undefined, on: <Activity /> }),
      onClick:   figma.enum("Interaction", { static: undefined, hover: () => {}, "focus-visible": () => {}, active: () => {}, disabled: () => {} }),
      disabled:  figma.enum("Interaction", { static: false, hover: false, "focus-visible": false, active: false, disabled: true }),
    },
    example: ({ size, loading, sentiment, icon, onClick, disabled }) => (
      <StatCard
        size={size}
        loading={loading}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        label="Visitors"
        period="Last 7 days"
        value="12,480"
        delta={{ text: "12% vs previous period", trend: "up", sentiment }}
      />
    ),
  },
)
