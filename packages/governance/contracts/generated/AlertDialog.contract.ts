// GENERATED — do not hand-edit. registry-build from packages/registry/generated/AlertDialog.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogSize, AlertDialogTitle, AlertDialogTrigger, AlertDialogVariant } from "@atlas/ui-web/compositions/AlertDialog/AlertDialog"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof AlertDialogContent>

// own props of AlertDialogContent: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<AlertDialogSize>>>
type Own_state = Assert<Has<P, "state">>
type Optional_state = Assert<Exact<IsOptional<P, "state">, true>>
type Type_state = Assert<Exact<NonNullable<P["state"]>, NonNullable<"default" | "loading">>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<AlertDialogVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_state = Assert<Exact<NonNullable<P["state"]>, "default" | "loading">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "destructive">>

// AlertDialog: another exported part of the module
type P_AlertDialog = React.ComponentProps<typeof AlertDialog>
type AlertDialog_Own_children = Assert<Has<P_AlertDialog, "children">>
type AlertDialog_Optional_children = Assert<Exact<IsOptional<P_AlertDialog, "children">, true>>
type AlertDialog_Type_children = Assert<Exact<NonNullable<P_AlertDialog["children"]>, NonNullable<React.ReactNode>>>
type AlertDialog_Own_defaultOpen = Assert<Has<P_AlertDialog, "defaultOpen">>
type AlertDialog_Optional_defaultOpen = Assert<Exact<IsOptional<P_AlertDialog, "defaultOpen">, true>>
type AlertDialog_Type_defaultOpen = Assert<Exact<NonNullable<P_AlertDialog["defaultOpen"]>, NonNullable<boolean>>>
type AlertDialog_Own_onOpenChange = Assert<Has<P_AlertDialog, "onOpenChange">>
type AlertDialog_Optional_onOpenChange = Assert<Exact<IsOptional<P_AlertDialog, "onOpenChange">, true>>
type AlertDialog_Type_onOpenChange = Assert<Exact<NonNullable<P_AlertDialog["onOpenChange"]>, NonNullable<(open: boolean) => void>>>
type AlertDialog_Own_open = Assert<Has<P_AlertDialog, "open">>
type AlertDialog_Optional_open = Assert<Exact<IsOptional<P_AlertDialog, "open">, true>>
type AlertDialog_Type_open = Assert<Exact<NonNullable<P_AlertDialog["open"]>, NonNullable<boolean>>>

// AlertDialogAction: another exported part of the module
type P_AlertDialogAction = React.ComponentProps<typeof AlertDialogAction>
type AlertDialogAction_Own_children = Assert<Has<P_AlertDialogAction, "children">>
type AlertDialogAction_Optional_children = Assert<Exact<IsOptional<P_AlertDialogAction, "children">, true>>
type AlertDialogAction_Type_children = Assert<Exact<NonNullable<P_AlertDialogAction["children"]>, NonNullable<React.ReactNode>>>
type AlertDialogAction_Own_className = Assert<Has<P_AlertDialogAction, "className">>
type AlertDialogAction_Optional_className = Assert<Exact<IsOptional<P_AlertDialogAction, "className">, true>>
type AlertDialogAction_Type_className = Assert<Exact<NonNullable<P_AlertDialogAction["className"]>, NonNullable<string>>>
type AlertDialogAction_Own_onClick = Assert<Has<P_AlertDialogAction, "onClick">>
type AlertDialogAction_Optional_onClick = Assert<Exact<IsOptional<P_AlertDialogAction, "onClick">, true>>
type AlertDialogAction_Type_onClick = Assert<Exact<NonNullable<P_AlertDialogAction["onClick"]>, NonNullable<(e: React.MouseEvent<HTMLButtonElement>) => void>>>

// AlertDialogCancel: another exported part of the module
type P_AlertDialogCancel = React.ComponentProps<typeof AlertDialogCancel>
type AlertDialogCancel_Own_children = Assert<Has<P_AlertDialogCancel, "children">>
type AlertDialogCancel_Optional_children = Assert<Exact<IsOptional<P_AlertDialogCancel, "children">, true>>
type AlertDialogCancel_Type_children = Assert<Exact<NonNullable<P_AlertDialogCancel["children"]>, NonNullable<React.ReactNode>>>
type AlertDialogCancel_Own_className = Assert<Has<P_AlertDialogCancel, "className">>
type AlertDialogCancel_Optional_className = Assert<Exact<IsOptional<P_AlertDialogCancel, "className">, true>>
type AlertDialogCancel_Type_className = Assert<Exact<NonNullable<P_AlertDialogCancel["className"]>, NonNullable<string>>>

// AlertDialogDescription: another exported part of the module
type P_AlertDialogDescription = React.ComponentProps<typeof AlertDialogDescription>
type AlertDialogDescription_Own_children = Assert<Has<P_AlertDialogDescription, "children">>
type AlertDialogDescription_Optional_children = Assert<Exact<IsOptional<P_AlertDialogDescription, "children">, true>>
type AlertDialogDescription_Type_children = Assert<Exact<NonNullable<P_AlertDialogDescription["children"]>, NonNullable<React.ReactNode>>>
type AlertDialogDescription_Own_className = Assert<Has<P_AlertDialogDescription, "className">>
type AlertDialogDescription_Optional_className = Assert<Exact<IsOptional<P_AlertDialogDescription, "className">, true>>
type AlertDialogDescription_Type_className = Assert<Exact<NonNullable<P_AlertDialogDescription["className"]>, NonNullable<string>>>

// AlertDialogFooter: another exported part of the module
type P_AlertDialogFooter = React.ComponentProps<typeof AlertDialogFooter>
type AlertDialogFooter_Own_children = Assert<Has<P_AlertDialogFooter, "children">>
type AlertDialogFooter_Optional_children = Assert<Exact<IsOptional<P_AlertDialogFooter, "children">, true>>
type AlertDialogFooter_Type_children = Assert<Exact<NonNullable<P_AlertDialogFooter["children"]>, NonNullable<React.ReactNode>>>
type AlertDialogFooter_Own_className = Assert<Has<P_AlertDialogFooter, "className">>
type AlertDialogFooter_Optional_className = Assert<Exact<IsOptional<P_AlertDialogFooter, "className">, true>>
type AlertDialogFooter_Type_className = Assert<Exact<NonNullable<P_AlertDialogFooter["className"]>, NonNullable<string>>>

// AlertDialogTitle: another exported part of the module
type P_AlertDialogTitle = React.ComponentProps<typeof AlertDialogTitle>
type AlertDialogTitle_Own_children = Assert<Has<P_AlertDialogTitle, "children">>
type AlertDialogTitle_Optional_children = Assert<Exact<IsOptional<P_AlertDialogTitle, "children">, true>>
type AlertDialogTitle_Type_children = Assert<Exact<NonNullable<P_AlertDialogTitle["children"]>, NonNullable<React.ReactNode>>>
type AlertDialogTitle_Own_className = Assert<Has<P_AlertDialogTitle, "className">>
type AlertDialogTitle_Optional_className = Assert<Exact<IsOptional<P_AlertDialogTitle, "className">, true>>
type AlertDialogTitle_Type_className = Assert<Exact<NonNullable<P_AlertDialogTitle["className"]>, NonNullable<string>>>

// AlertDialogTrigger: another exported part of the module
type P_AlertDialogTrigger = React.ComponentProps<typeof AlertDialogTrigger>
type AlertDialogTrigger_Own_asChild = Assert<Has<P_AlertDialogTrigger, "asChild">>
type AlertDialogTrigger_Optional_asChild = Assert<Exact<IsOptional<P_AlertDialogTrigger, "asChild">, true>>
type AlertDialogTrigger_Type_asChild = Assert<Exact<NonNullable<P_AlertDialogTrigger["asChild"]>, NonNullable<boolean>>>
type AlertDialogTrigger_Own_children = Assert<Has<P_AlertDialogTrigger, "children">>
type AlertDialogTrigger_Optional_children = Assert<Exact<IsOptional<P_AlertDialogTrigger, "children">, true>>
type AlertDialogTrigger_Type_children = Assert<Exact<NonNullable<P_AlertDialogTrigger["children"]>, NonNullable<React.ReactNode>>>

// exported types of the module
type Type_AlertDialogSize = Assert<Exact<AlertDialogSize, "lg" | "md" | "sm">>
type Type_AlertDialogVariant = Assert<Exact<AlertDialogVariant, "default" | "destructive">>
