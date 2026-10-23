// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Avatar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Avatar, AvatarGroup, AvatarGroupVariant, AvatarShape, AvatarSize } from "@atlas/ui-web/primitives/Avatar/Avatar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Avatar>

// own props of Avatar: deleting one, flipping its optionality or changing its type fails here
type Own_alt = Assert<Has<P, "alt">>
type Optional_alt = Assert<Exact<IsOptional<P, "alt">, true>>
type Type_alt = Assert<Exact<NonNullable<P["alt"]>, NonNullable<string>>>
type Own_badgeIcon = Assert<Has<P, "badgeIcon">>
type Optional_badgeIcon = Assert<Exact<IsOptional<P, "badgeIcon">, true>>
type Type_badgeIcon = Assert<Exact<NonNullable<P["badgeIcon"]>, NonNullable<React.ReactNode>>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<React.ReactNode>>>
type Own_initials = Assert<Has<P, "initials">>
type Optional_initials = Assert<Exact<IsOptional<P, "initials">, true>>
type Type_initials = Assert<Exact<NonNullable<P["initials"]>, NonNullable<string>>>
type Own_shape = Assert<Has<P, "shape">>
type Optional_shape = Assert<Exact<IsOptional<P, "shape">, true>>
type Type_shape = Assert<Exact<NonNullable<P["shape"]>, NonNullable<AvatarShape>>>
type Own_showBadgeIcon = Assert<Has<P, "showBadgeIcon">>
type Optional_showBadgeIcon = Assert<Exact<IsOptional<P, "showBadgeIcon">, true>>
type Type_showBadgeIcon = Assert<Exact<NonNullable<P["showBadgeIcon"]>, NonNullable<boolean>>>
type Own_showStatus = Assert<Has<P, "showStatus">>
type Optional_showStatus = Assert<Exact<IsOptional<P, "showStatus">, true>>
type Type_showStatus = Assert<Exact<NonNullable<P["showStatus"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<AvatarSize>>>
type Own_src = Assert<Has<P, "src">>
type Optional_src = Assert<Exact<IsOptional<P, "src">, true>>
type Type_src = Assert<Exact<NonNullable<P["src"]>, NonNullable<string>>>
type Own_statusIndicator = Assert<Has<P, "statusIndicator">>
type Optional_statusIndicator = Assert<Exact<IsOptional<P, "statusIndicator">, true>>
type Type_statusIndicator = Assert<Exact<NonNullable<P["statusIndicator"]>, NonNullable<React.ReactNode>>>
type Own_statusLabel = Assert<Has<P, "statusLabel">>
type Optional_statusLabel = Assert<Exact<IsOptional<P, "statusLabel">, true>>
type Type_statusLabel = Assert<Exact<NonNullable<P["statusLabel"]>, NonNullable<string>>>
type Union_shape = Assert<Exact<NonNullable<P["shape"]>, "circle" | "squircle">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xl" | "xs">>

// AvatarGroup: another exported part of the module
type P_AvatarGroup = React.ComponentProps<typeof AvatarGroup>
type AvatarGroup_Own_addLabel = Assert<Has<P_AvatarGroup, "addLabel">>
type AvatarGroup_Optional_addLabel = Assert<Exact<IsOptional<P_AvatarGroup, "addLabel">, true>>
type AvatarGroup_Type_addLabel = Assert<Exact<NonNullable<P_AvatarGroup["addLabel"]>, NonNullable<string>>>
type AvatarGroup_Own_children = Assert<Has<P_AvatarGroup, "children">>
type AvatarGroup_Optional_children = Assert<Exact<IsOptional<P_AvatarGroup, "children">, false>>
type AvatarGroup_Type_children = Assert<Exact<NonNullable<P_AvatarGroup["children"]>, NonNullable<React.ReactNode>>>
type AvatarGroup_Own_onAdd = Assert<Has<P_AvatarGroup, "onAdd">>
type AvatarGroup_Optional_onAdd = Assert<Exact<IsOptional<P_AvatarGroup, "onAdd">, true>>
type AvatarGroup_Type_onAdd = Assert<Exact<NonNullable<P_AvatarGroup["onAdd"]>, NonNullable<() => void>>>
type AvatarGroup_Own_shape = Assert<Has<P_AvatarGroup, "shape">>
type AvatarGroup_Optional_shape = Assert<Exact<IsOptional<P_AvatarGroup, "shape">, true>>
type AvatarGroup_Type_shape = Assert<Exact<NonNullable<P_AvatarGroup["shape"]>, NonNullable<AvatarShape>>>
type AvatarGroup_Own_showAdd = Assert<Has<P_AvatarGroup, "showAdd">>
type AvatarGroup_Optional_showAdd = Assert<Exact<IsOptional<P_AvatarGroup, "showAdd">, true>>
type AvatarGroup_Type_showAdd = Assert<Exact<NonNullable<P_AvatarGroup["showAdd"]>, NonNullable<boolean>>>
type AvatarGroup_Own_size = Assert<Has<P_AvatarGroup, "size">>
type AvatarGroup_Optional_size = Assert<Exact<IsOptional<P_AvatarGroup, "size">, true>>
type AvatarGroup_Type_size = Assert<Exact<NonNullable<P_AvatarGroup["size"]>, NonNullable<AvatarSize>>>
type AvatarGroup_Own_variant = Assert<Has<P_AvatarGroup, "variant">>
type AvatarGroup_Optional_variant = Assert<Exact<IsOptional<P_AvatarGroup, "variant">, true>>
type AvatarGroup_Type_variant = Assert<Exact<NonNullable<P_AvatarGroup["variant"]>, NonNullable<AvatarGroupVariant>>>
type AvatarGroup_Union_shape = Assert<Exact<NonNullable<P_AvatarGroup["shape"]>, "circle" | "squircle">>
type AvatarGroup_Union_size = Assert<Exact<NonNullable<P_AvatarGroup["size"]>, "lg" | "md" | "sm" | "xl" | "xs">>
type AvatarGroup_Union_variant = Assert<Exact<NonNullable<P_AvatarGroup["variant"]>, "animated" | "default">>

// exported types of the module
type Type_AvatarGroupVariant = Assert<Exact<AvatarGroupVariant, "animated" | "default">>
type Type_AvatarShape = Assert<Exact<AvatarShape, "circle" | "squircle">>
type Type_AvatarSize = Assert<Exact<AvatarSize, "lg" | "md" | "sm" | "xl" | "xs">>
