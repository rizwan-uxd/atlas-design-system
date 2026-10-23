// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Avatar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Avatar } from "@atlas/ui-web/primitives/Avatar/Avatar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Avatar>

// own props of Avatar: deleting one, or flipping its optionality, fails here
type Own_alt = Assert<Has<P, "alt">>
type Optional_alt = Assert<Exact<IsOptional<P, "alt">, true>>
type Own_badgeIcon = Assert<Has<P, "badgeIcon">>
type Optional_badgeIcon = Assert<Exact<IsOptional<P, "badgeIcon">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_initials = Assert<Has<P, "initials">>
type Optional_initials = Assert<Exact<IsOptional<P, "initials">, true>>
type Own_shape = Assert<Has<P, "shape">>
type Optional_shape = Assert<Exact<IsOptional<P, "shape">, true>>
type Own_showBadgeIcon = Assert<Has<P, "showBadgeIcon">>
type Optional_showBadgeIcon = Assert<Exact<IsOptional<P, "showBadgeIcon">, true>>
type Own_showStatus = Assert<Has<P, "showStatus">>
type Optional_showStatus = Assert<Exact<IsOptional<P, "showStatus">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_src = Assert<Has<P, "src">>
type Optional_src = Assert<Exact<IsOptional<P, "src">, true>>
type Own_statusIndicator = Assert<Has<P, "statusIndicator">>
type Optional_statusIndicator = Assert<Exact<IsOptional<P, "statusIndicator">, true>>
type Own_statusLabel = Assert<Has<P, "statusLabel">>
type Optional_statusLabel = Assert<Exact<IsOptional<P, "statusLabel">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_shape = Assert<Exact<NonNullable<P["shape"]>, "circle" | "squircle">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xl" | "xs">>
