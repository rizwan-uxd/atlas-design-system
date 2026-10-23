// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Sparkline.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Sparkline } from "@atlas/ui-web/primitives/Sparkline/Sparkline"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Sparkline>

// own props of Sparkline: deleting one, or flipping its optionality, fails here
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_tone = Assert<Has<P, "tone">>
type Optional_tone = Assert<Exact<IsOptional<P, "tone">, true>>
type Own_values = Assert<Has<P, "values">>
type Optional_values = Assert<Exact<IsOptional<P, "values">, false>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_tone = Assert<Exact<NonNullable<P["tone"]>, "negative" | "neutral" | "positive">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "area" | "line">>
