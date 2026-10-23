// GENERATED — do not hand-edit. registry-build from packages/registry/generated/CodeBlock.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { CodeBlock, CodeBlockSize, CodeBlockVariant } from "@atlas/ui-web/compositions/CodeBlock/CodeBlock"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof CodeBlock>

// own props of CodeBlock: deleting one, flipping its optionality or changing its type fails here
type Own_code = Assert<Has<P, "code">>
type Optional_code = Assert<Exact<IsOptional<P, "code">, false>>
type Type_code = Assert<Exact<NonNullable<P["code"]>, NonNullable<string>>>
type Own_copyLabel = Assert<Has<P, "copyLabel">>
type Optional_copyLabel = Assert<Exact<IsOptional<P, "copyLabel">, true>>
type Type_copyLabel = Assert<Exact<NonNullable<P["copyLabel"]>, NonNullable<string>>>
type Own_delay = Assert<Has<P, "delay">>
type Optional_delay = Assert<Exact<IsOptional<P, "delay">, true>>
type Type_delay = Assert<Exact<NonNullable<P["delay"]>, NonNullable<number>>>
type Own_duration = Assert<Has<P, "duration">>
type Optional_duration = Assert<Exact<IsOptional<P, "duration">, true>>
type Type_duration = Assert<Exact<NonNullable<P["duration"]>, NonNullable<number>>>
type Own_filename = Assert<Has<P, "filename">>
type Optional_filename = Assert<Exact<IsOptional<P, "filename">, true>>
type Type_filename = Assert<Exact<NonNullable<P["filename"]>, NonNullable<string>>>
type Own_language = Assert<Has<P, "language">>
type Optional_language = Assert<Exact<IsOptional<P, "language">, true>>
type Type_language = Assert<Exact<NonNullable<P["language"]>, NonNullable<string>>>
type Own_onCopy = Assert<Has<P, "onCopy">>
type Optional_onCopy = Assert<Exact<IsOptional<P, "onCopy">, true>>
type Type_onCopy = Assert<Exact<NonNullable<P["onCopy"]>, NonNullable<(code: string) => void>>>
type Own_onDone = Assert<Has<P, "onDone">>
type Optional_onDone = Assert<Exact<IsOptional<P, "onDone">, true>>
type Type_onDone = Assert<Exact<NonNullable<P["onDone"]>, NonNullable<() => void>>>
type Own_showHeader = Assert<Has<P, "showHeader">>
type Optional_showHeader = Assert<Exact<IsOptional<P, "showHeader">, true>>
type Type_showHeader = Assert<Exact<NonNullable<P["showHeader"]>, NonNullable<boolean>>>
type Own_showLineNumbers = Assert<Has<P, "showLineNumbers">>
type Optional_showLineNumbers = Assert<Exact<IsOptional<P, "showLineNumbers">, true>>
type Type_showLineNumbers = Assert<Exact<NonNullable<P["showLineNumbers"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<CodeBlockSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<CodeBlockVariant>>>
type Own_writing = Assert<Has<P, "writing">>
type Optional_writing = Assert<Exact<IsOptional<P, "writing">, true>>
type Type_writing = Assert<Exact<NonNullable<P["writing"]>, NonNullable<boolean>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "typing">>

// exported types of the module
type Type_CodeBlockSize = Assert<Exact<CodeBlockSize, "lg" | "md" | "sm">>
type Type_CodeBlockVariant = Assert<Exact<CodeBlockVariant, "default" | "typing">>
