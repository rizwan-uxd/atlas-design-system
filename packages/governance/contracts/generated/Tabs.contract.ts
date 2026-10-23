// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Tabs.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Tabs } from "@atlas/ui-web/patterns/Tabs/Tabs"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Tabs>

// own props of Tabs: deleting one, or flipping its optionality, fails here
type Own_activationMode = Assert<Has<P, "activationMode">>
type Optional_activationMode = Assert<Exact<IsOptional<P, "activationMode">, true>>
type Own_activeTab = Assert<Has<P, "activeTab">>
type Optional_activeTab = Assert<Exact<IsOptional<P, "activeTab">, true>>
type Own_animated = Assert<Has<P, "animated">>
type Optional_animated = Assert<Exact<IsOptional<P, "animated">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_defaultTab = Assert<Has<P, "defaultTab">>
type Optional_defaultTab = Assert<Exact<IsOptional<P, "defaultTab">, true>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Own_items = Assert<Has<P, "items">>
type Optional_items = Assert<Exact<IsOptional<P, "items">, false>>
type Own_onTabChange = Assert<Has<P, "onTabChange">>
type Optional_onTabChange = Assert<Exact<IsOptional<P, "onTabChange">, true>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_activationMode = Assert<Exact<NonNullable<P["activationMode"]>, "automatic" | "manual">>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "line" | "outline" | "pill" | "segmented">>
