// GENERATED — do not hand-edit. registry-build from packages/registry/generated/SidebarMenuRow.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { SidebarMenuRow } from "@atlas/ui-web/primitives/SidebarMenuRow/SidebarMenuRow"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof SidebarMenuRow>

// own props of SidebarMenuRow: deleting one, or flipping its optionality, fails here
type Own_active = Assert<Has<P, "active">>
type Optional_active = Assert<Exact<IsOptional<P, "active">, true>>
type Own_as = Assert<Has<P, "as">>
type Optional_as = Assert<Exact<IsOptional<P, "as">, true>>
type Own_badge = Assert<Has<P, "badge">>
type Optional_badge = Assert<Exact<IsOptional<P, "badge">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_expanded = Assert<Has<P, "expanded">>
type Optional_expanded = Assert<Exact<IsOptional<P, "expanded">, true>>
type Own_hasChildren = Assert<Has<P, "hasChildren">>
type Optional_hasChildren = Assert<Exact<IsOptional<P, "hasChildren">, true>>
type Own_href = Assert<Has<P, "href">>
type Optional_href = Assert<Exact<IsOptional<P, "href">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_as = Assert<Exact<NonNullable<P["as"]>, "a" | "button">>
