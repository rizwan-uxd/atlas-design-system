// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Pagination.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Pagination } from "@atlas/ui-web/patterns/Pagination/Pagination"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Pagination>

// own props of Pagination: deleting one, or flipping its optionality, fails here
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Own_onPageChange = Assert<Has<P, "onPageChange">>
type Optional_onPageChange = Assert<Exact<IsOptional<P, "onPageChange">, false>>
type Own_page = Assert<Has<P, "page">>
type Optional_page = Assert<Exact<IsOptional<P, "page">, false>>
type Own_pageCount = Assert<Has<P, "pageCount">>
type Optional_pageCount = Assert<Exact<IsOptional<P, "pageCount">, false>>
type Own_siblingCount = Assert<Has<P, "siblingCount">>
type Optional_siblingCount = Assert<Exact<IsOptional<P, "siblingCount">, true>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>
