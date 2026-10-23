// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Select.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { SelectTrigger } from "@atlas/ui-web/primitives/Select/Select"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof SelectTrigger>

// own props of SelectTrigger: deleting one, or flipping its optionality, fails here
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
