// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Chart.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Chart } from "@atlas/ui-web/compositions/Chart/Chart"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Chart>

// own props of Chart: deleting one, or flipping its optionality, fails here
type Own_state = Assert<Has<P, "state">>
type Optional_state = Assert<Exact<IsOptional<P, "state">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_state = Assert<Exact<NonNullable<P["state"]>, "default" | "empty" | "loading">>
