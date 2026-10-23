// GENERATED — do not hand-edit. registry-build from packages/registry/generated/StatCard.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { StatCard } from "@atlas/ui-web/compositions/StatCard/StatCard"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof StatCard>

// own props of StatCard: deleting one, or flipping its optionality, fails here
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_delta = Assert<Has<P, "delta">>
type Optional_delta = Assert<Exact<IsOptional<P, "delta">, true>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Own_onClick = Assert<Has<P, "onClick">>
type Optional_onClick = Assert<Exact<IsOptional<P, "onClick">, true>>
type Own_period = Assert<Has<P, "period">>
type Optional_period = Assert<Exact<IsOptional<P, "period">, false>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_sparkline = Assert<Has<P, "sparkline">>
type Optional_sparkline = Assert<Exact<IsOptional<P, "sparkline">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, false>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
