// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Tooltip.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { TooltipContent } from "@atlas/ui-web/primitives/Tooltip/Tooltip"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof TooltipContent>

// own props of TooltipContent: deleting one, or flipping its optionality, fails here
type Own_side = Assert<Has<P, "side">>
type Optional_side = Assert<Exact<IsOptional<P, "side">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_side = Assert<Exact<NonNullable<P["side"]>, "bottom" | "end" | "start" | "top">>
