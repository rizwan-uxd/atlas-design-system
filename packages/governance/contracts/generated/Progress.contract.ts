// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Progress.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Progress } from "@atlas/ui-web/primitives/Progress/Progress"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Progress>

// own props of Progress: deleting one, or flipping its optionality, fails here
type Own_aria_describedby = Assert<Has<P, "aria-describedby">>
type Optional_aria_describedby = Assert<Exact<IsOptional<P, "aria-describedby">, true>>
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Own_aria_labelledby = Assert<Has<P, "aria-labelledby">>
type Optional_aria_labelledby = Assert<Exact<IsOptional<P, "aria-labelledby">, true>>
type Own_aria_valuetext = Assert<Has<P, "aria-valuetext">>
type Optional_aria_valuetext = Assert<Exact<IsOptional<P, "aria-valuetext">, true>>
type Own_helperText = Assert<Has<P, "helperText">>
type Optional_helperText = Assert<Exact<IsOptional<P, "helperText">, true>>
type Own_indeterminate = Assert<Has<P, "indeterminate">>
type Optional_indeterminate = Assert<Exact<IsOptional<P, "indeterminate">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Own_max = Assert<Has<P, "max">>
type Optional_max = Assert<Exact<IsOptional<P, "max">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Own_valueLabel = Assert<Has<P, "valueLabel">>
type Optional_valueLabel = Assert<Exact<IsOptional<P, "valueLabel">, true>>
