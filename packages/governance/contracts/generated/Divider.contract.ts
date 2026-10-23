// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Divider.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Divider } from "@atlas/ui-web/primitives/Divider/Divider"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Divider>

// own props of Divider: deleting one, or flipping its optionality, fails here
type Own_decorative = Assert<Has<P, "decorative">>
type Optional_decorative = Assert<Exact<IsOptional<P, "decorative">, true>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Own_tone = Assert<Has<P, "tone">>
type Optional_tone = Assert<Exact<IsOptional<P, "tone">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_tone = Assert<Exact<NonNullable<P["tone"]>, "default" | "inverse" | "strong" | "subtle">>
