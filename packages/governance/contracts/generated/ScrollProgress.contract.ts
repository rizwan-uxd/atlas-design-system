// GENERATED — do not hand-edit. registry-build from packages/registry/generated/ScrollProgress.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ScrollProgress } from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ScrollProgress>

// own props of ScrollProgress: deleting one, or flipping its optionality, fails here
type Own_axis = Assert<Has<P, "axis">>
type Optional_axis = Assert<Exact<IsOptional<P, "axis">, true>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Own_scope = Assert<Has<P, "scope">>
type Optional_scope = Assert<Exact<IsOptional<P, "scope">, true>>
type Own_target = Assert<Has<P, "target">>
type Optional_target = Assert<Exact<IsOptional<P, "target">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_axis = Assert<Exact<NonNullable<P["axis"]>, "horizontal" | "vertical">>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_scope = Assert<Exact<NonNullable<P["scope"]>, "container" | "page">>
