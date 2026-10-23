// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Stepper.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Stepper } from "@atlas/ui-web/patterns/Stepper/Stepper"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Stepper>

// own props of Stepper: deleting one, or flipping its optionality, fails here
type Own_current = Assert<Has<P, "current">>
type Optional_current = Assert<Exact<IsOptional<P, "current">, false>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Own_steps = Assert<Has<P, "steps">>
type Optional_steps = Assert<Exact<IsOptional<P, "steps">, false>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
