/**
 * Atlas PasswordInput — API contract v1
 */

import type {
  PasswordInputProps,
  PasswordInputSize,
  PasswordStrength,
  PasswordStrengthChecks,
  PasswordStrengthLevel,
} from "@atlas/ui-web/compositions/PasswordInput/PasswordInput"

type AssertPasswordInputSize = PasswordInputSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertPasswordInputSize = true; void _s

type AssertPasswordStrengthLevel = PasswordStrengthLevel extends "weak" | "fair" | "good" | "strong" ? true : false
const _l: AssertPasswordStrengthLevel = true; void _l

type AssertChecks = { length: boolean; lowercase: boolean; uppercase: boolean; number: boolean; special: boolean }
type _CheckChecks = AssertChecks extends PasswordStrengthChecks ? (PasswordStrengthChecks extends AssertChecks ? true : never) : never
const _c: _CheckChecks = true; void _c

type AssertStrength = { level: PasswordStrengthLevel | null; score: number; checks: PasswordStrengthChecks }
type _CheckStrength = AssertStrength extends PasswordStrength ? (PasswordStrength extends AssertStrength ? true : never) : never
const _st: _CheckStrength = true; void _st

type AssertPasswordInputShape = {
  size?: PasswordInputSize
  showStrength?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  invalid?: boolean
  disabled?: boolean
  autoComplete?: string
  className?: string
}
type _CheckPasswordInputProps = AssertPasswordInputShape extends Pick<PasswordInputProps, keyof AssertPasswordInputShape & keyof PasswordInputProps> ? true : never
const _p: _CheckPasswordInputProps = true; void _p

/** No type, variant or adornment props: the field is always a password input in the default look. */
type AssertNoType = "type" extends keyof PasswordInputProps ? never : true
const _nt: AssertNoType = true; void _nt
type AssertNoVariant = "variant" extends keyof PasswordInputProps ? never : true
const _nv: AssertNoVariant = true; void _nv
