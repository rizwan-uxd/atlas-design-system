// GENERATED — do not hand-edit. registry-build from packages/registry/generated/RadioGroup.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { RadioGroup, RadioGroupDirection, RadioGroupItem, RadioGroupSize, RadioGroupVariant } from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof RadioGroup>

// own props of RadioGroup: deleting one, flipping its optionality or changing its type fails here
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Type_defaultValue = Assert<Exact<NonNullable<P["defaultValue"]>, NonNullable<string>>>
type Own_direction = Assert<Has<P, "direction">>
type Optional_direction = Assert<Exact<IsOptional<P, "direction">, true>>
type Type_direction = Assert<Exact<NonNullable<P["direction"]>, NonNullable<RadioGroupDirection>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_name = Assert<Has<P, "name">>
type Optional_name = Assert<Exact<IsOptional<P, "name">, true>>
type Type_name = Assert<Exact<NonNullable<P["name"]>, NonNullable<string>>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Type_onValueChange = Assert<Exact<NonNullable<P["onValueChange"]>, NonNullable<(value: string) => void>>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Type_required = Assert<Exact<NonNullable<P["required"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<RadioGroupSize>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<string>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<RadioGroupVariant>>>
type Union_direction = Assert<Exact<NonNullable<P["direction"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "card" | "default">>

// RadioGroupItem: another exported part of the module
type P_RadioGroupItem = React.ComponentProps<typeof RadioGroupItem>
type RadioGroupItem_Own_aria_describedby = Assert<Has<P_RadioGroupItem, "aria-describedby">>
type RadioGroupItem_Optional_aria_describedby = Assert<Exact<IsOptional<P_RadioGroupItem, "aria-describedby">, true>>
type RadioGroupItem_Type_aria_describedby = Assert<Exact<NonNullable<P_RadioGroupItem["aria-describedby"]>, NonNullable<string>>>
type RadioGroupItem_Own_aria_label = Assert<Has<P_RadioGroupItem, "aria-label">>
type RadioGroupItem_Optional_aria_label = Assert<Exact<IsOptional<P_RadioGroupItem, "aria-label">, true>>
type RadioGroupItem_Type_aria_label = Assert<Exact<NonNullable<P_RadioGroupItem["aria-label"]>, NonNullable<string>>>
type RadioGroupItem_Own_className = Assert<Has<P_RadioGroupItem, "className">>
type RadioGroupItem_Optional_className = Assert<Exact<IsOptional<P_RadioGroupItem, "className">, true>>
type RadioGroupItem_Type_className = Assert<Exact<NonNullable<P_RadioGroupItem["className"]>, NonNullable<string>>>
type RadioGroupItem_Own_description = Assert<Has<P_RadioGroupItem, "description">>
type RadioGroupItem_Optional_description = Assert<Exact<IsOptional<P_RadioGroupItem, "description">, true>>
type RadioGroupItem_Type_description = Assert<Exact<NonNullable<P_RadioGroupItem["description"]>, NonNullable<React.ReactNode>>>
type RadioGroupItem_Own_disabled = Assert<Has<P_RadioGroupItem, "disabled">>
type RadioGroupItem_Optional_disabled = Assert<Exact<IsOptional<P_RadioGroupItem, "disabled">, true>>
type RadioGroupItem_Type_disabled = Assert<Exact<NonNullable<P_RadioGroupItem["disabled"]>, NonNullable<boolean>>>
type RadioGroupItem_Own_id = Assert<Has<P_RadioGroupItem, "id">>
type RadioGroupItem_Optional_id = Assert<Exact<IsOptional<P_RadioGroupItem, "id">, true>>
type RadioGroupItem_Type_id = Assert<Exact<NonNullable<P_RadioGroupItem["id"]>, NonNullable<string>>>
type RadioGroupItem_Own_invalid = Assert<Has<P_RadioGroupItem, "invalid">>
type RadioGroupItem_Optional_invalid = Assert<Exact<IsOptional<P_RadioGroupItem, "invalid">, true>>
type RadioGroupItem_Type_invalid = Assert<Exact<NonNullable<P_RadioGroupItem["invalid"]>, NonNullable<boolean>>>
type RadioGroupItem_Own_label = Assert<Has<P_RadioGroupItem, "label">>
type RadioGroupItem_Optional_label = Assert<Exact<IsOptional<P_RadioGroupItem, "label">, true>>
type RadioGroupItem_Type_label = Assert<Exact<NonNullable<P_RadioGroupItem["label"]>, NonNullable<React.ReactNode>>>
type RadioGroupItem_Own_size = Assert<Has<P_RadioGroupItem, "size">>
type RadioGroupItem_Optional_size = Assert<Exact<IsOptional<P_RadioGroupItem, "size">, true>>
type RadioGroupItem_Type_size = Assert<Exact<NonNullable<P_RadioGroupItem["size"]>, NonNullable<RadioGroupSize>>>
type RadioGroupItem_Own_value = Assert<Has<P_RadioGroupItem, "value">>
type RadioGroupItem_Optional_value = Assert<Exact<IsOptional<P_RadioGroupItem, "value">, false>>
type RadioGroupItem_Type_value = Assert<Exact<NonNullable<P_RadioGroupItem["value"]>, NonNullable<string>>>
type RadioGroupItem_Own_variant = Assert<Has<P_RadioGroupItem, "variant">>
type RadioGroupItem_Optional_variant = Assert<Exact<IsOptional<P_RadioGroupItem, "variant">, true>>
type RadioGroupItem_Type_variant = Assert<Exact<NonNullable<P_RadioGroupItem["variant"]>, NonNullable<RadioGroupVariant>>>
type RadioGroupItem_Union_size = Assert<Exact<NonNullable<P_RadioGroupItem["size"]>, "md" | "sm">>
type RadioGroupItem_Union_variant = Assert<Exact<NonNullable<P_RadioGroupItem["variant"]>, "card" | "default">>

// exported types of the module
type Type_RadioGroupDirection = Assert<Exact<RadioGroupDirection, "horizontal" | "vertical">>
type Type_RadioGroupSize = Assert<Exact<RadioGroupSize, "md" | "sm">>
type Type_RadioGroupVariant = Assert<Exact<RadioGroupVariant, "card" | "default">>
