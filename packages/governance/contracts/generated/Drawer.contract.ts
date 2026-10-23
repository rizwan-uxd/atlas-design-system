// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Drawer.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { DrawerContent } from "@atlas/ui-web/compositions/Drawer/Drawer"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DrawerContent>

// own props of DrawerContent: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_closeOnEscape = Assert<Has<P, "closeOnEscape">>
type Optional_closeOnEscape = Assert<Exact<IsOptional<P, "closeOnEscape">, true>>
type Own_closeOnOverlayClick = Assert<Has<P, "closeOnOverlayClick">>
type Optional_closeOnOverlayClick = Assert<Exact<IsOptional<P, "closeOnOverlayClick">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_side = Assert<Has<P, "side">>
type Optional_side = Assert<Exact<IsOptional<P, "side">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_side = Assert<Exact<NonNullable<P["side"]>, "end" | "start">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "full" | "lg" | "md" | "sm" | "xl">>
