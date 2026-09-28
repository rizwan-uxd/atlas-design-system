/**
 * Atlas Chart — API contract v1
 */

import type { ChartProps, ChartState } from "@atlas/ui-web/compositions/Chart/Chart"

type AssertChartState = ChartState extends "default" | "loading" | "empty" ? true : false
const _s: AssertChartState = true; void _s

type AssertChartShape = {
  state?: ChartState
}

type _CheckChartProps = AssertChartShape extends Pick<ChartProps, keyof AssertChartShape & keyof ChartProps>
  ? true : never
const _p: _CheckChartProps = true; void _p
