// GENERATED — do not hand-edit. registry-build from packages/registry/generated/DropdownMenu.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { DropdownMenu } from "@atlas/ui-web/patterns/DropdownMenu/DropdownMenu"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DropdownMenu>

// own props of DropdownMenu: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_defaultOpen = Assert<Has<P, "defaultOpen">>
type Optional_defaultOpen = Assert<Exact<IsOptional<P, "defaultOpen">, true>>
type Own_onOpenChange = Assert<Has<P, "onOpenChange">>
type Optional_onOpenChange = Assert<Exact<IsOptional<P, "onOpenChange">, true>>
type Own_open = Assert<Has<P, "open">>
type Optional_open = Assert<Exact<IsOptional<P, "open">, true>>
