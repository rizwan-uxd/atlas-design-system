// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Select.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectSize, SelectTrigger, SelectValue } from "@atlas/ui-web/primitives/Select/Select"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof SelectTrigger>

// own props of SelectTrigger: deleting one, flipping its optionality or changing its type fails here
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<SelectSize>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>

// Select: another exported part of the module
type P_Select = React.ComponentProps<typeof Select>
type Select_Own_children = Assert<Has<P_Select, "children">>
type Select_Optional_children = Assert<Exact<IsOptional<P_Select, "children">, true>>
type Select_Type_children = Assert<Exact<NonNullable<P_Select["children"]>, NonNullable<React.ReactNode>>>
type Select_Own_defaultValue = Assert<Has<P_Select, "defaultValue">>
type Select_Optional_defaultValue = Assert<Exact<IsOptional<P_Select, "defaultValue">, true>>
type Select_Type_defaultValue = Assert<Exact<NonNullable<P_Select["defaultValue"]>, NonNullable<string>>>
type Select_Own_disabled = Assert<Has<P_Select, "disabled">>
type Select_Optional_disabled = Assert<Exact<IsOptional<P_Select, "disabled">, true>>
type Select_Type_disabled = Assert<Exact<NonNullable<P_Select["disabled"]>, NonNullable<boolean>>>
type Select_Own_name = Assert<Has<P_Select, "name">>
type Select_Optional_name = Assert<Exact<IsOptional<P_Select, "name">, true>>
type Select_Type_name = Assert<Exact<NonNullable<P_Select["name"]>, NonNullable<string>>>
type Select_Own_onValueChange = Assert<Has<P_Select, "onValueChange">>
type Select_Optional_onValueChange = Assert<Exact<IsOptional<P_Select, "onValueChange">, true>>
type Select_Type_onValueChange = Assert<Exact<NonNullable<P_Select["onValueChange"]>, NonNullable<(value: string) => void>>>
type Select_Own_required = Assert<Has<P_Select, "required">>
type Select_Optional_required = Assert<Exact<IsOptional<P_Select, "required">, true>>
type Select_Type_required = Assert<Exact<NonNullable<P_Select["required"]>, NonNullable<boolean>>>
type Select_Own_value = Assert<Has<P_Select, "value">>
type Select_Optional_value = Assert<Exact<IsOptional<P_Select, "value">, true>>
type Select_Type_value = Assert<Exact<NonNullable<P_Select["value"]>, NonNullable<string>>>

// SelectContent: another exported part of the module
type P_SelectContent = React.ComponentProps<typeof SelectContent>
type SelectContent_Own_side = Assert<Has<P_SelectContent, "side">>
type SelectContent_Optional_side = Assert<Exact<IsOptional<P_SelectContent, "side">, true>>
type SelectContent_Type_side = Assert<Exact<NonNullable<P_SelectContent["side"]>, NonNullable<"bottom" | "top">>>
type SelectContent_Union_side = Assert<Exact<NonNullable<P_SelectContent["side"]>, "bottom" | "top">>

// SelectGroup: another exported part of the module
type P_SelectGroup = React.ComponentProps<typeof SelectGroup>

// SelectItem: another exported part of the module
type P_SelectItem = React.ComponentProps<typeof SelectItem>
type SelectItem_Own_disabled = Assert<Has<P_SelectItem, "disabled">>
type SelectItem_Optional_disabled = Assert<Exact<IsOptional<P_SelectItem, "disabled">, true>>
type SelectItem_Type_disabled = Assert<Exact<NonNullable<P_SelectItem["disabled"]>, NonNullable<boolean>>>
type SelectItem_Own_value = Assert<Has<P_SelectItem, "value">>
type SelectItem_Optional_value = Assert<Exact<IsOptional<P_SelectItem, "value">, false>>
type SelectItem_Type_value = Assert<Exact<NonNullable<P_SelectItem["value"]>, NonNullable<string>>>

// SelectLabel: another exported part of the module
type P_SelectLabel = React.ComponentProps<typeof SelectLabel>

// SelectSeparator: another exported part of the module
type P_SelectSeparator = React.ComponentProps<typeof SelectSeparator>

// SelectValue: another exported part of the module
type P_SelectValue = React.ComponentProps<typeof SelectValue>
type SelectValue_Own_placeholder = Assert<Has<P_SelectValue, "placeholder">>
type SelectValue_Optional_placeholder = Assert<Exact<IsOptional<P_SelectValue, "placeholder">, true>>
type SelectValue_Type_placeholder = Assert<Exact<NonNullable<P_SelectValue["placeholder"]>, NonNullable<string>>>

// exported types of the module
type Type_SelectSize = Assert<Exact<SelectSize, "md" | "sm">>
