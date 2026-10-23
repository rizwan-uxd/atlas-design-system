// GENERATED — do not hand-edit. registry-build from packages/registry/generated/OtpInput.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { OtpInput } from "@atlas/ui-web/compositions/OtpInput/OtpInput"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof OtpInput>

// own props of OtpInput: deleting one, or flipping its optionality, fails here
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_length = Assert<Has<P, "length">>
type Optional_length = Assert<Exact<IsOptional<P, "length">, true>>
type Own_onComplete = Assert<Has<P, "onComplete">>
type Optional_onComplete = Assert<Exact<IsOptional<P, "onComplete">, true>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
