// GENERATED — do not hand-edit. registry-build from packages/registry/generated/RadioGroup.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { RadioGroup } from "@atlas/ui-web/primitives/RadioGroup/RadioGroup"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof RadioGroup>

// own props of RadioGroup: deleting one, or flipping its optionality, fails here
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Own_direction = Assert<Has<P, "direction">>
type Optional_direction = Assert<Exact<IsOptional<P, "direction">, true>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_name = Assert<Has<P, "name">>
type Optional_name = Assert<Exact<IsOptional<P, "name">, true>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_direction = Assert<Exact<NonNullable<P["direction"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "card" | "default">>
