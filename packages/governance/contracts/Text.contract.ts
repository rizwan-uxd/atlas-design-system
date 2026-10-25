// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Text.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Text, TextElement, TextTone, TextVariant } from "@atlas/ui-web/primitives/Text/Text"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Text>

// own props of Text: deleting one, flipping its optionality or changing its type fails here
type Own_as = Assert<Has<P, "as">>
type Optional_as = Assert<Exact<IsOptional<P, "as">, true>>
type Type_as = Assert<Exact<NonNullable<P["as"]>, NonNullable<TextElement>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_ref = Assert<Has<P, "ref">>
type Optional_ref = Assert<Exact<IsOptional<P, "ref">, true>>
type Type_ref = Assert<Exact<NonNullable<P["ref"]>, NonNullable<React.Ref<HTMLElement>>>>
type Own_tone = Assert<Has<P, "tone">>
type Optional_tone = Assert<Exact<IsOptional<P, "tone">, true>>
type Type_tone = Assert<Exact<NonNullable<P["tone"]>, NonNullable<TextTone>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<TextVariant>>>
type Union_as = Assert<Exact<NonNullable<P["as"]>, "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span">>
type Union_tone = Assert<Exact<NonNullable<P["tone"]>, "default" | "muted">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "body" | "body-sm" | "caption" | "heading" | "label" | "overline" | "title">>

// exported types of the module
type Type_TextElement = Assert<Exact<TextElement, "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span">>
type Type_TextTone = Assert<Exact<TextTone, "default" | "muted">>
type Type_TextVariant = Assert<Exact<TextVariant, "body" | "body-sm" | "caption" | "heading" | "label" | "overline" | "title">>

// registry Text: its protocolProps and event handlers exist
type Registry_Text_variant = Assert<Has<P, "variant">>
type Registry_Text_tone = Assert<Has<P, "tone">>
type Registry_Text_as = Assert<Has<P, "as">>
