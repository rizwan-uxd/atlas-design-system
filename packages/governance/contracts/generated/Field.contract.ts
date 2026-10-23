// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Field.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Field, FieldControlProps, FieldSize } from "@atlas/ui-web/compositions/Field/Field"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Field>

// own props of Field: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<(control: FieldControlProps) => React.ReactNode>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_error = Assert<Has<P, "error">>
type Optional_error = Assert<Exact<IsOptional<P, "error">, true>>
type Type_error = Assert<Exact<NonNullable<P["error"]>, NonNullable<React.ReactNode>>>
type Own_helpText = Assert<Has<P, "helpText">>
type Optional_helpText = Assert<Exact<IsOptional<P, "helpText">, true>>
type Type_helpText = Assert<Exact<NonNullable<P["helpText"]>, NonNullable<React.ReactNode>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<React.ReactNode>>>
type Own_labelAction = Assert<Has<P, "labelAction">>
type Optional_labelAction = Assert<Exact<IsOptional<P, "labelAction">, true>>
type Type_labelAction = Assert<Exact<NonNullable<P["labelAction"]>, NonNullable<React.ReactNode>>>
type Own_optional = Assert<Has<P, "optional">>
type Optional_optional = Assert<Exact<IsOptional<P, "optional">, true>>
type Type_optional = Assert<Exact<NonNullable<P["optional"]>, NonNullable<boolean>>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Type_required = Assert<Exact<NonNullable<P["required"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<FieldSize>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type FieldControlProps_Own_aria_describedby = Assert<Has<FieldControlProps, "aria-describedby">>
type FieldControlProps_Optional_aria_describedby = Assert<Exact<IsOptional<FieldControlProps, "aria-describedby">, true>>
type FieldControlProps_Type_aria_describedby = Assert<Exact<NonNullable<FieldControlProps["aria-describedby"]>, NonNullable<string>>>
type FieldControlProps_Own_aria_required = Assert<Has<FieldControlProps, "aria-required">>
type FieldControlProps_Optional_aria_required = Assert<Exact<IsOptional<FieldControlProps, "aria-required">, true>>
type FieldControlProps_Type_aria_required = Assert<Exact<NonNullable<FieldControlProps["aria-required"]>, NonNullable<true>>>
type FieldControlProps_Own_disabled = Assert<Has<FieldControlProps, "disabled">>
type FieldControlProps_Optional_disabled = Assert<Exact<IsOptional<FieldControlProps, "disabled">, false>>
type FieldControlProps_Type_disabled = Assert<Exact<NonNullable<FieldControlProps["disabled"]>, NonNullable<boolean>>>
type FieldControlProps_Own_id = Assert<Has<FieldControlProps, "id">>
type FieldControlProps_Optional_id = Assert<Exact<IsOptional<FieldControlProps, "id">, false>>
type FieldControlProps_Type_id = Assert<Exact<NonNullable<FieldControlProps["id"]>, NonNullable<string>>>
type FieldControlProps_Own_invalid = Assert<Has<FieldControlProps, "invalid">>
type FieldControlProps_Optional_invalid = Assert<Exact<IsOptional<FieldControlProps, "invalid">, false>>
type FieldControlProps_Type_invalid = Assert<Exact<NonNullable<FieldControlProps["invalid"]>, NonNullable<boolean>>>
type FieldControlProps_Keys = Assert<Exact<keyof FieldControlProps, "aria-describedby" | "aria-required" | "disabled" | "id" | "invalid">>
type Type_FieldSize = Assert<Exact<FieldSize, "lg" | "md" | "sm">>

// registry Field: its protocolProps and event handlers exist
type Registry_Field_size = Assert<Has<P, "size">>
type Registry_Field_required = Assert<Has<P, "required">>
type Registry_Field_optional = Assert<Has<P, "optional">>
type Registry_Field_disabled = Assert<Has<P, "disabled">>
