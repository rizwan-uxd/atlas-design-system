// GENERATED — do not hand-edit. registry-build from packages/registry/generated/SidebarMenuRow.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { SidebarMenuRow, SidebarMenuRowChild } from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof SidebarMenuRow>

// own props of SidebarMenuRow: deleting one, flipping its optionality or changing its type fails here
type Own_active = Assert<Has<P, "active">>
type Optional_active = Assert<Exact<IsOptional<P, "active">, true>>
type Type_active = Assert<Exact<NonNullable<P["active"]>, NonNullable<boolean>>>
type Own_as = Assert<Has<P, "as">>
type Optional_as = Assert<Exact<IsOptional<P, "as">, true>>
type Type_as = Assert<Exact<NonNullable<P["as"]>, NonNullable<"button" | "a">>>
type Own_badge = Assert<Has<P, "badge">>
type Optional_badge = Assert<Exact<IsOptional<P, "badge">, true>>
type Type_badge = Assert<Exact<NonNullable<P["badge"]>, NonNullable<React.ReactNode>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_expanded = Assert<Has<P, "expanded">>
type Optional_expanded = Assert<Exact<IsOptional<P, "expanded">, true>>
type Type_expanded = Assert<Exact<NonNullable<P["expanded"]>, NonNullable<boolean>>>
type Own_hasChildren = Assert<Has<P, "hasChildren">>
type Optional_hasChildren = Assert<Exact<IsOptional<P, "hasChildren">, true>>
type Type_hasChildren = Assert<Exact<NonNullable<P["hasChildren"]>, NonNullable<boolean>>>
type Own_href = Assert<Has<P, "href">>
type Optional_href = Assert<Exact<IsOptional<P, "href">, true>>
type Type_href = Assert<Exact<NonNullable<P["href"]>, NonNullable<string>>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<React.ReactNode>>>
type Union_as = Assert<Exact<NonNullable<P["as"]>, "a" | "button">>

// SidebarMenuRowChild: another exported part of the module
type P_SidebarMenuRowChild = React.ComponentProps<typeof SidebarMenuRowChild>
type SidebarMenuRowChild_Own_active = Assert<Has<P_SidebarMenuRowChild, "active">>
type SidebarMenuRowChild_Optional_active = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "active">, true>>
type SidebarMenuRowChild_Type_active = Assert<Exact<NonNullable<P_SidebarMenuRowChild["active"]>, NonNullable<boolean>>>
type SidebarMenuRowChild_Own_as = Assert<Has<P_SidebarMenuRowChild, "as">>
type SidebarMenuRowChild_Optional_as = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "as">, true>>
type SidebarMenuRowChild_Type_as = Assert<Exact<NonNullable<P_SidebarMenuRowChild["as"]>, NonNullable<"button" | "a">>>
type SidebarMenuRowChild_Own_badge = Assert<Has<P_SidebarMenuRowChild, "badge">>
type SidebarMenuRowChild_Optional_badge = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "badge">, true>>
type SidebarMenuRowChild_Type_badge = Assert<Exact<NonNullable<P_SidebarMenuRowChild["badge"]>, NonNullable<React.ReactNode>>>
type SidebarMenuRowChild_Own_children = Assert<Has<P_SidebarMenuRowChild, "children">>
type SidebarMenuRowChild_Optional_children = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "children">, false>>
type SidebarMenuRowChild_Type_children = Assert<Exact<NonNullable<P_SidebarMenuRowChild["children"]>, NonNullable<React.ReactNode>>>
type SidebarMenuRowChild_Own_disabled = Assert<Has<P_SidebarMenuRowChild, "disabled">>
type SidebarMenuRowChild_Optional_disabled = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "disabled">, true>>
type SidebarMenuRowChild_Type_disabled = Assert<Exact<NonNullable<P_SidebarMenuRowChild["disabled"]>, NonNullable<boolean>>>
type SidebarMenuRowChild_Own_href = Assert<Has<P_SidebarMenuRowChild, "href">>
type SidebarMenuRowChild_Optional_href = Assert<Exact<IsOptional<P_SidebarMenuRowChild, "href">, true>>
type SidebarMenuRowChild_Type_href = Assert<Exact<NonNullable<P_SidebarMenuRowChild["href"]>, NonNullable<string>>>
type SidebarMenuRowChild_Union_as = Assert<Exact<NonNullable<P_SidebarMenuRowChild["as"]>, "a" | "button">>
