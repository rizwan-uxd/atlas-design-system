// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Spinner.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Spinner } from "@atlas/ui-web/primitives/Spinner/Spinner"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Spinner>

// own props of Spinner: deleting one, or flipping its optionality, fails here
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xs">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "custom" | "default">>
