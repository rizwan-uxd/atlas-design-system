// GENERATED — do not hand-edit. registry-build from packages/registry/generated/NavBar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { NavBar } from "@atlas/ui-web/layouts/NavBar/NavBar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof NavBar>

// own props of NavBar: deleting one, or flipping its optionality, fails here
type Own_actions = Assert<Has<P, "actions">>
type Optional_actions = Assert<Exact<IsOptional<P, "actions">, true>>
type Own_brand = Assert<Has<P, "brand">>
type Optional_brand = Assert<Exact<IsOptional<P, "brand">, true>>
type Own_brandHref = Assert<Has<P, "brandHref">>
type Optional_brandHref = Assert<Exact<IsOptional<P, "brandHref">, true>>
type Own_breadcrumb = Assert<Has<P, "breadcrumb">>
type Optional_breadcrumb = Assert<Exact<IsOptional<P, "breadcrumb">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_hideOnScroll = Assert<Has<P, "hideOnScroll">>
type Optional_hideOnScroll = Assert<Exact<IsOptional<P, "hideOnScroll">, true>>
type Own_links = Assert<Has<P, "links">>
type Optional_links = Assert<Exact<IsOptional<P, "links">, true>>
type Own_search = Assert<Has<P, "search">>
type Optional_search = Assert<Exact<IsOptional<P, "search">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_style = Assert<Has<P, "style">>
type Optional_style = Assert<Exact<IsOptional<P, "style">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "bordered" | "default" | "floating" | "transparent">>
