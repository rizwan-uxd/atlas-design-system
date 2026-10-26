// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Input.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Input, InputSize, InputVariant } from "@atlas/ui-web/primitives/Input/Input"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Input>

// own props of Input: deleting one, flipping its optionality or changing its type fails here
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_leadingIcon = Assert<Has<P, "leadingIcon">>
type Optional_leadingIcon = Assert<Exact<IsOptional<P, "leadingIcon">, true>>
type Type_leadingIcon = Assert<Exact<NonNullable<P["leadingIcon"]>, NonNullable<React.ReactNode>>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Type_loading = Assert<Exact<NonNullable<P["loading"]>, NonNullable<boolean>>>
type Own_prefix = Assert<Has<P, "prefix">>
type Optional_prefix = Assert<Exact<IsOptional<P, "prefix">, true>>
type Type_prefix = Assert<Exact<NonNullable<P["prefix"]>, NonNullable<React.ReactNode>>>
type Own_ref = Assert<Has<P, "ref">>
type Optional_ref = Assert<Exact<IsOptional<P, "ref">, true>>
type Type_ref = Assert<Exact<NonNullable<P["ref"]>, NonNullable<React.Ref<HTMLInputElement>>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<InputSize>>>
type Own_suffix = Assert<Has<P, "suffix">>
type Optional_suffix = Assert<Exact<IsOptional<P, "suffix">, true>>
type Type_suffix = Assert<Exact<NonNullable<P["suffix"]>, NonNullable<React.ReactNode>>>
type Own_trailingIcon = Assert<Has<P, "trailingIcon">>
type Optional_trailingIcon = Assert<Exact<IsOptional<P, "trailingIcon">, true>>
type Type_trailingIcon = Assert<Exact<NonNullable<P["trailingIcon"]>, NonNullable<React.ReactNode>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<InputVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "filled" | "unstyled">>

// exported types of the module
type Type_InputSize = Assert<Exact<InputSize, "lg" | "md" | "sm">>
type Type_InputVariant = Assert<Exact<InputVariant, "default" | "filled" | "unstyled">>

// Input: inherited props it must keep (packages/registry/contract-props.json)
type Input_Kept_disabled = Assert<Has<P, "disabled">>
type Input_KeptType_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Input_Kept_placeholder = Assert<Has<P, "placeholder">>
type Input_KeptType_placeholder = Assert<Exact<NonNullable<P["placeholder"]>, NonNullable<string>>>

// registry TextField: its protocolProps and event handlers exist
type Registry_TextField_variant = Assert<Has<P, "variant">>
type Registry_TextField_size = Assert<Has<P, "size">>
type Registry_TextField_invalid = Assert<Has<P, "invalid">>
type Registry_TextField_loading = Assert<Has<P, "loading">>
type Registry_TextField_disabled = Assert<Has<P, "disabled">>
type Registry_TextField_name = Assert<Has<P, "name">>
type Registry_TextField_value = Assert<Has<P, "value">>
type Registry_TextField_placeholder = Assert<Has<P, "placeholder">>
type Registry_TextField_required = Assert<Has<P, "required">>
type Registry_TextField_onBlur = Assert<Has<P, "onBlur">>
type Registry_TextField_onChange = Assert<Has<P, "onChange">>
type Registry_TextField_onFocus = Assert<Has<P, "onFocus">>
