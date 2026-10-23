// GENERATED — do not hand-edit. registry-build from packages/registry/generated/CodeBlock.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { CodeBlock } from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof CodeBlock>

// own props of CodeBlock: deleting one, or flipping its optionality, fails here
type Own_code = Assert<Has<P, "code">>
type Optional_code = Assert<Exact<IsOptional<P, "code">, false>>
type Own_copyLabel = Assert<Has<P, "copyLabel">>
type Optional_copyLabel = Assert<Exact<IsOptional<P, "copyLabel">, true>>
type Own_delay = Assert<Has<P, "delay">>
type Optional_delay = Assert<Exact<IsOptional<P, "delay">, true>>
type Own_duration = Assert<Has<P, "duration">>
type Optional_duration = Assert<Exact<IsOptional<P, "duration">, true>>
type Own_filename = Assert<Has<P, "filename">>
type Optional_filename = Assert<Exact<IsOptional<P, "filename">, true>>
type Own_language = Assert<Has<P, "language">>
type Optional_language = Assert<Exact<IsOptional<P, "language">, true>>
type Own_onCopy = Assert<Has<P, "onCopy">>
type Optional_onCopy = Assert<Exact<IsOptional<P, "onCopy">, true>>
type Own_onDone = Assert<Has<P, "onDone">>
type Optional_onDone = Assert<Exact<IsOptional<P, "onDone">, true>>
type Own_showHeader = Assert<Has<P, "showHeader">>
type Optional_showHeader = Assert<Exact<IsOptional<P, "showHeader">, true>>
type Own_showLineNumbers = Assert<Has<P, "showLineNumbers">>
type Optional_showLineNumbers = Assert<Exact<IsOptional<P, "showLineNumbers">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Own_writing = Assert<Has<P, "writing">>
type Optional_writing = Assert<Exact<IsOptional<P, "writing">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "typing">>
