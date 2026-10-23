// GENERATED — do not hand-edit. registry-build from packages/registry/generated/CommandMenu.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { CommandMenuContent } from "@atlas/ui-web/compositions/CommandMenu/CommandMenu"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof CommandMenuContent>

// own props of CommandMenuContent: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_closeOnSelect = Assert<Has<P, "closeOnSelect">>
type Optional_closeOnSelect = Assert<Exact<IsOptional<P, "closeOnSelect">, true>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Own_emptyText = Assert<Has<P, "emptyText">>
type Optional_emptyText = Assert<Exact<IsOptional<P, "emptyText">, true>>
type Own_filter = Assert<Has<P, "filter">>
type Optional_filter = Assert<Exact<IsOptional<P, "filter">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Own_placeholder = Assert<Has<P, "placeholder">>
type Optional_placeholder = Assert<Exact<IsOptional<P, "placeholder">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md">>
