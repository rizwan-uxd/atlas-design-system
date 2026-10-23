// GENERATED — do not hand-edit. registry-build from packages/registry/generated/DatePicker.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { DatePickerTrigger } from "@atlas/ui-web/compositions/DatePicker/DatePicker"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DatePickerTrigger>

// own props of DatePickerTrigger: deleting one, or flipping its optionality, fails here
type Own_formatDate = Assert<Has<P, "formatDate">>
type Optional_formatDate = Assert<Exact<IsOptional<P, "formatDate">, true>>
type Own_formatRange = Assert<Has<P, "formatRange">>
type Optional_formatRange = Assert<Exact<IsOptional<P, "formatRange">, true>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Own_placeholder = Assert<Has<P, "placeholder">>
type Optional_placeholder = Assert<Exact<IsOptional<P, "placeholder">, true>>
