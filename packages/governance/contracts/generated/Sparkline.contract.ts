// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Sparkline.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Sparkline, SparklineSize, SparklineTone, SparklineVariant } from "@atlas/ui-web/primitives/Sparkline/Sparkline"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Sparkline>

// own props of Sparkline: deleting one, flipping its optionality or changing its type fails here
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<string>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<SparklineSize>>>
type Own_tone = Assert<Has<P, "tone">>
type Optional_tone = Assert<Exact<IsOptional<P, "tone">, true>>
type Type_tone = Assert<Exact<NonNullable<P["tone"]>, NonNullable<SparklineTone>>>
type Own_values = Assert<Has<P, "values">>
type Optional_values = Assert<Exact<IsOptional<P, "values">, false>>
type Type_values = Assert<Exact<NonNullable<P["values"]>, NonNullable<number[]>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<SparklineVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_tone = Assert<Exact<NonNullable<P["tone"]>, "negative" | "neutral" | "positive">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "area" | "line">>

// exported types of the module
type Type_SparklineSize = Assert<Exact<SparklineSize, "lg" | "md" | "sm">>
type Type_SparklineTone = Assert<Exact<SparklineTone, "negative" | "neutral" | "positive">>
type Type_SparklineVariant = Assert<Exact<SparklineVariant, "area" | "line">>

// Sparkline: inherited props it must keep (packages/registry/contract-props.json)
type Sparkline_Kept_className = Assert<Has<P, "className">>
type Sparkline_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
