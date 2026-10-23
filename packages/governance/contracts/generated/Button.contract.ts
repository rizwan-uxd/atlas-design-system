// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Button.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Button } from "@atlas/ui-web/primitives/Button/Button"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Button>

// own props of Button: deleting one, or flipping its optionality, fails here
type Own_asChild = Assert<Has<P, "asChild">>
type Optional_asChild = Assert<Exact<IsOptional<P, "asChild">, true>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_iconOnly = Assert<Has<P, "iconOnly">>
type Optional_iconOnly = Assert<Exact<IsOptional<P, "iconOnly">, true>>
type Own_leadingIcon = Assert<Has<P, "leadingIcon">>
type Optional_leadingIcon = Assert<Exact<IsOptional<P, "leadingIcon">, true>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_trailingIcon = Assert<Has<P, "trailingIcon">>
type Optional_trailingIcon = Assert<Exact<IsOptional<P, "trailingIcon">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xs">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "destructive" | "ghost" | "link" | "outline" | "primary" | "secondary">>

// registry Button: its protocolProps and event handlers exist
type Registry_Button_variant = Assert<Has<P, "variant">>
type Registry_Button_size = Assert<Has<P, "size">>
type Registry_Button_iconOnly = Assert<Has<P, "iconOnly">>
type Registry_Button_loading = Assert<Has<P, "loading">>
type Registry_Button_disabled = Assert<Has<P, "disabled">>
type Registry_Button_onClick = Assert<Has<P, "onClick">>
