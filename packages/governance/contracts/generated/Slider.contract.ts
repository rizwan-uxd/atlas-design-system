// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Slider.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Slider } from "@atlas/ui-web/primitives/Slider/Slider"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Slider>

// own props of Slider: deleting one, or flipping its optionality, fails here
type Own_aria_describedby = Assert<Has<P, "aria-describedby">>
type Optional_aria_describedby = Assert<Exact<IsOptional<P, "aria-describedby">, true>>
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Own_aria_labelledby = Assert<Has<P, "aria-labelledby">>
type Optional_aria_labelledby = Assert<Exact<IsOptional<P, "aria-labelledby">, true>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_getAriaValueText = Assert<Has<P, "getAriaValueText">>
type Optional_getAriaValueText = Assert<Exact<IsOptional<P, "getAriaValueText">, true>>
type Own_helperText = Assert<Has<P, "helperText">>
type Optional_helperText = Assert<Exact<IsOptional<P, "helperText">, true>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Own_leading = Assert<Has<P, "leading">>
type Optional_leading = Assert<Exact<IsOptional<P, "leading">, true>>
type Own_max = Assert<Has<P, "max">>
type Optional_max = Assert<Exact<IsOptional<P, "max">, true>>
type Own_min = Assert<Has<P, "min">>
type Optional_min = Assert<Exact<IsOptional<P, "min">, true>>
type Own_name = Assert<Has<P, "name">>
type Optional_name = Assert<Exact<IsOptional<P, "name">, true>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Own_range = Assert<Has<P, "range">>
type Optional_range = Assert<Exact<IsOptional<P, "range">, true>>
type Own_step = Assert<Has<P, "step">>
type Optional_step = Assert<Exact<IsOptional<P, "step">, true>>
type Own_trailing = Assert<Has<P, "trailing">>
type Optional_trailing = Assert<Exact<IsOptional<P, "trailing">, true>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Own_valueLabel = Assert<Has<P, "valueLabel">>
type Optional_valueLabel = Assert<Exact<IsOptional<P, "valueLabel">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
