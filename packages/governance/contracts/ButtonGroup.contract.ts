// GENERATED — do not hand-edit. registry-build from packages/registry/generated/ButtonGroup.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ButtonGroup, ButtonGroupButton, ButtonGroupIconButton, ButtonGroupItemVariant, ButtonGroupOrientation, ButtonGroupPosition, ButtonGroupSize } from "@atlas/ui-web/compositions/ButtonGroup/ButtonGroup"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ButtonGroup>

// own props of ButtonGroup: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Type_orientation = Assert<Exact<NonNullable<P["orientation"]>, NonNullable<ButtonGroupOrientation>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<ButtonGroupSize>>>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// ButtonGroupButton: another exported part of the module
type P_ButtonGroupButton = React.ComponentProps<typeof ButtonGroupButton>
type ButtonGroupButton_Own_position = Assert<Has<P_ButtonGroupButton, "position">>
type ButtonGroupButton_Optional_position = Assert<Exact<IsOptional<P_ButtonGroupButton, "position">, true>>
type ButtonGroupButton_Type_position = Assert<Exact<NonNullable<P_ButtonGroupButton["position"]>, NonNullable<ButtonGroupPosition>>>
type ButtonGroupButton_Own_size = Assert<Has<P_ButtonGroupButton, "size">>
type ButtonGroupButton_Optional_size = Assert<Exact<IsOptional<P_ButtonGroupButton, "size">, true>>
type ButtonGroupButton_Type_size = Assert<Exact<NonNullable<P_ButtonGroupButton["size"]>, NonNullable<ButtonGroupSize>>>
type ButtonGroupButton_Own_variant = Assert<Has<P_ButtonGroupButton, "variant">>
type ButtonGroupButton_Optional_variant = Assert<Exact<IsOptional<P_ButtonGroupButton, "variant">, true>>
type ButtonGroupButton_Type_variant = Assert<Exact<NonNullable<P_ButtonGroupButton["variant"]>, NonNullable<ButtonGroupItemVariant>>>
type ButtonGroupButton_Union_position = Assert<Exact<NonNullable<P_ButtonGroupButton["position"]>, "bottom" | "left" | "middle" | "right" | "single" | "top">>
type ButtonGroupButton_Union_size = Assert<Exact<NonNullable<P_ButtonGroupButton["size"]>, "lg" | "md" | "sm">>
type ButtonGroupButton_Union_variant = Assert<Exact<NonNullable<P_ButtonGroupButton["variant"]>, "ghost" | "outline" | "secondary">>

// ButtonGroupIconButton: another exported part of the module
type P_ButtonGroupIconButton = React.ComponentProps<typeof ButtonGroupIconButton>
type ButtonGroupIconButton_Own_aria_label = Assert<Has<P_ButtonGroupIconButton, "aria-label">>
type ButtonGroupIconButton_Optional_aria_label = Assert<Exact<IsOptional<P_ButtonGroupIconButton, "aria-label">, true>>
type ButtonGroupIconButton_Type_aria_label = Assert<Exact<NonNullable<P_ButtonGroupIconButton["aria-label"]>, NonNullable<string>>>
type ButtonGroupIconButton_Own_position = Assert<Has<P_ButtonGroupIconButton, "position">>
type ButtonGroupIconButton_Optional_position = Assert<Exact<IsOptional<P_ButtonGroupIconButton, "position">, true>>
type ButtonGroupIconButton_Type_position = Assert<Exact<NonNullable<P_ButtonGroupIconButton["position"]>, NonNullable<ButtonGroupPosition>>>
type ButtonGroupIconButton_Own_size = Assert<Has<P_ButtonGroupIconButton, "size">>
type ButtonGroupIconButton_Optional_size = Assert<Exact<IsOptional<P_ButtonGroupIconButton, "size">, true>>
type ButtonGroupIconButton_Type_size = Assert<Exact<NonNullable<P_ButtonGroupIconButton["size"]>, NonNullable<ButtonGroupSize>>>
type ButtonGroupIconButton_Own_variant = Assert<Has<P_ButtonGroupIconButton, "variant">>
type ButtonGroupIconButton_Optional_variant = Assert<Exact<IsOptional<P_ButtonGroupIconButton, "variant">, true>>
type ButtonGroupIconButton_Type_variant = Assert<Exact<NonNullable<P_ButtonGroupIconButton["variant"]>, NonNullable<ButtonGroupItemVariant>>>
type ButtonGroupIconButton_Union_position = Assert<Exact<NonNullable<P_ButtonGroupIconButton["position"]>, "bottom" | "left" | "middle" | "right" | "single" | "top">>
type ButtonGroupIconButton_Union_size = Assert<Exact<NonNullable<P_ButtonGroupIconButton["size"]>, "lg" | "md" | "sm">>
type ButtonGroupIconButton_Union_variant = Assert<Exact<NonNullable<P_ButtonGroupIconButton["variant"]>, "ghost" | "outline" | "secondary">>

// exported types of the module
type Type_ButtonGroupItemVariant = Assert<Exact<ButtonGroupItemVariant, "ghost" | "outline" | "secondary">>
type Type_ButtonGroupOrientation = Assert<Exact<ButtonGroupOrientation, "horizontal" | "vertical">>
type Type_ButtonGroupPosition = Assert<Exact<ButtonGroupPosition, "bottom" | "left" | "middle" | "right" | "single" | "top">>
type Type_ButtonGroupSize = Assert<Exact<ButtonGroupSize, "lg" | "md" | "sm">>

// ButtonGroup: inherited props it must keep (packages/registry/contract-props.json)
type ButtonGroup_Kept_className = Assert<Has<P, "className">>
type ButtonGroup_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>

// ButtonGroupButton: inherited props it must keep (packages/registry/contract-props.json)
type ButtonGroupButton_Kept_disabled = Assert<Has<P_ButtonGroupButton, "disabled">>
type ButtonGroupButton_KeptType_disabled = Assert<Exact<NonNullable<P_ButtonGroupButton["disabled"]>, NonNullable<boolean>>>

// ButtonGroupIconButton: inherited props it must keep (packages/registry/contract-props.json)
type ButtonGroupIconButton_Kept_disabled = Assert<Has<P_ButtonGroupIconButton, "disabled">>
type ButtonGroupIconButton_KeptType_disabled = Assert<Exact<NonNullable<P_ButtonGroupIconButton["disabled"]>, NonNullable<boolean>>>
