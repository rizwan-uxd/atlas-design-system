// GENERATED — do not hand-edit. registry-build from packages/registry/generated/PasswordInput.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { PasswordInput } from "@atlas/ui-web/compositions/PasswordInput/PasswordInput"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof PasswordInput>

// own props of PasswordInput: deleting one, or flipping its optionality, fails here
type Own_defaultVisible = Assert<Has<P, "defaultVisible">>
type Optional_defaultVisible = Assert<Exact<IsOptional<P, "defaultVisible">, true>>
type Own_onVisibleChange = Assert<Has<P, "onVisibleChange">>
type Optional_onVisibleChange = Assert<Exact<IsOptional<P, "onVisibleChange">, true>>
type Own_showStrength = Assert<Has<P, "showStrength">>
type Optional_showStrength = Assert<Exact<IsOptional<P, "showStrength">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
