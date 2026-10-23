// GENERATED — do not hand-edit. registry-build from packages/registry/generated/ListItem.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ListItem, ListItemActions, ListItemContent, ListItemDescription, ListItemDirection, ListItemMedia, ListItemMediaType, ListItemSize, ListItemTitle, ListItemVariant } from "@atlas/ui-web/compositions/ListItem/ListItem"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ListItem>

// own props of ListItem: deleting one, flipping its optionality or changing its type fails here
type Own_as = Assert<Has<P, "as">>
type Optional_as = Assert<Exact<IsOptional<P, "as">, true>>
type Type_as = Assert<Exact<NonNullable<P["as"]>, NonNullable<"div" | "li">>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_direction = Assert<Has<P, "direction">>
type Optional_direction = Assert<Exact<IsOptional<P, "direction">, true>>
type Type_direction = Assert<Exact<NonNullable<P["direction"]>, NonNullable<ListItemDirection>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<ListItemSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<ListItemVariant>>>
type Union_as = Assert<Exact<NonNullable<P["as"]>, "div" | "li">>
type Union_direction = Assert<Exact<NonNullable<P["direction"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "muted" | "outline">>

// ListItemActions: another exported part of the module
type P_ListItemActions = React.ComponentProps<typeof ListItemActions>

// ListItemContent: another exported part of the module
type P_ListItemContent = React.ComponentProps<typeof ListItemContent>

// ListItemDescription: another exported part of the module
type P_ListItemDescription = React.ComponentProps<typeof ListItemDescription>

// ListItemMedia: another exported part of the module
type P_ListItemMedia = React.ComponentProps<typeof ListItemMedia>
type ListItemMedia_Own_children = Assert<Has<P_ListItemMedia, "children">>
type ListItemMedia_Optional_children = Assert<Exact<IsOptional<P_ListItemMedia, "children">, true>>
type ListItemMedia_Type_children = Assert<Exact<NonNullable<P_ListItemMedia["children"]>, NonNullable<React.ReactNode>>>
type ListItemMedia_Own_decorative = Assert<Has<P_ListItemMedia, "decorative">>
type ListItemMedia_Optional_decorative = Assert<Exact<IsOptional<P_ListItemMedia, "decorative">, true>>
type ListItemMedia_Type_decorative = Assert<Exact<NonNullable<P_ListItemMedia["decorative"]>, NonNullable<boolean>>>
type ListItemMedia_Own_type = Assert<Has<P_ListItemMedia, "type">>
type ListItemMedia_Optional_type = Assert<Exact<IsOptional<P_ListItemMedia, "type">, true>>
type ListItemMedia_Type_type = Assert<Exact<NonNullable<P_ListItemMedia["type"]>, NonNullable<ListItemMediaType>>>
type ListItemMedia_Union_type = Assert<Exact<NonNullable<P_ListItemMedia["type"]>, "icon" | "image" | "tile">>

// ListItemTitle: another exported part of the module
type P_ListItemTitle = React.ComponentProps<typeof ListItemTitle>

// exported types of the module
type Type_ListItemDirection = Assert<Exact<ListItemDirection, "horizontal" | "vertical">>
type Type_ListItemMediaType = Assert<Exact<ListItemMediaType, "icon" | "image" | "tile">>
type Type_ListItemSize = Assert<Exact<ListItemSize, "md" | "sm">>
type Type_ListItemVariant = Assert<Exact<ListItemVariant, "default" | "muted" | "outline">>
