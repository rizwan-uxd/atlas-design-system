// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Bubble.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Bubble, BubbleAlign, BubbleGroup, BubbleReactions, BubbleVariant } from "@atlas/ui-web/primitives/Bubble/Bubble"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Bubble>

// own props of Bubble: deleting one, flipping its optionality or changing its type fails here
type Own_align = Assert<Has<P, "align">>
type Optional_align = Assert<Exact<IsOptional<P, "align">, true>>
type Type_align = Assert<Exact<NonNullable<P["align"]>, NonNullable<BubbleAlign>>>
type Own_asChild = Assert<Has<P, "asChild">>
type Optional_asChild = Assert<Exact<IsOptional<P, "asChild">, true>>
type Type_asChild = Assert<Exact<NonNullable<P["asChild"]>, NonNullable<boolean>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<BubbleVariant>>>
type Union_align = Assert<Exact<NonNullable<P["align"]>, "end" | "start">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "destructive" | "muted" | "outline" | "primary" | "secondary" | "tinted">>

// BubbleGroup: another exported part of the module
type P_BubbleGroup = React.ComponentProps<typeof BubbleGroup>

// BubbleReactions: another exported part of the module
type P_BubbleReactions = React.ComponentProps<typeof BubbleReactions>

// exported types of the module
type Type_BubbleAlign = Assert<Exact<BubbleAlign, "end" | "start">>
type Type_BubbleVariant = Assert<Exact<BubbleVariant, "destructive" | "muted" | "outline" | "primary" | "secondary" | "tinted">>
