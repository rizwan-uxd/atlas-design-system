// GENERATED — do not hand-edit. registry-build from packages/registry/generated/EmptyState.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { EmptyState, EmptyStateSize } from "@atlas/ui-web/compositions/EmptyState/EmptyState"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof EmptyState>

// own props of EmptyState: deleting one, flipping its optionality or changing its type fails here
type Own_action = Assert<Has<P, "action">>
type Optional_action = Assert<Exact<IsOptional<P, "action">, true>>
type Type_action = Assert<Exact<NonNullable<P["action"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_description = Assert<Has<P, "description">>
type Optional_description = Assert<Exact<IsOptional<P, "description">, true>>
type Type_description = Assert<Exact<NonNullable<P["description"]>, NonNullable<React.ReactNode>>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<React.ReactNode>>>
type Own_secondaryAction = Assert<Has<P, "secondaryAction">>
type Optional_secondaryAction = Assert<Exact<IsOptional<P, "secondaryAction">, true>>
type Type_secondaryAction = Assert<Exact<NonNullable<P["secondaryAction"]>, NonNullable<React.ReactNode>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<EmptyStateSize>>>
type Own_title = Assert<Has<P, "title">>
type Optional_title = Assert<Exact<IsOptional<P, "title">, true>>
type Type_title = Assert<Exact<NonNullable<P["title"]>, NonNullable<React.ReactNode>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type Type_EmptyStateSize = Assert<Exact<EmptyStateSize, "lg" | "md" | "sm">>
