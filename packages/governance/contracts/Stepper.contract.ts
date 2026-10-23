// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Stepper.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Stepper, StepperOrientation, StepperStatus, StepperStep } from "@atlas/ui-web/patterns/Stepper/Stepper"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Stepper>

// own props of Stepper: deleting one, flipping its optionality or changing its type fails here
type Own_current = Assert<Has<P, "current">>
type Optional_current = Assert<Exact<IsOptional<P, "current">, false>>
type Type_current = Assert<Exact<NonNullable<P["current"]>, NonNullable<number>>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Type_orientation = Assert<Exact<NonNullable<P["orientation"]>, NonNullable<StepperOrientation>>>
type Own_steps = Assert<Has<P, "steps">>
type Optional_steps = Assert<Exact<IsOptional<P, "steps">, false>>
type Type_steps = Assert<Exact<NonNullable<P["steps"]>, NonNullable<StepperStep[]>>>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>

// exported types of the module
type Type_StepperOrientation = Assert<Exact<StepperOrientation, "horizontal" | "vertical">>
type Type_StepperStatus = Assert<Exact<StepperStatus, "complete" | "current" | "upcoming">>
type StepperStep_Own_description = Assert<Has<StepperStep, "description">>
type StepperStep_Optional_description = Assert<Exact<IsOptional<StepperStep, "description">, true>>
type StepperStep_Type_description = Assert<Exact<NonNullable<StepperStep["description"]>, NonNullable<React.ReactNode>>>
type StepperStep_Own_label = Assert<Has<StepperStep, "label">>
type StepperStep_Optional_label = Assert<Exact<IsOptional<StepperStep, "label">, false>>
type StepperStep_Type_label = Assert<Exact<NonNullable<StepperStep["label"]>, NonNullable<React.ReactNode>>>
type StepperStep_Keys = Assert<Exact<keyof StepperStep, "description" | "label">>

// Stepper: absent by design (packages/registry/contract-props.json)
/** Status is derived from current, never passed in. */
type Stepper_Absent_status = Assert<Exact<Has<P, "status">, false>>
/** Children come from steps. */
type Stepper_Absent_children = Assert<Exact<Has<P, "children">, false>>
/** The viewport is chosen by CSS, never by a prop (DEC-074). */
type Stepper_Absent_size = Assert<Exact<Has<P, "size">, false>>
/** The viewport is chosen by CSS, never by a prop (DEC-074). */
type Stepper_Absent_viewport = Assert<Exact<Has<P, "viewport">, false>>

// Stepper: inherited props it must keep (packages/registry/contract-props.json)
type Stepper_Kept_className = Assert<Has<P, "className">>
type Stepper_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Stepper_Kept_aria_label = Assert<Has<P, "aria-label">>
type Stepper_KeptType_aria_label = Assert<Exact<NonNullable<P["aria-label"]>, NonNullable<string>>>
