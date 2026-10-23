// GENERATED — do not hand-edit. registry-build from packages/registry/generated/OtpInput.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { OtpInput, OtpInputSize } from "@atlas/ui-web/compositions/OtpInput/OtpInput"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof OtpInput>

// own props of OtpInput: deleting one, flipping its optionality or changing its type fails here
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Type_defaultValue = Assert<Exact<NonNullable<P["defaultValue"]>, NonNullable<string>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_length = Assert<Has<P, "length">>
type Optional_length = Assert<Exact<IsOptional<P, "length">, true>>
type Type_length = Assert<Exact<NonNullable<P["length"]>, NonNullable<number>>>
type Own_onComplete = Assert<Has<P, "onComplete">>
type Optional_onComplete = Assert<Exact<IsOptional<P, "onComplete">, true>>
type Type_onComplete = Assert<Exact<NonNullable<P["onComplete"]>, NonNullable<(value: string) => void>>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Type_onValueChange = Assert<Exact<NonNullable<P["onValueChange"]>, NonNullable<(value: string) => void>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<OtpInputSize>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<string>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type Type_OtpInputSize = Assert<Exact<OtpInputSize, "lg" | "md" | "sm">>

// OtpInput: absent by design (packages/registry/contract-props.json)
/** One real input fixes the type, mode and length handling: callers cannot override them. */
type OtpInput_Absent_type = Assert<Exact<Has<P, "type">, false>>
/** One real input fixes the type, mode and length handling: callers cannot override them. */
type OtpInput_Absent_inputMode = Assert<Exact<Has<P, "inputMode">, false>>
/** One real input fixes the type, mode and length handling: callers cannot override them. */
type OtpInput_Absent_maxLength = Assert<Exact<Has<P, "maxLength">, false>>

// OtpInput: inherited props it must keep (packages/registry/contract-props.json)
type OtpInput_Kept_disabled = Assert<Has<P, "disabled">>
type OtpInput_KeptType_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type OtpInput_Kept_autoComplete = Assert<Has<P, "autoComplete">>
type OtpInput_KeptType_autoComplete = Assert<Exact<NonNullable<P["autoComplete"]>, NonNullable<string>>>
type OtpInput_Kept_className = Assert<Has<P, "className">>
type OtpInput_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
