// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Pagination.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Pagination, PaginationSize } from "@atlas/ui-web/patterns/Pagination/Pagination"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Pagination>

// own props of Pagination: deleting one, flipping its optionality or changing its type fails here
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_onPageChange = Assert<Has<P, "onPageChange">>
type Optional_onPageChange = Assert<Exact<IsOptional<P, "onPageChange">, false>>
type Type_onPageChange = Assert<Exact<NonNullable<P["onPageChange"]>, NonNullable<(page: number) => void>>>
type Own_page = Assert<Has<P, "page">>
type Optional_page = Assert<Exact<IsOptional<P, "page">, false>>
type Type_page = Assert<Exact<NonNullable<P["page"]>, NonNullable<number>>>
type Own_pageCount = Assert<Has<P, "pageCount">>
type Optional_pageCount = Assert<Exact<IsOptional<P, "pageCount">, false>>
type Type_pageCount = Assert<Exact<NonNullable<P["pageCount"]>, NonNullable<number>>>
type Own_siblingCount = Assert<Has<P, "siblingCount">>
type Optional_siblingCount = Assert<Exact<IsOptional<P, "siblingCount">, true>>
type Type_siblingCount = Assert<Exact<NonNullable<P["siblingCount"]>, NonNullable<number>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<PaginationSize>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "md" | "sm">>

// exported types of the module
type Type_PaginationSize = Assert<Exact<PaginationSize, "md" | "sm">>

// Pagination: inherited props it must keep (packages/registry/contract-props.json)
type Pagination_Kept_className = Assert<Has<P, "className">>
type Pagination_KeptType_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
