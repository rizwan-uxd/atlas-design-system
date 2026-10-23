// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Bubble.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Bubble } from "@atlas/ui-web/primitives/Bubble/Bubble"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Bubble>

// own props of Bubble: deleting one, or flipping its optionality, fails here
type Own_align = Assert<Has<P, "align">>
type Optional_align = Assert<Exact<IsOptional<P, "align">, true>>
type Own_asChild = Assert<Has<P, "asChild">>
type Optional_asChild = Assert<Exact<IsOptional<P, "asChild">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_align = Assert<Exact<NonNullable<P["align"]>, "end" | "start">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "destructive" | "muted" | "outline" | "primary" | "secondary" | "tinted">>
