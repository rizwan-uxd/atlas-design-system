// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Slider.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Slider, SliderOrientation } from "@atlas/ui-web/primitives/Slider/Slider"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Slider>

// own props of Slider: deleting one, flipping its optionality or changing its type fails here
type Own_aria_describedby = Assert<Has<P, "aria-describedby">>
type Optional_aria_describedby = Assert<Exact<IsOptional<P, "aria-describedby">, true>>
type Type_aria_describedby = Assert<Exact<NonNullable<P["aria-describedby"]>, NonNullable<string>>>
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Type_aria_label = Assert<Exact<NonNullable<P["aria-label"]>, NonNullable<string>>>
type Own_aria_labelledby = Assert<Has<P, "aria-labelledby">>
type Optional_aria_labelledby = Assert<Exact<IsOptional<P, "aria-labelledby">, true>>
type Type_aria_labelledby = Assert<Exact<NonNullable<P["aria-labelledby"]>, NonNullable<string>>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Type_defaultValue = Assert<Exact<NonNullable<P["defaultValue"]>, NonNullable<number | [number, number]>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_getAriaValueText = Assert<Has<P, "getAriaValueText">>
type Optional_getAriaValueText = Assert<Exact<IsOptional<P, "getAriaValueText">, true>>
type Type_getAriaValueText = Assert<Exact<NonNullable<P["getAriaValueText"]>, NonNullable<(value: number) => string>>>
type Own_helperText = Assert<Has<P, "helperText">>
type Optional_helperText = Assert<Exact<IsOptional<P, "helperText">, true>>
type Type_helperText = Assert<Exact<NonNullable<P["helperText"]>, NonNullable<React.ReactNode>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<React.ReactNode>>>
type Own_leading = Assert<Has<P, "leading">>
type Optional_leading = Assert<Exact<IsOptional<P, "leading">, true>>
type Type_leading = Assert<Exact<NonNullable<P["leading"]>, NonNullable<React.ReactNode>>>
type Own_max = Assert<Has<P, "max">>
type Optional_max = Assert<Exact<IsOptional<P, "max">, true>>
type Type_max = Assert<Exact<NonNullable<P["max"]>, NonNullable<number>>>
type Own_min = Assert<Has<P, "min">>
type Optional_min = Assert<Exact<IsOptional<P, "min">, true>>
type Type_min = Assert<Exact<NonNullable<P["min"]>, NonNullable<number>>>
type Own_name = Assert<Has<P, "name">>
type Optional_name = Assert<Exact<IsOptional<P, "name">, true>>
type Type_name = Assert<Exact<NonNullable<P["name"]>, NonNullable<string>>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Type_onValueChange = Assert<Exact<NonNullable<P["onValueChange"]>, NonNullable<(value: number | [number, number]) => void>>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Type_orientation = Assert<Exact<NonNullable<P["orientation"]>, NonNullable<SliderOrientation>>>
type Own_range = Assert<Has<P, "range">>
type Optional_range = Assert<Exact<IsOptional<P, "range">, true>>
type Type_range = Assert<Exact<NonNullable<P["range"]>, NonNullable<boolean>>>
type Own_step = Assert<Has<P, "step">>
type Optional_step = Assert<Exact<IsOptional<P, "step">, true>>
type Type_step = Assert<Exact<NonNullable<P["step"]>, NonNullable<number>>>
type Own_trailing = Assert<Has<P, "trailing">>
type Optional_trailing = Assert<Exact<IsOptional<P, "trailing">, true>>
type Type_trailing = Assert<Exact<NonNullable<P["trailing"]>, NonNullable<React.ReactNode>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<number | [number, number]>>>
type Own_valueLabel = Assert<Has<P, "valueLabel">>
type Optional_valueLabel = Assert<Exact<IsOptional<P, "valueLabel">, true>>
type Type_valueLabel = Assert<Exact<NonNullable<P["valueLabel"]>, NonNullable<React.ReactNode>>>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>

// exported types of the module
type Type_SliderOrientation = Assert<Exact<SliderOrientation, "horizontal" | "vertical">>
