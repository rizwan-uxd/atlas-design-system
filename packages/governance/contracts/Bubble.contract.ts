/**
 * Atlas Bubble — API contract v1
 */

import type { BubbleProps, BubbleVariant, BubbleAlign } from "@atlas/ui-web/primitives/Bubble/Bubble"

type AssertBubbleVariant = BubbleVariant extends "primary" | "secondary" | "muted" | "tinted" | "outline" | "destructive"
  ? true : false
const _v: AssertBubbleVariant = true; void _v

type AssertBubbleAlign = BubbleAlign extends "start" | "end" ? true : false
const _a: AssertBubbleAlign = true; void _a

type AssertBubbleShape = {
  variant?: BubbleVariant
  align?:   BubbleAlign
  asChild?: boolean
}

type _CheckBubbleProps = AssertBubbleShape extends Pick<BubbleProps, keyof AssertBubbleShape & keyof BubbleProps>
  ? true : never
const _p: _CheckBubbleProps = true; void _p
