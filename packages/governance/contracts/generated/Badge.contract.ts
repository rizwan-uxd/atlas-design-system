// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Badge.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Badge, BadgeAppearance, BadgeSize, BadgeVariant } from "@atlas/ui-web/primitives/Badge/Badge"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Badge>

// own props of Badge: deleting one, flipping its optionality or changing its type fails here
type Own_appearance = Assert<Has<P, "appearance">>
type Optional_appearance = Assert<Exact<IsOptional<P, "appearance">, true>>
type Type_appearance = Assert<Exact<NonNullable<P["appearance"]>, NonNullable<BadgeAppearance>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_dot = Assert<Has<P, "dot">>
type Optional_dot = Assert<Exact<IsOptional<P, "dot">, true>>
type Type_dot = Assert<Exact<NonNullable<P["dot"]>, NonNullable<boolean>>>
type Own_leadingIcon = Assert<Has<P, "leadingIcon">>
type Optional_leadingIcon = Assert<Exact<IsOptional<P, "leadingIcon">, true>>
type Type_leadingIcon = Assert<Exact<NonNullable<P["leadingIcon"]>, NonNullable<React.ReactNode>>>
type Own_onClick = Assert<Has<P, "onClick">>
type Optional_onClick = Assert<Exact<IsOptional<P, "onClick">, true>>
type Type_onClick = Assert<Exact<NonNullable<P["onClick"]>, NonNullable<() => void>>>
type Own_onRemove = Assert<Has<P, "onRemove">>
type Optional_onRemove = Assert<Exact<IsOptional<P, "onRemove">, true>>
type Type_onRemove = Assert<Exact<NonNullable<P["onRemove"]>, NonNullable<() => void>>>
type Own_removable = Assert<Has<P, "removable">>
type Optional_removable = Assert<Exact<IsOptional<P, "removable">, true>>
type Type_removable = Assert<Exact<NonNullable<P["removable"]>, NonNullable<boolean>>>
type Own_removeLabel = Assert<Has<P, "removeLabel">>
type Optional_removeLabel = Assert<Exact<IsOptional<P, "removeLabel">, true>>
type Type_removeLabel = Assert<Exact<NonNullable<P["removeLabel"]>, NonNullable<string>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<BadgeSize>>>
type Own_square = Assert<Has<P, "square">>
type Optional_square = Assert<Exact<IsOptional<P, "square">, true>>
type Type_square = Assert<Exact<NonNullable<P["square"]>, NonNullable<boolean>>>
type Own_trailingIcon = Assert<Has<P, "trailingIcon">>
type Optional_trailingIcon = Assert<Exact<IsOptional<P, "trailingIcon">, true>>
type Type_trailingIcon = Assert<Exact<NonNullable<P["trailingIcon"]>, NonNullable<React.ReactNode>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<BadgeVariant>>>
type Union_appearance = Assert<Exact<NonNullable<P["appearance"]>, "default" | "outline">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "danger" | "info" | "neutral" | "primary" | "success" | "warning">>

// exported types of the module
type Type_BadgeAppearance = Assert<Exact<BadgeAppearance, "default" | "outline">>
type Type_BadgeSize = Assert<Exact<BadgeSize, "lg" | "md" | "sm">>
type Type_BadgeVariant = Assert<Exact<BadgeVariant, "danger" | "info" | "neutral" | "primary" | "success" | "warning">>
