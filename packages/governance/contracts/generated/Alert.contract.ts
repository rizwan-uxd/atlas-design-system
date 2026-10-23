// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Alert.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Alert } from "@atlas/ui-web/compositions/Alert/Alert"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Alert>

// own props of Alert: deleting one, or flipping its optionality, fails here
type Own_actions = Assert<Has<P, "actions">>
type Optional_actions = Assert<Exact<IsOptional<P, "actions">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_description = Assert<Has<P, "description">>
type Optional_description = Assert<Exact<IsOptional<P, "description">, true>>
type Own_dismissible = Assert<Has<P, "dismissible">>
type Optional_dismissible = Assert<Exact<IsOptional<P, "dismissible">, true>>
type Own_hideIcon = Assert<Has<P, "hideIcon">>
type Optional_hideIcon = Assert<Exact<IsOptional<P, "hideIcon">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_onDismiss = Assert<Has<P, "onDismiss">>
type Optional_onDismiss = Assert<Exact<IsOptional<P, "onDismiss">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_title = Assert<Has<P, "title">>
type Optional_title = Assert<Exact<IsOptional<P, "title">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "danger" | "info" | "neutral" | "success" | "warning">>

// registry Alert: its protocolProps and event handlers exist
type Registry_Alert_variant = Assert<Has<P, "variant">>
type Registry_Alert_size = Assert<Has<P, "size">>
type Registry_Alert_dismissible = Assert<Has<P, "dismissible">>
type Registry_Alert_hideIcon = Assert<Has<P, "hideIcon">>
type Registry_Alert_onDismiss = Assert<Has<P, "onDismiss">>
