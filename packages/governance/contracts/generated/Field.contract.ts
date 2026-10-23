// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Field.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Field } from "@atlas/ui-web/compositions/Field/Field"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Field>

// own props of Field: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_error = Assert<Has<P, "error">>
type Optional_error = Assert<Exact<IsOptional<P, "error">, true>>
type Own_helpText = Assert<Has<P, "helpText">>
type Optional_helpText = Assert<Exact<IsOptional<P, "helpText">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Own_labelAction = Assert<Has<P, "labelAction">>
type Optional_labelAction = Assert<Exact<IsOptional<P, "labelAction">, true>>
type Own_optional = Assert<Has<P, "optional">>
type Optional_optional = Assert<Exact<IsOptional<P, "optional">, true>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
