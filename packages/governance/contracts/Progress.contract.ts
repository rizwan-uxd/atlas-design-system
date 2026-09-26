/**
 * Atlas Progress — API contract v1
 */

import type { ProgressProps } from "@atlas/ui-web/primitives/Progress/Progress"
import type * as React from "react"

type AssertProgressPropsShape = {
  value?: number
  max?: number
  indeterminate?: boolean
  label?: React.ReactNode
  valueLabel?: React.ReactNode
  helperText?: React.ReactNode
  "aria-valuetext"?: string
}

type _CheckProgressProps = AssertProgressPropsShape extends Pick<ProgressProps, keyof AssertProgressPropsShape & keyof ProgressProps>
  ? true : never
const _p: _CheckProgressProps = true; void _p

// Progress has no Variant or Size union (Figma has only State); `role` is fixed.
type AssertNoRole = "role" extends keyof ProgressProps ? never : true
const _r: AssertNoRole = true; void _r
