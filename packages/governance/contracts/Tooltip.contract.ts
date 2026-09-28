import type { TooltipContentProps, TooltipSide } from "@atlas/ui-web/primitives/Tooltip/Tooltip"

type AssertTooltipSide = TooltipSide extends "top" | "bottom" | "start" | "end" ? true : false
const _s: AssertTooltipSide = true; void _s

type AssertTooltipSideExhaustive = "top" | "bottom" | "start" | "end" extends TooltipSide ? true : false
const _e: AssertTooltipSideExhaustive = true; void _e

type AssertTooltipShape = { side?: TooltipSide }
type _CheckTooltipProps = AssertTooltipShape extends Pick<TooltipContentProps, keyof AssertTooltipShape & keyof TooltipContentProps> ? true : never
const _p: _CheckTooltipProps = true; void _p
