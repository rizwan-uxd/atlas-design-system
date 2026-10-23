// GENERATED — do not hand-edit. registry-build from packages/registry/generated/DatePicker.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { DatePicker, DatePickerContent, DatePickerInput, DatePickerMode, DatePickerNaturalInput, DatePickerRange, DatePickerSide, DatePickerTrigger } from "@atlas/ui-web/compositions/DatePicker/DatePicker"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DatePickerTrigger>

// own props of DatePickerTrigger: deleting one, flipping its optionality or changing its type fails here
type Own_formatDate = Assert<Has<P, "formatDate">>
type Optional_formatDate = Assert<Exact<IsOptional<P, "formatDate">, true>>
type Type_formatDate = Assert<Exact<NonNullable<P["formatDate"]>, NonNullable<(date: Date) => string>>>
type Own_formatRange = Assert<Has<P, "formatRange">>
type Optional_formatRange = Assert<Exact<IsOptional<P, "formatRange">, true>>
type Type_formatRange = Assert<Exact<NonNullable<P["formatRange"]>, NonNullable<(range: DatePickerRange) => string>>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<boolean | React.ReactNode>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_placeholder = Assert<Has<P, "placeholder">>
type Optional_placeholder = Assert<Exact<IsOptional<P, "placeholder">, true>>
type Type_placeholder = Assert<Exact<NonNullable<P["placeholder"]>, NonNullable<string>>>

// DatePicker: another exported part of the module
type P_DatePicker = React.ComponentProps<typeof DatePicker>
type DatePicker_Own_children = Assert<Has<P_DatePicker, "children">>
type DatePicker_Optional_children = Assert<Exact<IsOptional<P_DatePicker, "children">, true>>
type DatePicker_Type_children = Assert<Exact<NonNullable<P_DatePicker["children"]>, NonNullable<React.ReactNode>>>
type DatePicker_Own_defaultValue = Assert<Has<P_DatePicker, "defaultValue">>
type DatePicker_Optional_defaultValue = Assert<Exact<IsOptional<P_DatePicker, "defaultValue">, true>>
type DatePicker_Own_disabled = Assert<Has<P_DatePicker, "disabled">>
type DatePicker_Optional_disabled = Assert<Exact<IsOptional<P_DatePicker, "disabled">, true>>
type DatePicker_Type_disabled = Assert<Exact<NonNullable<P_DatePicker["disabled"]>, NonNullable<boolean>>>
type DatePicker_Own_max = Assert<Has<P_DatePicker, "max">>
type DatePicker_Optional_max = Assert<Exact<IsOptional<P_DatePicker, "max">, true>>
type DatePicker_Type_max = Assert<Exact<NonNullable<P_DatePicker["max"]>, NonNullable<Date>>>
type DatePicker_Own_min = Assert<Has<P_DatePicker, "min">>
type DatePicker_Optional_min = Assert<Exact<IsOptional<P_DatePicker, "min">, true>>
type DatePicker_Type_min = Assert<Exact<NonNullable<P_DatePicker["min"]>, NonNullable<Date>>>
type DatePicker_Own_mode = Assert<Has<P_DatePicker, "mode">>
type DatePicker_Optional_mode = Assert<Exact<IsOptional<P_DatePicker, "mode">, true>>
type DatePicker_Own_name = Assert<Has<P_DatePicker, "name">>
type DatePicker_Optional_name = Assert<Exact<IsOptional<P_DatePicker, "name">, true>>
type DatePicker_Type_name = Assert<Exact<NonNullable<P_DatePicker["name"]>, NonNullable<string>>>
type DatePicker_Own_onValueChange = Assert<Has<P_DatePicker, "onValueChange">>
type DatePicker_Optional_onValueChange = Assert<Exact<IsOptional<P_DatePicker, "onValueChange">, true>>
type DatePicker_Own_required = Assert<Has<P_DatePicker, "required">>
type DatePicker_Optional_required = Assert<Exact<IsOptional<P_DatePicker, "required">, true>>
type DatePicker_Type_required = Assert<Exact<NonNullable<P_DatePicker["required"]>, NonNullable<boolean>>>
type DatePicker_Own_value = Assert<Has<P_DatePicker, "value">>
type DatePicker_Optional_value = Assert<Exact<IsOptional<P_DatePicker, "value">, true>>
type DatePicker_Union_mode = Assert<Exact<NonNullable<P_DatePicker["mode"]>, "range" | "single">>

// DatePicker with mode "range"
type P_DatePicker_range = Extract<P_DatePicker, { mode?: "range" }>
type DatePicker_range_Own_children = Assert<Has<P_DatePicker_range, "children">>
type DatePicker_range_Optional_children = Assert<Exact<IsOptional<P_DatePicker_range, "children">, true>>
type DatePicker_range_Type_children = Assert<Exact<NonNullable<P_DatePicker_range["children"]>, NonNullable<React.ReactNode>>>
type DatePicker_range_Own_defaultValue = Assert<Has<P_DatePicker_range, "defaultValue">>
type DatePicker_range_Optional_defaultValue = Assert<Exact<IsOptional<P_DatePicker_range, "defaultValue">, true>>
type DatePicker_range_Type_defaultValue = Assert<Exact<NonNullable<P_DatePicker_range["defaultValue"]>, NonNullable<DatePickerRange>>>
type DatePicker_range_Own_disabled = Assert<Has<P_DatePicker_range, "disabled">>
type DatePicker_range_Optional_disabled = Assert<Exact<IsOptional<P_DatePicker_range, "disabled">, true>>
type DatePicker_range_Type_disabled = Assert<Exact<NonNullable<P_DatePicker_range["disabled"]>, NonNullable<boolean>>>
type DatePicker_range_Own_max = Assert<Has<P_DatePicker_range, "max">>
type DatePicker_range_Optional_max = Assert<Exact<IsOptional<P_DatePicker_range, "max">, true>>
type DatePicker_range_Type_max = Assert<Exact<NonNullable<P_DatePicker_range["max"]>, NonNullable<Date>>>
type DatePicker_range_Own_min = Assert<Has<P_DatePicker_range, "min">>
type DatePicker_range_Optional_min = Assert<Exact<IsOptional<P_DatePicker_range, "min">, true>>
type DatePicker_range_Type_min = Assert<Exact<NonNullable<P_DatePicker_range["min"]>, NonNullable<Date>>>
type DatePicker_range_Own_mode = Assert<Has<P_DatePicker_range, "mode">>
type DatePicker_range_Optional_mode = Assert<Exact<IsOptional<P_DatePicker_range, "mode">, false>>
type DatePicker_range_Type_mode = Assert<Exact<NonNullable<P_DatePicker_range["mode"]>, NonNullable<"range">>>
type DatePicker_range_Own_name = Assert<Has<P_DatePicker_range, "name">>
type DatePicker_range_Optional_name = Assert<Exact<IsOptional<P_DatePicker_range, "name">, true>>
type DatePicker_range_Type_name = Assert<Exact<NonNullable<P_DatePicker_range["name"]>, NonNullable<string>>>
type DatePicker_range_Own_onValueChange = Assert<Has<P_DatePicker_range, "onValueChange">>
type DatePicker_range_Optional_onValueChange = Assert<Exact<IsOptional<P_DatePicker_range, "onValueChange">, true>>
type DatePicker_range_Type_onValueChange = Assert<Exact<NonNullable<P_DatePicker_range["onValueChange"]>, NonNullable<(range: DatePickerRange) => void>>>
type DatePicker_range_Own_required = Assert<Has<P_DatePicker_range, "required">>
type DatePicker_range_Optional_required = Assert<Exact<IsOptional<P_DatePicker_range, "required">, true>>
type DatePicker_range_Type_required = Assert<Exact<NonNullable<P_DatePicker_range["required"]>, NonNullable<boolean>>>
type DatePicker_range_Own_value = Assert<Has<P_DatePicker_range, "value">>
type DatePicker_range_Optional_value = Assert<Exact<IsOptional<P_DatePicker_range, "value">, true>>
type DatePicker_range_Type_value = Assert<Exact<NonNullable<P_DatePicker_range["value"]>, NonNullable<DatePickerRange>>>

// DatePicker with mode "single"
type P_DatePicker_single = Extract<P_DatePicker, { mode?: "single" }>
type DatePicker_single_Own_children = Assert<Has<P_DatePicker_single, "children">>
type DatePicker_single_Optional_children = Assert<Exact<IsOptional<P_DatePicker_single, "children">, true>>
type DatePicker_single_Type_children = Assert<Exact<NonNullable<P_DatePicker_single["children"]>, NonNullable<React.ReactNode>>>
type DatePicker_single_Own_defaultValue = Assert<Has<P_DatePicker_single, "defaultValue">>
type DatePicker_single_Optional_defaultValue = Assert<Exact<IsOptional<P_DatePicker_single, "defaultValue">, true>>
type DatePicker_single_Type_defaultValue = Assert<Exact<NonNullable<P_DatePicker_single["defaultValue"]>, NonNullable<Date>>>
type DatePicker_single_Own_disabled = Assert<Has<P_DatePicker_single, "disabled">>
type DatePicker_single_Optional_disabled = Assert<Exact<IsOptional<P_DatePicker_single, "disabled">, true>>
type DatePicker_single_Type_disabled = Assert<Exact<NonNullable<P_DatePicker_single["disabled"]>, NonNullable<boolean>>>
type DatePicker_single_Own_max = Assert<Has<P_DatePicker_single, "max">>
type DatePicker_single_Optional_max = Assert<Exact<IsOptional<P_DatePicker_single, "max">, true>>
type DatePicker_single_Type_max = Assert<Exact<NonNullable<P_DatePicker_single["max"]>, NonNullable<Date>>>
type DatePicker_single_Own_min = Assert<Has<P_DatePicker_single, "min">>
type DatePicker_single_Optional_min = Assert<Exact<IsOptional<P_DatePicker_single, "min">, true>>
type DatePicker_single_Type_min = Assert<Exact<NonNullable<P_DatePicker_single["min"]>, NonNullable<Date>>>
type DatePicker_single_Own_mode = Assert<Has<P_DatePicker_single, "mode">>
type DatePicker_single_Optional_mode = Assert<Exact<IsOptional<P_DatePicker_single, "mode">, true>>
type DatePicker_single_Type_mode = Assert<Exact<NonNullable<P_DatePicker_single["mode"]>, NonNullable<"single">>>
type DatePicker_single_Own_name = Assert<Has<P_DatePicker_single, "name">>
type DatePicker_single_Optional_name = Assert<Exact<IsOptional<P_DatePicker_single, "name">, true>>
type DatePicker_single_Type_name = Assert<Exact<NonNullable<P_DatePicker_single["name"]>, NonNullable<string>>>
type DatePicker_single_Own_onValueChange = Assert<Has<P_DatePicker_single, "onValueChange">>
type DatePicker_single_Optional_onValueChange = Assert<Exact<IsOptional<P_DatePicker_single, "onValueChange">, true>>
type DatePicker_single_Type_onValueChange = Assert<Exact<NonNullable<P_DatePicker_single["onValueChange"]>, NonNullable<(date: Date | undefined) => void>>>
type DatePicker_single_Own_required = Assert<Has<P_DatePicker_single, "required">>
type DatePicker_single_Optional_required = Assert<Exact<IsOptional<P_DatePicker_single, "required">, true>>
type DatePicker_single_Type_required = Assert<Exact<NonNullable<P_DatePicker_single["required"]>, NonNullable<boolean>>>
type DatePicker_single_Own_value = Assert<Has<P_DatePicker_single, "value">>
type DatePicker_single_Optional_value = Assert<Exact<IsOptional<P_DatePicker_single, "value">, true>>
type DatePicker_single_Type_value = Assert<Exact<NonNullable<P_DatePicker_single["value"]>, NonNullable<Date>>>

// DatePickerContent: another exported part of the module
type P_DatePickerContent = React.ComponentProps<typeof DatePickerContent>
type DatePickerContent_Own_captionLayout = Assert<Has<P_DatePickerContent, "captionLayout">>
type DatePickerContent_Optional_captionLayout = Assert<Exact<IsOptional<P_DatePickerContent, "captionLayout">, true>>
type DatePickerContent_Type_captionLayout = Assert<Exact<NonNullable<P_DatePickerContent["captionLayout"]>, NonNullable<"label" | "dropdown">>>
type DatePickerContent_Own_side = Assert<Has<P_DatePickerContent, "side">>
type DatePickerContent_Optional_side = Assert<Exact<IsOptional<P_DatePickerContent, "side">, true>>
type DatePickerContent_Type_side = Assert<Exact<NonNullable<P_DatePickerContent["side"]>, NonNullable<DatePickerSide>>>
type DatePickerContent_Own_yearRange = Assert<Has<P_DatePickerContent, "yearRange">>
type DatePickerContent_Optional_yearRange = Assert<Exact<IsOptional<P_DatePickerContent, "yearRange">, true>>
type DatePickerContent_Type_yearRange = Assert<Exact<NonNullable<P_DatePickerContent["yearRange"]>, NonNullable<[number, number]>>>
type DatePickerContent_Union_captionLayout = Assert<Exact<NonNullable<P_DatePickerContent["captionLayout"]>, "dropdown" | "label">>
type DatePickerContent_Union_side = Assert<Exact<NonNullable<P_DatePickerContent["side"]>, "bottom" | "top">>

// DatePickerInput: another exported part of the module
type P_DatePickerInput = React.ComponentProps<typeof DatePickerInput>
type DatePickerInput_Own_formatDate = Assert<Has<P_DatePickerInput, "formatDate">>
type DatePickerInput_Optional_formatDate = Assert<Exact<IsOptional<P_DatePickerInput, "formatDate">, true>>
type DatePickerInput_Type_formatDate = Assert<Exact<NonNullable<P_DatePickerInput["formatDate"]>, NonNullable<(date: Date) => string>>>
type DatePickerInput_Own_parseDate = Assert<Has<P_DatePickerInput, "parseDate">>
type DatePickerInput_Optional_parseDate = Assert<Exact<IsOptional<P_DatePickerInput, "parseDate">, true>>
type DatePickerInput_Type_parseDate = Assert<Exact<NonNullable<P_DatePickerInput["parseDate"]>, NonNullable<(text: string) => Date | undefined>>>

// DatePickerNaturalInput: another exported part of the module
type P_DatePickerNaturalInput = React.ComponentProps<typeof DatePickerNaturalInput>
type DatePickerNaturalInput_Own_parseText = Assert<Has<P_DatePickerNaturalInput, "parseText">>
type DatePickerNaturalInput_Optional_parseText = Assert<Exact<IsOptional<P_DatePickerNaturalInput, "parseText">, true>>
type DatePickerNaturalInput_Type_parseText = Assert<Exact<NonNullable<P_DatePickerNaturalInput["parseText"]>, NonNullable<(text: string) => Date | undefined>>>
type DatePickerNaturalInput_Own_renderPreview = Assert<Has<P_DatePickerNaturalInput, "renderPreview">>
type DatePickerNaturalInput_Optional_renderPreview = Assert<Exact<IsOptional<P_DatePickerNaturalInput, "renderPreview">, true>>
type DatePickerNaturalInput_Type_renderPreview = Assert<Exact<NonNullable<P_DatePickerNaturalInput["renderPreview"]>, NonNullable<(date: Date | undefined) => React.ReactNode>>>

// exported types of the module
type Type_DatePickerMode = Assert<Exact<DatePickerMode, "range" | "single">>
type Type_DatePickerRange = Assert<Exact<DatePickerRange, [Date | undefined, Date | undefined]>>
type Type_DatePickerSide = Assert<Exact<DatePickerSide, "bottom" | "top">>

// DatePickerInput: inherited props it must keep (packages/registry/contract-props.json)
type DatePickerInput_Kept_placeholder = Assert<Has<P_DatePickerInput, "placeholder">>
type DatePickerInput_KeptType_placeholder = Assert<Exact<NonNullable<P_DatePickerInput["placeholder"]>, NonNullable<string>>>
type DatePickerInput_Kept_invalid = Assert<Has<P_DatePickerInput, "invalid">>
type DatePickerInput_KeptType_invalid = Assert<Exact<NonNullable<P_DatePickerInput["invalid"]>, NonNullable<boolean>>>

// DatePickerNaturalInput: inherited props it must keep (packages/registry/contract-props.json)
type DatePickerNaturalInput_Kept_placeholder = Assert<Has<P_DatePickerNaturalInput, "placeholder">>
type DatePickerNaturalInput_KeptType_placeholder = Assert<Exact<NonNullable<P_DatePickerNaturalInput["placeholder"]>, NonNullable<string>>>
type DatePickerNaturalInput_Kept_invalid = Assert<Has<P_DatePickerNaturalInput, "invalid">>
type DatePickerNaturalInput_KeptType_invalid = Assert<Exact<NonNullable<P_DatePickerNaturalInput["invalid"]>, NonNullable<boolean>>>
