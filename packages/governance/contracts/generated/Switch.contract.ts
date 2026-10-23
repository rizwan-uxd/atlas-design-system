// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Switch.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Switch, SwitchSize } from "@atlas/ui-web/primitives/Switch/Switch"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Switch>

// own props of Switch: deleting one, flipping its optionality or changing its type fails here
type Own_checked = Assert<Has<P, "checked">>
type Optional_checked = Assert<Exact<IsOptional<P, "checked">, true>>
type Type_checked = Assert<Exact<NonNullable<P["checked"]>, NonNullable<boolean>>>
type Own_defaultChecked = Assert<Has<P, "defaultChecked">>
type Optional_defaultChecked = Assert<Exact<IsOptional<P, "defaultChecked">, true>>
type Type_defaultChecked = Assert<Exact<NonNullable<P["defaultChecked"]>, NonNullable<boolean>>>
type Own_description = Assert<Has<P, "description">>
type Optional_description = Assert<Exact<IsOptional<P, "description">, true>>
type Type_description = Assert<Exact<NonNullable<P["description"]>, NonNullable<React.ReactNode>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<React.ReactNode>>>
type Own_onCheckedChange = Assert<Has<P, "onCheckedChange">>
type Optional_onCheckedChange = Assert<Exact<IsOptional<P, "onCheckedChange">, true>>
type Type_onCheckedChange = Assert<Exact<NonNullable<P["onCheckedChange"]>, NonNullable<(checked: boolean) => void>>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Type_required = Assert<Exact<NonNullable<P["required"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<SwitchSize>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type Type_SwitchSize = Assert<Exact<SwitchSize, "lg" | "md" | "sm">>
