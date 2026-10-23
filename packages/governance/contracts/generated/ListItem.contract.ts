// GENERATED — do not hand-edit. registry-build from packages/registry/generated/ListItem.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { ListItem } from "@atlas/ui-web/compositions/ListItem/ListItem"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof ListItem>

// own props of ListItem: deleting one, or flipping its optionality, fails here
type Own_as = Assert<Has<P, "as">>
type Optional_as = Assert<Exact<IsOptional<P, "as">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_direction = Assert<Has<P, "direction">>
type Optional_direction = Assert<Exact<IsOptional<P, "direction">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_as = Assert<Exact<NonNullable<P["as"]>, "div" | "li">>
type Union_direction = Assert<Exact<NonNullable<P["direction"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "muted" | "outline">>
