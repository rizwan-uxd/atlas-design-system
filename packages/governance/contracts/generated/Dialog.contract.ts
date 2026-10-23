// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Dialog.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogSize, DialogTitle, DialogTrigger, DialogVariant } from "@atlas/ui-web/compositions/Dialog/Dialog"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DialogContent>

// own props of DialogContent: deleting one, flipping its optionality or changing its type fails here
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
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<DialogSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<DialogVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "full" | "lg" | "md" | "sm" | "xl">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "destructive">>

// Dialog: another exported part of the module
type P_Dialog = React.ComponentProps<typeof Dialog>
type Dialog_Own_children = Assert<Has<P_Dialog, "children">>
type Dialog_Optional_children = Assert<Exact<IsOptional<P_Dialog, "children">, true>>
type Dialog_Type_children = Assert<Exact<NonNullable<P_Dialog["children"]>, NonNullable<React.ReactNode>>>
type Dialog_Own_defaultOpen = Assert<Has<P_Dialog, "defaultOpen">>
type Dialog_Optional_defaultOpen = Assert<Exact<IsOptional<P_Dialog, "defaultOpen">, true>>
type Dialog_Type_defaultOpen = Assert<Exact<NonNullable<P_Dialog["defaultOpen"]>, NonNullable<boolean>>>
type Dialog_Own_onClose = Assert<Has<P_Dialog, "onClose">>
type Dialog_Optional_onClose = Assert<Exact<IsOptional<P_Dialog, "onClose">, true>>
type Dialog_Type_onClose = Assert<Exact<NonNullable<P_Dialog["onClose"]>, NonNullable<() => void>>>
type Dialog_Own_onOpenChange = Assert<Has<P_Dialog, "onOpenChange">>
type Dialog_Optional_onOpenChange = Assert<Exact<IsOptional<P_Dialog, "onOpenChange">, true>>
type Dialog_Type_onOpenChange = Assert<Exact<NonNullable<P_Dialog["onOpenChange"]>, NonNullable<(open: boolean) => void>>>
type Dialog_Own_open = Assert<Has<P_Dialog, "open">>
type Dialog_Optional_open = Assert<Exact<IsOptional<P_Dialog, "open">, true>>
type Dialog_Type_open = Assert<Exact<NonNullable<P_Dialog["open"]>, NonNullable<boolean>>>

// DialogBody: another exported part of the module
type P_DialogBody = React.ComponentProps<typeof DialogBody>
type DialogBody_Own_children = Assert<Has<P_DialogBody, "children">>
type DialogBody_Optional_children = Assert<Exact<IsOptional<P_DialogBody, "children">, true>>
type DialogBody_Type_children = Assert<Exact<NonNullable<P_DialogBody["children"]>, NonNullable<React.ReactNode>>>
type DialogBody_Own_className = Assert<Has<P_DialogBody, "className">>
type DialogBody_Optional_className = Assert<Exact<IsOptional<P_DialogBody, "className">, true>>
type DialogBody_Type_className = Assert<Exact<NonNullable<P_DialogBody["className"]>, NonNullable<string>>>

// DialogClose: another exported part of the module
type P_DialogClose = React.ComponentProps<typeof DialogClose>
type DialogClose_Own_asChild = Assert<Has<P_DialogClose, "asChild">>
type DialogClose_Optional_asChild = Assert<Exact<IsOptional<P_DialogClose, "asChild">, true>>
type DialogClose_Type_asChild = Assert<Exact<NonNullable<P_DialogClose["asChild"]>, NonNullable<boolean>>>
type DialogClose_Own_children = Assert<Has<P_DialogClose, "children">>
type DialogClose_Optional_children = Assert<Exact<IsOptional<P_DialogClose, "children">, true>>
type DialogClose_Type_children = Assert<Exact<NonNullable<P_DialogClose["children"]>, NonNullable<React.ReactNode>>>

// DialogDescription: another exported part of the module
type P_DialogDescription = React.ComponentProps<typeof DialogDescription>
type DialogDescription_Own_children = Assert<Has<P_DialogDescription, "children">>
type DialogDescription_Optional_children = Assert<Exact<IsOptional<P_DialogDescription, "children">, true>>
type DialogDescription_Type_children = Assert<Exact<NonNullable<P_DialogDescription["children"]>, NonNullable<React.ReactNode>>>
type DialogDescription_Own_className = Assert<Has<P_DialogDescription, "className">>
type DialogDescription_Optional_className = Assert<Exact<IsOptional<P_DialogDescription, "className">, true>>
type DialogDescription_Type_className = Assert<Exact<NonNullable<P_DialogDescription["className"]>, NonNullable<string>>>

// DialogFooter: another exported part of the module
type P_DialogFooter = React.ComponentProps<typeof DialogFooter>
type DialogFooter_Own_children = Assert<Has<P_DialogFooter, "children">>
type DialogFooter_Optional_children = Assert<Exact<IsOptional<P_DialogFooter, "children">, true>>
type DialogFooter_Type_children = Assert<Exact<NonNullable<P_DialogFooter["children"]>, NonNullable<React.ReactNode>>>
type DialogFooter_Own_className = Assert<Has<P_DialogFooter, "className">>
type DialogFooter_Optional_className = Assert<Exact<IsOptional<P_DialogFooter, "className">, true>>
type DialogFooter_Type_className = Assert<Exact<NonNullable<P_DialogFooter["className"]>, NonNullable<string>>>
type DialogFooter_Own_justify = Assert<Has<P_DialogFooter, "justify">>
type DialogFooter_Optional_justify = Assert<Exact<IsOptional<P_DialogFooter, "justify">, true>>
type DialogFooter_Type_justify = Assert<Exact<NonNullable<P_DialogFooter["justify"]>, NonNullable<"start" | "between" | "end">>>
type DialogFooter_Union_justify = Assert<Exact<NonNullable<P_DialogFooter["justify"]>, "between" | "end" | "start">>

// DialogHeader: another exported part of the module
type P_DialogHeader = React.ComponentProps<typeof DialogHeader>
type DialogHeader_Own_children = Assert<Has<P_DialogHeader, "children">>
type DialogHeader_Optional_children = Assert<Exact<IsOptional<P_DialogHeader, "children">, true>>
type DialogHeader_Type_children = Assert<Exact<NonNullable<P_DialogHeader["children"]>, NonNullable<React.ReactNode>>>
type DialogHeader_Own_className = Assert<Has<P_DialogHeader, "className">>
type DialogHeader_Optional_className = Assert<Exact<IsOptional<P_DialogHeader, "className">, true>>
type DialogHeader_Type_className = Assert<Exact<NonNullable<P_DialogHeader["className"]>, NonNullable<string>>>
type DialogHeader_Own_onClose = Assert<Has<P_DialogHeader, "onClose">>
type DialogHeader_Optional_onClose = Assert<Exact<IsOptional<P_DialogHeader, "onClose">, true>>
type DialogHeader_Type_onClose = Assert<Exact<NonNullable<P_DialogHeader["onClose"]>, NonNullable<() => void>>>
type DialogHeader_Own_showClose = Assert<Has<P_DialogHeader, "showClose">>
type DialogHeader_Optional_showClose = Assert<Exact<IsOptional<P_DialogHeader, "showClose">, true>>
type DialogHeader_Type_showClose = Assert<Exact<NonNullable<P_DialogHeader["showClose"]>, NonNullable<boolean>>>

// DialogTitle: another exported part of the module
type P_DialogTitle = React.ComponentProps<typeof DialogTitle>
type DialogTitle_Own_children = Assert<Has<P_DialogTitle, "children">>
type DialogTitle_Optional_children = Assert<Exact<IsOptional<P_DialogTitle, "children">, true>>
type DialogTitle_Type_children = Assert<Exact<NonNullable<P_DialogTitle["children"]>, NonNullable<React.ReactNode>>>
type DialogTitle_Own_className = Assert<Has<P_DialogTitle, "className">>
type DialogTitle_Optional_className = Assert<Exact<IsOptional<P_DialogTitle, "className">, true>>
type DialogTitle_Type_className = Assert<Exact<NonNullable<P_DialogTitle["className"]>, NonNullable<string>>>

// DialogTrigger: another exported part of the module
type P_DialogTrigger = React.ComponentProps<typeof DialogTrigger>
type DialogTrigger_Own_asChild = Assert<Has<P_DialogTrigger, "asChild">>
type DialogTrigger_Optional_asChild = Assert<Exact<IsOptional<P_DialogTrigger, "asChild">, true>>
type DialogTrigger_Type_asChild = Assert<Exact<NonNullable<P_DialogTrigger["asChild"]>, NonNullable<boolean>>>
type DialogTrigger_Own_children = Assert<Has<P_DialogTrigger, "children">>
type DialogTrigger_Optional_children = Assert<Exact<IsOptional<P_DialogTrigger, "children">, true>>
type DialogTrigger_Type_children = Assert<Exact<NonNullable<P_DialogTrigger["children"]>, NonNullable<React.ReactNode>>>

// exported types of the module
type Type_DialogSize = Assert<Exact<DialogSize, "full" | "lg" | "md" | "sm" | "xl">>
type Type_DialogVariant = Assert<Exact<DialogVariant, "default" | "destructive">>
