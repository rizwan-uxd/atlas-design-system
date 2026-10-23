// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Card.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Card } from "@atlas/ui-web/compositions/Card/Card"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Card>

// own props of Card: deleting one, or flipping its optionality, fails here
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_interactive = Assert<Has<P, "interactive">>
type Optional_interactive = Assert<Exact<IsOptional<P, "interactive">, true>>
type Own_onClick = Assert<Has<P, "onClick">>
type Optional_onClick = Assert<Exact<IsOptional<P, "onClick">, true>>
type Own_selected = Assert<Has<P, "selected">>
type Optional_selected = Assert<Exact<IsOptional<P, "selected">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "elevated" | "filled" | "outlined">>
