// GENERATED — do not hand-edit. registry-build from packages/registry/generated/AlertDialog.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { AlertDialogContent } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof AlertDialogContent>

// own props of AlertDialogContent: deleting one, or flipping its optionality, fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_state = Assert<Has<P, "state">>
type Optional_state = Assert<Exact<IsOptional<P, "state">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_state = Assert<Exact<NonNullable<P["state"]>, "default" | "loading">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "destructive">>
