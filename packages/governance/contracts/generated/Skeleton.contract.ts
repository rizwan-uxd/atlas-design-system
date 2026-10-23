// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Skeleton.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Skeleton } from "@atlas/ui-web/primitives/Skeleton/Skeleton"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Skeleton>

// own props of Skeleton: deleting one, or flipping its optionality, fails here
type Own_shape = Assert<Has<P, "shape">>
type Optional_shape = Assert<Exact<IsOptional<P, "shape">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_shape = Assert<Exact<NonNullable<P["shape"]>, "circle" | "rect">>
