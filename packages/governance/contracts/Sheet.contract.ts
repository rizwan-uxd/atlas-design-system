// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Sheet.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetSide, SheetSize, SheetTitle, SheetTrigger } from "@atlas/ui-web/compositions/Sheet/Sheet"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof SheetContent>

// own props of SheetContent: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_closeOnEscape = Assert<Has<P, "closeOnEscape">>
type Optional_closeOnEscape = Assert<Exact<IsOptional<P, "closeOnEscape">, true>>
type Type_closeOnEscape = Assert<Exact<NonNullable<P["closeOnEscape"]>, NonNullable<boolean>>>
type Own_closeOnOverlayClick = Assert<Has<P, "closeOnOverlayClick">>
type Optional_closeOnOverlayClick = Assert<Exact<IsOptional<P, "closeOnOverlayClick">, true>>
type Type_closeOnOverlayClick = Assert<Exact<NonNullable<P["closeOnOverlayClick"]>, NonNullable<boolean>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_side = Assert<Has<P, "side">>
type Optional_side = Assert<Exact<IsOptional<P, "side">, true>>
type Type_side = Assert<Exact<NonNullable<P["side"]>, NonNullable<SheetSide>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<SheetSize>>>
type Union_side = Assert<Exact<NonNullable<P["side"]>, "bottom" | "end" | "start" | "top">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "full" | "lg" | "md" | "sm" | "xl">>

// Sheet: another exported part of the module
type P_Sheet = React.ComponentProps<typeof Sheet>

// SheetBody: another exported part of the module
type P_SheetBody = React.ComponentProps<typeof SheetBody>

// SheetClose: another exported part of the module
type P_SheetClose = React.ComponentProps<typeof SheetClose>

// SheetDescription: another exported part of the module
type P_SheetDescription = React.ComponentProps<typeof SheetDescription>

// SheetFooter: another exported part of the module
type P_SheetFooter = React.ComponentProps<typeof SheetFooter>

// SheetHeader: another exported part of the module
type P_SheetHeader = React.ComponentProps<typeof SheetHeader>

// SheetTitle: another exported part of the module
type P_SheetTitle = React.ComponentProps<typeof SheetTitle>

// SheetTrigger: another exported part of the module
type P_SheetTrigger = React.ComponentProps<typeof SheetTrigger>

// exported types of the module
type Type_SheetSide = Assert<Exact<SheetSide, "bottom" | "end" | "start" | "top">>
type Type_SheetSize = Assert<Exact<SheetSize, "full" | "lg" | "md" | "sm" | "xl">>
