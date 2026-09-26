/**
 * Atlas Spinner — API contract v1
 */

import type {
  SpinnerProps,
  SpinnerVariant,
  SpinnerSize,
} from "@atlas/ui-web/primitives/Spinner/Spinner"

type AssertSpinnerVariant = SpinnerVariant extends "default" | "custom" ? true : false
const _v: AssertSpinnerVariant = true; void _v

type AssertSpinnerSize = SpinnerSize extends "xs" | "sm" | "md" | "lg" ? true : false
const _s: AssertSpinnerSize = true; void _s

type AssertSpinnerPropsShape = {
  variant?: SpinnerVariant
  size?:    SpinnerSize
  label?:   string
}

type _CheckSpinnerProps = AssertSpinnerPropsShape extends Pick<SpinnerProps, keyof AssertSpinnerPropsShape & keyof SpinnerProps>
  ? true : never
const _p: _CheckSpinnerProps = true; void _p
