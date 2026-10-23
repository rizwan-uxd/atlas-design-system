// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Tooltip.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Tooltip, TooltipContent, TooltipProvider, TooltipSide, TooltipTrigger } from "@atlas/ui-web/primitives/Tooltip/Tooltip"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof TooltipContent>

// own props of TooltipContent: deleting one, flipping its optionality or changing its type fails here
type Own_side = Assert<Has<P, "side">>
type Optional_side = Assert<Exact<IsOptional<P, "side">, true>>
type Type_side = Assert<Exact<NonNullable<P["side"]>, NonNullable<TooltipSide>>>
type Union_side = Assert<Exact<NonNullable<P["side"]>, "bottom" | "end" | "start" | "top">>

// Tooltip: another exported part of the module
type P_Tooltip = React.ComponentProps<typeof Tooltip>

// TooltipProvider: another exported part of the module
type P_TooltipProvider = React.ComponentProps<typeof TooltipProvider>

// TooltipTrigger: another exported part of the module
type P_TooltipTrigger = React.ComponentProps<typeof TooltipTrigger>

// exported types of the module
type Type_TooltipSide = Assert<Exact<TooltipSide, "bottom" | "end" | "start" | "top">>
