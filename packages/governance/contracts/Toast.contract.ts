// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Toast.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Toast, ToastAction, ToastClose, ToastDescription, ToastOptions, ToastProvider, ToastTitle, ToastVariant, ToastViewport, Toaster } from "@atlas/ui-web/compositions/Toast/Toast"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Toast>

// own props of Toast: deleting one, flipping its optionality or changing its type fails here
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<React.ReactNode | boolean>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<ToastVariant>>>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "danger" | "default" | "success">>

// ToastAction: another exported part of the module
type P_ToastAction = React.ComponentProps<typeof ToastAction>
type ToastAction_Own_altText = Assert<Has<P_ToastAction, "altText">>
type ToastAction_Optional_altText = Assert<Exact<IsOptional<P_ToastAction, "altText">, false>>
type ToastAction_Type_altText = Assert<Exact<NonNullable<P_ToastAction["altText"]>, NonNullable<string>>>

// ToastClose: another exported part of the module
type P_ToastClose = React.ComponentProps<typeof ToastClose>

// ToastDescription: another exported part of the module
type P_ToastDescription = React.ComponentProps<typeof ToastDescription>

// Toaster: another exported part of the module
type P_Toaster = React.ComponentProps<typeof Toaster>

// ToastProvider: another exported part of the module
type P_ToastProvider = React.ComponentProps<typeof ToastProvider>

// ToastTitle: another exported part of the module
type P_ToastTitle = React.ComponentProps<typeof ToastTitle>

// ToastViewport: another exported part of the module
type P_ToastViewport = React.ComponentProps<typeof ToastViewport>

// exported types of the module
type ToastOptions_Own_action = Assert<Has<ToastOptions, "action">>
type ToastOptions_Optional_action = Assert<Exact<IsOptional<ToastOptions, "action">, true>>
type ToastOptions_Type_action = Assert<Exact<NonNullable<ToastOptions["action"]>, NonNullable<{ label: string; altText: string; onClick?: () => void }>>>
type ToastOptions_Own_description = Assert<Has<ToastOptions, "description">>
type ToastOptions_Optional_description = Assert<Exact<IsOptional<ToastOptions, "description">, true>>
type ToastOptions_Type_description = Assert<Exact<NonNullable<ToastOptions["description"]>, NonNullable<React.ReactNode>>>
type ToastOptions_Own_dismissible = Assert<Has<ToastOptions, "dismissible">>
type ToastOptions_Optional_dismissible = Assert<Exact<IsOptional<ToastOptions, "dismissible">, true>>
type ToastOptions_Type_dismissible = Assert<Exact<NonNullable<ToastOptions["dismissible"]>, NonNullable<boolean>>>
type ToastOptions_Own_duration = Assert<Has<ToastOptions, "duration">>
type ToastOptions_Optional_duration = Assert<Exact<IsOptional<ToastOptions, "duration">, true>>
type ToastOptions_Type_duration = Assert<Exact<NonNullable<ToastOptions["duration"]>, NonNullable<number>>>
type ToastOptions_Own_icon = Assert<Has<ToastOptions, "icon">>
type ToastOptions_Optional_icon = Assert<Exact<IsOptional<ToastOptions, "icon">, true>>
type ToastOptions_Type_icon = Assert<Exact<NonNullable<ToastOptions["icon"]>, NonNullable<React.ReactNode | boolean>>>
type ToastOptions_Own_title = Assert<Has<ToastOptions, "title">>
type ToastOptions_Optional_title = Assert<Exact<IsOptional<ToastOptions, "title">, true>>
type ToastOptions_Type_title = Assert<Exact<NonNullable<ToastOptions["title"]>, NonNullable<React.ReactNode>>>
type ToastOptions_Own_variant = Assert<Has<ToastOptions, "variant">>
type ToastOptions_Optional_variant = Assert<Exact<IsOptional<ToastOptions, "variant">, true>>
type ToastOptions_Type_variant = Assert<Exact<NonNullable<ToastOptions["variant"]>, NonNullable<ToastVariant>>>
type ToastOptions_Keys = Assert<Exact<keyof ToastOptions, "action" | "description" | "dismissible" | "duration" | "icon" | "title" | "variant">>
type Type_ToastVariant = Assert<Exact<ToastVariant, "danger" | "default" | "success">>

// Toast: inherited props it must keep (packages/registry/contract-props.json)
type Toast_Kept_open = Assert<Has<P, "open">>
type Toast_KeptType_open = Assert<Exact<NonNullable<P["open"]>, NonNullable<boolean>>>
