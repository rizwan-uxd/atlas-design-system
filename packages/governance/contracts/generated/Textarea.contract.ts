// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Textarea.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Textarea } from "@atlas/ui-web/primitives/Textarea/Textarea"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Textarea>

// own props of Textarea: deleting one, or flipping its optionality, fails here
type Own_autoGrow = Assert<Has<P, "autoGrow">>
type Optional_autoGrow = Assert<Exact<IsOptional<P, "autoGrow">, true>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_maxRows = Assert<Has<P, "maxRows">>
type Optional_maxRows = Assert<Exact<IsOptional<P, "maxRows">, true>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Own_resize = Assert<Has<P, "resize">>
type Optional_resize = Assert<Exact<IsOptional<P, "resize">, true>>
type Own_showCount = Assert<Has<P, "showCount">>
type Optional_showCount = Assert<Exact<IsOptional<P, "showCount">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_resize = Assert<Exact<NonNullable<P["resize"]>, "both" | "none" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "filled" | "unstyled">>
