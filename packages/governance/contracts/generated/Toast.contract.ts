// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Toast.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Toast } from "@atlas/ui-web/compositions/Toast/Toast"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Toast>

// own props of Toast: deleting one, or flipping its optionality, fails here
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "danger" | "default" | "success">>
