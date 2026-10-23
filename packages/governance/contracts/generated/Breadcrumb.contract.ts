// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Breadcrumb.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Breadcrumb } from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Breadcrumb>

// own props of Breadcrumb: deleting one, or flipping its optionality, fails here
type Own_separator = Assert<Has<P, "separator">>
type Optional_separator = Assert<Exact<IsOptional<P, "separator">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_separator = Assert<Exact<NonNullable<P["separator"]>, "chevron" | "dot">>
