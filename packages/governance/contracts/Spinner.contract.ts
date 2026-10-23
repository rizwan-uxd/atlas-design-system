// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Spinner.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Spinner, SpinnerSize, SpinnerVariant } from "@atlas/ui-web/primitives/Spinner/Spinner"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Spinner>

// own props of Spinner: deleting one, flipping its optionality or changing its type fails here
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<string>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<SpinnerSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<SpinnerVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xs">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "custom" | "default">>

// exported types of the module
type Type_SpinnerSize = Assert<Exact<SpinnerSize, "lg" | "md" | "sm" | "xs">>
type Type_SpinnerVariant = Assert<Exact<SpinnerVariant, "custom" | "default">>
