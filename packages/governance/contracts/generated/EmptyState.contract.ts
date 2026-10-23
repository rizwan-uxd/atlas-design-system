// GENERATED — do not hand-edit. registry-build from packages/registry/generated/EmptyState.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { EmptyState } from "@atlas/ui-web/compositions/EmptyState/EmptyState"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof EmptyState>

// own props of EmptyState: deleting one, or flipping its optionality, fails here
type Own_action = Assert<Has<P, "action">>
type Optional_action = Assert<Exact<IsOptional<P, "action">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_description = Assert<Has<P, "description">>
type Optional_description = Assert<Exact<IsOptional<P, "description">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_secondaryAction = Assert<Has<P, "secondaryAction">>
type Optional_secondaryAction = Assert<Exact<IsOptional<P, "secondaryAction">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_title = Assert<Has<P, "title">>
type Optional_title = Assert<Exact<IsOptional<P, "title">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
