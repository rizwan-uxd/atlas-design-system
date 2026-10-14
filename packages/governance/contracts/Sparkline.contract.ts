/**
 * Atlas Sparkline — API contract v1
 */

import type {
  SparklineProps,
  SparklineVariant,
  SparklineTone,
  SparklineSize,
} from "@atlas/ui-web/primitives/Sparkline/Sparkline"

type AssertSparklineVariant = SparklineVariant extends "line" | "area" ? true : false
const _v: AssertSparklineVariant = true; void _v

type AssertSparklineTone = SparklineTone extends "neutral" | "positive" | "negative" ? true : false
const _t: AssertSparklineTone = true; void _t

type AssertSparklineSize = SparklineSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertSparklineSize = true; void _s

type AssertSparklineShape = {
  values: number[]
  variant?: SparklineVariant
  tone?: SparklineTone
  size?: SparklineSize
  label: string
  className?: string
}
type _CheckSparklineProps = AssertSparklineShape extends Pick<SparklineProps, keyof AssertSparklineShape & keyof SparklineProps> ? true : never
const _p: _CheckSparklineProps = true; void _p
