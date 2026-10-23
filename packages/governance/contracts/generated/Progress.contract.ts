// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Progress.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Progress } from "@atlas/ui-web/primitives/Progress/Progress"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Progress>

// own props of Progress: deleting one, flipping its optionality or changing its type fails here
type Own_aria_describedby = Assert<Has<P, "aria-describedby">>
type Optional_aria_describedby = Assert<Exact<IsOptional<P, "aria-describedby">, true>>
type Type_aria_describedby = Assert<Exact<NonNullable<P["aria-describedby"]>, NonNullable<string>>>
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Type_aria_label = Assert<Exact<NonNullable<P["aria-label"]>, NonNullable<string>>>
type Own_aria_labelledby = Assert<Has<P, "aria-labelledby">>
type Optional_aria_labelledby = Assert<Exact<IsOptional<P, "aria-labelledby">, true>>
type Type_aria_labelledby = Assert<Exact<NonNullable<P["aria-labelledby"]>, NonNullable<string>>>
type Own_aria_valuetext = Assert<Has<P, "aria-valuetext">>
type Optional_aria_valuetext = Assert<Exact<IsOptional<P, "aria-valuetext">, true>>
type Type_aria_valuetext = Assert<Exact<NonNullable<P["aria-valuetext"]>, NonNullable<string>>>
type Own_helperText = Assert<Has<P, "helperText">>
type Optional_helperText = Assert<Exact<IsOptional<P, "helperText">, true>>
type Type_helperText = Assert<Exact<NonNullable<P["helperText"]>, NonNullable<React.ReactNode>>>
type Own_indeterminate = Assert<Has<P, "indeterminate">>
type Optional_indeterminate = Assert<Exact<IsOptional<P, "indeterminate">, true>>
type Type_indeterminate = Assert<Exact<NonNullable<P["indeterminate"]>, NonNullable<boolean>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<React.ReactNode>>>
type Own_max = Assert<Has<P, "max">>
type Optional_max = Assert<Exact<IsOptional<P, "max">, true>>
type Type_max = Assert<Exact<NonNullable<P["max"]>, NonNullable<number>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<number>>>
type Own_valueLabel = Assert<Has<P, "valueLabel">>
type Optional_valueLabel = Assert<Exact<IsOptional<P, "valueLabel">, true>>
type Type_valueLabel = Assert<Exact<NonNullable<P["valueLabel"]>, NonNullable<React.ReactNode>>>

// Progress: absent by design (packages/registry/contract-props.json)
/** role is fixed (progressbar). */
type Progress_Absent_role = Assert<Exact<Has<P, "role">, false>>
