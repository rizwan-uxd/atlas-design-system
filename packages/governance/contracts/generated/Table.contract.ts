// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Table.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { TableHead } from "@atlas/ui-web/primitives/Table/Table"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof TableHead>

// own props of TableHead: deleting one, or flipping its optionality, fails here
type Own_align = Assert<Has<P, "align">>
type Optional_align = Assert<Exact<IsOptional<P, "align">, true>>
type Own_onSort = Assert<Has<P, "onSort">>
type Optional_onSort = Assert<Exact<IsOptional<P, "onSort">, true>>
type Own_sort = Assert<Has<P, "sort">>
type Optional_sort = Assert<Exact<IsOptional<P, "sort">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_align = Assert<Exact<NonNullable<P["align"]>, "end" | "start">>
type Union_sort = Assert<Exact<NonNullable<P["sort"]>, "ascending" | "descending" | "none" | "unsorted">>
