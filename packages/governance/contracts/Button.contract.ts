// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Button.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Button, ButtonSize, ButtonVariant } from "@atlas/ui-web/primitives/Button/Button"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Button>

// own props of Button: deleting one, flipping its optionality or changing its type fails here
type Own_asChild = Assert<Has<P, "asChild">>
type Optional_asChild = Assert<Exact<IsOptional<P, "asChild">, true>>
type Type_asChild = Assert<Exact<NonNullable<P["asChild"]>, NonNullable<boolean>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_iconOnly = Assert<Has<P, "iconOnly">>
type Optional_iconOnly = Assert<Exact<IsOptional<P, "iconOnly">, true>>
type Type_iconOnly = Assert<Exact<NonNullable<P["iconOnly"]>, NonNullable<boolean>>>
type Own_leadingIcon = Assert<Has<P, "leadingIcon">>
type Optional_leadingIcon = Assert<Exact<IsOptional<P, "leadingIcon">, true>>
type Type_leadingIcon = Assert<Exact<NonNullable<P["leadingIcon"]>, NonNullable<React.ReactNode>>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Type_loading = Assert<Exact<NonNullable<P["loading"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<ButtonSize>>>
type Own_trailingIcon = Assert<Has<P, "trailingIcon">>
type Optional_trailingIcon = Assert<Exact<IsOptional<P, "trailingIcon">, true>>
type Type_trailingIcon = Assert<Exact<NonNullable<P["trailingIcon"]>, NonNullable<React.ReactNode>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<ButtonVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm" | "xs">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "destructive" | "ghost" | "link" | "outline" | "primary" | "secondary">>

// exported types of the module
type Type_ButtonSize = Assert<Exact<ButtonSize, "lg" | "md" | "sm" | "xs">>
type Type_ButtonVariant = Assert<Exact<ButtonVariant, "destructive" | "ghost" | "link" | "outline" | "primary" | "secondary">>

// Button: inherited props it must keep (packages/registry/contract-props.json)
type Button_Kept_disabled = Assert<Has<P, "disabled">>
type Button_KeptType_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Button_Kept_onClick = Assert<Has<P, "onClick">>
type Button_KeptType_onClick = Assert<Exact<NonNullable<P["onClick"]>, NonNullable<React.MouseEventHandler<HTMLButtonElement>>>>
type Button_Kept_ref = Assert<Has<P, "ref">>
type Button_KeptType_ref = Assert<Exact<NonNullable<P["ref"]>, NonNullable<React.Ref<HTMLButtonElement>>>>

// registry Button: its protocolProps and event handlers exist
type Registry_Button_variant = Assert<Has<P, "variant">>
type Registry_Button_size = Assert<Has<P, "size">>
type Registry_Button_iconOnly = Assert<Has<P, "iconOnly">>
type Registry_Button_loading = Assert<Has<P, "loading">>
type Registry_Button_disabled = Assert<Has<P, "disabled">>
type Registry_Button_onClick = Assert<Has<P, "onClick">>
