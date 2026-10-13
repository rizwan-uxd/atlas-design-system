/**
 * Atlas StatCard — API contract v1
 */

import type {
  StatCardProps,
  StatCardSize,
  StatCardTrend,
  StatCardSentiment,
  StatCardDelta,
} from "@atlas/ui-web/compositions/StatCard/StatCard"
import type React from "react"

type AssertStatCardSize = StatCardSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertStatCardSize = true; void _s

type AssertStatCardTrend = StatCardTrend extends "up" | "down" | "flat" ? true : false
const _t: AssertStatCardTrend = true; void _t

type AssertStatCardSentiment = StatCardSentiment extends "positive" | "negative" | "neutral" ? true : false
const _se: AssertStatCardSentiment = true; void _se

type AssertDeltaShape = { text: string; trend: StatCardTrend; sentiment?: StatCardSentiment; trendLabel?: string }
type _CheckDelta = AssertDeltaShape extends StatCardDelta ? (StatCardDelta extends AssertDeltaShape ? true : never) : never
const _d: _CheckDelta = true; void _d

type AssertStatCardShape = {
  size?: StatCardSize
  label: React.ReactNode
  period: React.ReactNode
  value: React.ReactNode
  delta?: StatCardDelta
  loading?: boolean
  className?: string
  id?: string
}
type _CheckStatCardProps = AssertStatCardShape extends Pick<StatCardProps, keyof AssertStatCardShape & keyof StatCardProps> ? true : never
const _p: _CheckStatCardProps = true; void _p
