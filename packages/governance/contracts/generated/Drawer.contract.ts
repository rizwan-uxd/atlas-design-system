// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Drawer.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerSide, DrawerSize, DrawerTitle, DrawerTrigger } from "@atlas/ui-web/compositions/Drawer/Drawer"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DrawerContent>

// own props of DrawerContent: deleting one, flipping its optionality or changing its type fails here
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
type Type_side = Assert<Exact<NonNullable<P["side"]>, NonNullable<DrawerSide>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<DrawerSize>>>
type Union_side = Assert<Exact<NonNullable<P["side"]>, "end" | "start">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "full" | "lg" | "md" | "sm" | "xl">>

// Drawer: another exported part of the module
type P_Drawer = React.ComponentProps<typeof Drawer>

// DrawerBody: another exported part of the module
type P_DrawerBody = React.ComponentProps<typeof DrawerBody>

// DrawerClose: another exported part of the module
type P_DrawerClose = React.ComponentProps<typeof DrawerClose>

// DrawerDescription: another exported part of the module
type P_DrawerDescription = React.ComponentProps<typeof DrawerDescription>

// DrawerFooter: another exported part of the module
type P_DrawerFooter = React.ComponentProps<typeof DrawerFooter>

// DrawerHeader: another exported part of the module
type P_DrawerHeader = React.ComponentProps<typeof DrawerHeader>

// DrawerTitle: another exported part of the module
type P_DrawerTitle = React.ComponentProps<typeof DrawerTitle>

// DrawerTrigger: another exported part of the module
type P_DrawerTrigger = React.ComponentProps<typeof DrawerTrigger>

// exported types of the module
type Type_DrawerSide = Assert<Exact<DrawerSide, "end" | "start">>
type Type_DrawerSize = Assert<Exact<DrawerSize, "full" | "lg" | "md" | "sm" | "xl">>
