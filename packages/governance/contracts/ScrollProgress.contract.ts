// GENERATED — do not hand-edit. registry-build from packages/registry/generated/ScrollProgress.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ScrollProgress, ScrollProgressAxis, ScrollProgressOrientation, ScrollProgressScope } from "@atlas/ui-web/primitives/ScrollProgress/ScrollProgress"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ScrollProgress>

// own props of ScrollProgress: deleting one, flipping its optionality or changing its type fails here
type Own_axis = Assert<Has<P, "axis">>
type Optional_axis = Assert<Exact<IsOptional<P, "axis">, true>>
type Type_axis = Assert<Exact<NonNullable<P["axis"]>, NonNullable<ScrollProgressAxis>>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Type_orientation = Assert<Exact<NonNullable<P["orientation"]>, NonNullable<ScrollProgressOrientation>>>
type Own_scope = Assert<Has<P, "scope">>
type Optional_scope = Assert<Exact<IsOptional<P, "scope">, true>>
type Type_scope = Assert<Exact<NonNullable<P["scope"]>, NonNullable<ScrollProgressScope>>>
type Own_target = Assert<Has<P, "target">>
type Optional_target = Assert<Exact<IsOptional<P, "target">, true>>
type Type_target = Assert<Exact<NonNullable<P["target"]>, NonNullable<React.RefObject<HTMLElement | null>>>>
type Union_axis = Assert<Exact<NonNullable<P["axis"]>, "horizontal" | "vertical">>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_scope = Assert<Exact<NonNullable<P["scope"]>, "container" | "page">>

// exported types of the module
type Type_ScrollProgressAxis = Assert<Exact<ScrollProgressAxis, "horizontal" | "vertical">>
type Type_ScrollProgressOrientation = Assert<Exact<ScrollProgressOrientation, "horizontal" | "vertical">>
type Type_ScrollProgressScope = Assert<Exact<ScrollProgressScope, "container" | "page">>
