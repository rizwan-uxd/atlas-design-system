// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Textarea.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Textarea, TextareaResize, TextareaSize, TextareaVariant } from "@atlas/ui-web/primitives/Textarea/Textarea"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Textarea>

// own props of Textarea: deleting one, flipping its optionality or changing its type fails here
type Own_autoGrow = Assert<Has<P, "autoGrow">>
type Optional_autoGrow = Assert<Exact<IsOptional<P, "autoGrow">, true>>
type Type_autoGrow = Assert<Exact<NonNullable<P["autoGrow"]>, NonNullable<boolean>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_maxRows = Assert<Has<P, "maxRows">>
type Optional_maxRows = Assert<Exact<IsOptional<P, "maxRows">, true>>
type Type_maxRows = Assert<Exact<NonNullable<P["maxRows"]>, NonNullable<number>>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Type_required = Assert<Exact<NonNullable<P["required"]>, NonNullable<boolean>>>
type Own_resize = Assert<Has<P, "resize">>
type Optional_resize = Assert<Exact<IsOptional<P, "resize">, true>>
type Type_resize = Assert<Exact<NonNullable<P["resize"]>, NonNullable<TextareaResize>>>
type Own_showCount = Assert<Has<P, "showCount">>
type Optional_showCount = Assert<Exact<IsOptional<P, "showCount">, true>>
type Type_showCount = Assert<Exact<NonNullable<P["showCount"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<TextareaSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<TextareaVariant>>>
type Union_resize = Assert<Exact<NonNullable<P["resize"]>, "both" | "none" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "filled" | "unstyled">>

// exported types of the module
type Type_TextareaResize = Assert<Exact<TextareaResize, "both" | "none" | "vertical">>
type Type_TextareaSize = Assert<Exact<TextareaSize, "lg" | "md" | "sm">>
type Type_TextareaVariant = Assert<Exact<TextareaVariant, "default" | "filled" | "unstyled">>

// Textarea: inherited props it must keep (packages/registry/contract-props.json)
type Textarea_Kept_disabled = Assert<Has<P, "disabled">>
type Textarea_KeptType_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Textarea_Kept_placeholder = Assert<Has<P, "placeholder">>
type Textarea_KeptType_placeholder = Assert<Exact<NonNullable<P["placeholder"]>, NonNullable<string>>>
