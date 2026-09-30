/**
 * Atlas ScrollProgress — API contract v1
 */

import type {
  ScrollProgressProps,
  ScrollProgressOrientation,
  ScrollProgressScope,
  ScrollProgressAxis,
} from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"
import type React from "react"

type AssertScrollProgressOrientation = ScrollProgressOrientation extends "horizontal" | "vertical" ? true : false
const _o: AssertScrollProgressOrientation = true; void _o

type AssertScrollProgressScope = ScrollProgressScope extends "page" | "container" ? true : false
const _s: AssertScrollProgressScope = true; void _s

type AssertScrollProgressAxis = ScrollProgressAxis extends "vertical" | "horizontal" ? true : false
const _a: AssertScrollProgressAxis = true; void _a

type AssertScrollProgressShape = {
  orientation?: ScrollProgressOrientation
  scope?:       ScrollProgressScope
  target?:      React.RefObject<HTMLElement | null>
  axis?:        ScrollProgressAxis
}

type _CheckScrollProgressProps = AssertScrollProgressShape extends Pick<ScrollProgressProps, keyof AssertScrollProgressShape & keyof ScrollProgressProps>
  ? true : never
const _p: _CheckScrollProgressProps = true; void _p
