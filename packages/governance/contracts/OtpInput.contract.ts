/**
 * Atlas OtpInput — API contract v1
 */

import type { OtpInputProps, OtpInputSize } from "@atlas/ui-web/compositions/OtpInput/OtpInput"

type AssertOtpInputSize = OtpInputSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertOtpInputSize = true; void _s

type AssertOtpInputShape = {
  size?: OtpInputSize
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  autoComplete?: string
  className?: string
}
type _CheckOtpInputProps = AssertOtpInputShape extends Pick<OtpInputProps, keyof AssertOtpInputShape & keyof OtpInputProps> ? true : never
const _p: _CheckOtpInputProps = true; void _p

/** One real input fixes the type, mode and length handling: callers cannot override them. */
type AssertNoType = "type" extends keyof OtpInputProps ? never : true
const _nt: AssertNoType = true; void _nt
type AssertNoInputMode = "inputMode" extends keyof OtpInputProps ? never : true
const _nm: AssertNoInputMode = true; void _nm
type AssertNoMaxLength = "maxLength" extends keyof OtpInputProps ? never : true
const _nl: AssertNoMaxLength = true; void _nl
