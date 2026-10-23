// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Checkbox.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Checkbox>

// own props of Checkbox: deleting one, or flipping its optionality, fails here
type Own_aria_describedby = Assert<Has<P, "aria-describedby">>
type Optional_aria_describedby = Assert<Exact<IsOptional<P, "aria-describedby">, true>>
type Own_checked = Assert<Has<P, "checked">>
type Optional_checked = Assert<Exact<IsOptional<P, "checked">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_defaultChecked = Assert<Has<P, "defaultChecked">>
type Optional_defaultChecked = Assert<Exact<IsOptional<P, "defaultChecked">, true>>
type Own_description = Assert<Has<P, "description">>
type Optional_description = Assert<Exact<IsOptional<P, "description">, true>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Own_onCheckedChange = Assert<Has<P, "onCheckedChange">>
type Optional_onCheckedChange = Assert<Exact<IsOptional<P, "onCheckedChange">, true>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "card" | "default">>
