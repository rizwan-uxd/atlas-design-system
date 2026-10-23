// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Table.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Table, TableAlign, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, TableSort } from "@atlas/ui-web/primitives/Table/Table"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof TableHead>

// own props of TableHead: deleting one, flipping its optionality or changing its type fails here
type Own_align = Assert<Has<P, "align">>
type Optional_align = Assert<Exact<IsOptional<P, "align">, true>>
type Type_align = Assert<Exact<NonNullable<P["align"]>, NonNullable<TableAlign>>>
type Own_onSort = Assert<Has<P, "onSort">>
type Optional_onSort = Assert<Exact<IsOptional<P, "onSort">, true>>
type Type_onSort = Assert<Exact<NonNullable<P["onSort"]>, NonNullable<() => void>>>
type Own_sort = Assert<Has<P, "sort">>
type Optional_sort = Assert<Exact<IsOptional<P, "sort">, true>>
type Type_sort = Assert<Exact<NonNullable<P["sort"]>, NonNullable<TableSort>>>
type Union_align = Assert<Exact<NonNullable<P["align"]>, "end" | "start">>
type Union_sort = Assert<Exact<NonNullable<P["sort"]>, "ascending" | "descending" | "none" | "unsorted">>

// Table: another exported part of the module
type P_Table = React.ComponentProps<typeof Table>

// TableBody: another exported part of the module
type P_TableBody = React.ComponentProps<typeof TableBody>

// TableCaption: another exported part of the module
type P_TableCaption = React.ComponentProps<typeof TableCaption>

// TableCell: another exported part of the module
type P_TableCell = React.ComponentProps<typeof TableCell>
type TableCell_Own_align = Assert<Has<P_TableCell, "align">>
type TableCell_Optional_align = Assert<Exact<IsOptional<P_TableCell, "align">, true>>
type TableCell_Type_align = Assert<Exact<NonNullable<P_TableCell["align"]>, NonNullable<TableAlign>>>
type TableCell_Union_align = Assert<Exact<NonNullable<P_TableCell["align"]>, "end" | "start">>

// TableFooter: another exported part of the module
type P_TableFooter = React.ComponentProps<typeof TableFooter>

// TableHeader: another exported part of the module
type P_TableHeader = React.ComponentProps<typeof TableHeader>

// TableRow: another exported part of the module
type P_TableRow = React.ComponentProps<typeof TableRow>
type TableRow_Own_selected = Assert<Has<P_TableRow, "selected">>
type TableRow_Optional_selected = Assert<Exact<IsOptional<P_TableRow, "selected">, true>>
type TableRow_Type_selected = Assert<Exact<NonNullable<P_TableRow["selected"]>, NonNullable<boolean>>>

// exported types of the module
type Type_TableAlign = Assert<Exact<TableAlign, "end" | "start">>
type Type_TableSort = Assert<Exact<TableSort, "ascending" | "descending" | "none" | "unsorted">>
