/**
 * Atlas Divider — API contract v1
 */

import type {
  DividerProps,
  DividerOrientation,
  DividerTone,
} from "@atlas/ui-web/primitives/Divider/Divider"

type AssertDividerOrientation = DividerOrientation extends "horizontal" | "vertical" ? true : false
const _o: AssertDividerOrientation = true; void _o

type AssertDividerTone = DividerTone extends "default" | "strong" | "subtle" | "inverse" ? true : false
const _t: AssertDividerTone = true; void _t

type AssertDividerPropsShape = {
  orientation?: DividerOrientation
  tone?:        DividerTone
  decorative?:  boolean
}

type _CheckDividerProps = AssertDividerPropsShape extends Pick<DividerProps, keyof AssertDividerPropsShape & keyof DividerProps>
  ? true : never
const _p: _CheckDividerProps = true; void _p
