// GENERATED — do not hand-edit. registry-build from packages/registry/generated/PasswordInput.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { PasswordInput, PasswordInputSize, PasswordStrength, PasswordStrengthChecks, PasswordStrengthLevel } from "@atlas/ui-web/compositions/PasswordInput/PasswordInput"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof PasswordInput>

// own props of PasswordInput: deleting one, flipping its optionality or changing its type fails here
type Own_defaultVisible = Assert<Has<P, "defaultVisible">>
type Optional_defaultVisible = Assert<Exact<IsOptional<P, "defaultVisible">, true>>
type Type_defaultVisible = Assert<Exact<NonNullable<P["defaultVisible"]>, NonNullable<boolean>>>
type Own_onVisibleChange = Assert<Has<P, "onVisibleChange">>
type Optional_onVisibleChange = Assert<Exact<IsOptional<P, "onVisibleChange">, true>>
type Type_onVisibleChange = Assert<Exact<NonNullable<P["onVisibleChange"]>, NonNullable<(visible: boolean) => void>>>
type Own_showStrength = Assert<Has<P, "showStrength">>
type Optional_showStrength = Assert<Exact<IsOptional<P, "showStrength">, true>>
type Type_showStrength = Assert<Exact<NonNullable<P["showStrength"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<PasswordInputSize>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type Type_PasswordInputSize = Assert<Exact<PasswordInputSize, "lg" | "md" | "sm">>
type PasswordStrength_Own_checks = Assert<Has<PasswordStrength, "checks">>
type PasswordStrength_Optional_checks = Assert<Exact<IsOptional<PasswordStrength, "checks">, false>>
type PasswordStrength_Type_checks = Assert<Exact<NonNullable<PasswordStrength["checks"]>, NonNullable<PasswordStrengthChecks>>>
type PasswordStrength_Own_level = Assert<Has<PasswordStrength, "level">>
type PasswordStrength_Optional_level = Assert<Exact<IsOptional<PasswordStrength, "level">, false>>
type PasswordStrength_Type_level = Assert<Exact<NonNullable<PasswordStrength["level"]>, NonNullable<PasswordStrengthLevel | null>>>
type PasswordStrength_Own_score = Assert<Has<PasswordStrength, "score">>
type PasswordStrength_Optional_score = Assert<Exact<IsOptional<PasswordStrength, "score">, false>>
type PasswordStrength_Type_score = Assert<Exact<NonNullable<PasswordStrength["score"]>, NonNullable<number>>>
type PasswordStrength_Keys = Assert<Exact<keyof PasswordStrength, "checks" | "level" | "score">>
type PasswordStrengthChecks_Own_length = Assert<Has<PasswordStrengthChecks, "length">>
type PasswordStrengthChecks_Optional_length = Assert<Exact<IsOptional<PasswordStrengthChecks, "length">, false>>
type PasswordStrengthChecks_Type_length = Assert<Exact<NonNullable<PasswordStrengthChecks["length"]>, NonNullable<boolean>>>
type PasswordStrengthChecks_Own_lowercase = Assert<Has<PasswordStrengthChecks, "lowercase">>
type PasswordStrengthChecks_Optional_lowercase = Assert<Exact<IsOptional<PasswordStrengthChecks, "lowercase">, false>>
type PasswordStrengthChecks_Type_lowercase = Assert<Exact<NonNullable<PasswordStrengthChecks["lowercase"]>, NonNullable<boolean>>>
type PasswordStrengthChecks_Own_number = Assert<Has<PasswordStrengthChecks, "number">>
type PasswordStrengthChecks_Optional_number = Assert<Exact<IsOptional<PasswordStrengthChecks, "number">, false>>
type PasswordStrengthChecks_Type_number = Assert<Exact<NonNullable<PasswordStrengthChecks["number"]>, NonNullable<boolean>>>
type PasswordStrengthChecks_Own_special = Assert<Has<PasswordStrengthChecks, "special">>
type PasswordStrengthChecks_Optional_special = Assert<Exact<IsOptional<PasswordStrengthChecks, "special">, false>>
type PasswordStrengthChecks_Type_special = Assert<Exact<NonNullable<PasswordStrengthChecks["special"]>, NonNullable<boolean>>>
type PasswordStrengthChecks_Own_uppercase = Assert<Has<PasswordStrengthChecks, "uppercase">>
type PasswordStrengthChecks_Optional_uppercase = Assert<Exact<IsOptional<PasswordStrengthChecks, "uppercase">, false>>
type PasswordStrengthChecks_Type_uppercase = Assert<Exact<NonNullable<PasswordStrengthChecks["uppercase"]>, NonNullable<boolean>>>
type PasswordStrengthChecks_Keys = Assert<Exact<keyof PasswordStrengthChecks, "length" | "lowercase" | "number" | "special" | "uppercase">>
type Type_PasswordStrengthLevel = Assert<Exact<PasswordStrengthLevel, "fair" | "good" | "strong" | "weak">>

// PasswordInput: absent by design (packages/registry/contract-props.json)
/** The field is always a password input in the default look. */
type PasswordInput_Absent_type = Assert<Exact<Has<P, "type">, false>>
/** The field is always a password input in the default look. */
type PasswordInput_Absent_variant = Assert<Exact<Has<P, "variant">, false>>

// PasswordInput: inherited props it must keep (packages/registry/contract-props.json)
type PasswordInput_Kept_invalid = Assert<Has<P, "invalid">>
type PasswordInput_KeptType_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type PasswordInput_Kept_disabled = Assert<Has<P, "disabled">>
type PasswordInput_KeptType_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type PasswordInput_Kept_autoComplete = Assert<Has<P, "autoComplete">>
type PasswordInput_KeptType_autoComplete = Assert<Exact<NonNullable<P["autoComplete"]>, NonNullable<string>>>
type PasswordInput_Kept_className = Assert<Has<P, "className">>
type PasswordInput_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
