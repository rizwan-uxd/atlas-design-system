// GENERATED — do not hand-edit. registry-build from packages/registry/generated/DropdownMenu.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSide, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@atlas/ui-web/patterns/DropdownMenu/DropdownMenu"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof DropdownMenu>

// own props of DropdownMenu: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_defaultOpen = Assert<Has<P, "defaultOpen">>
type Optional_defaultOpen = Assert<Exact<IsOptional<P, "defaultOpen">, true>>
type Type_defaultOpen = Assert<Exact<NonNullable<P["defaultOpen"]>, NonNullable<boolean>>>
type Own_onOpenChange = Assert<Has<P, "onOpenChange">>
type Optional_onOpenChange = Assert<Exact<IsOptional<P, "onOpenChange">, true>>
type Type_onOpenChange = Assert<Exact<NonNullable<P["onOpenChange"]>, NonNullable<(open: boolean) => void>>>
type Own_open = Assert<Has<P, "open">>
type Optional_open = Assert<Exact<IsOptional<P, "open">, true>>
type Type_open = Assert<Exact<NonNullable<P["open"]>, NonNullable<boolean>>>

// DropdownMenuCheckboxItem: another exported part of the module
type P_DropdownMenuCheckboxItem = React.ComponentProps<typeof DropdownMenuCheckboxItem>
type DropdownMenuCheckboxItem_Own_checked = Assert<Has<P_DropdownMenuCheckboxItem, "checked">>
type DropdownMenuCheckboxItem_Optional_checked = Assert<Exact<IsOptional<P_DropdownMenuCheckboxItem, "checked">, true>>
type DropdownMenuCheckboxItem_Type_checked = Assert<Exact<NonNullable<P_DropdownMenuCheckboxItem["checked"]>, NonNullable<boolean>>>
type DropdownMenuCheckboxItem_Own_disabled = Assert<Has<P_DropdownMenuCheckboxItem, "disabled">>
type DropdownMenuCheckboxItem_Optional_disabled = Assert<Exact<IsOptional<P_DropdownMenuCheckboxItem, "disabled">, true>>
type DropdownMenuCheckboxItem_Type_disabled = Assert<Exact<NonNullable<P_DropdownMenuCheckboxItem["disabled"]>, NonNullable<boolean>>>
type DropdownMenuCheckboxItem_Own_onCheckedChange = Assert<Has<P_DropdownMenuCheckboxItem, "onCheckedChange">>
type DropdownMenuCheckboxItem_Optional_onCheckedChange = Assert<Exact<IsOptional<P_DropdownMenuCheckboxItem, "onCheckedChange">, true>>
type DropdownMenuCheckboxItem_Type_onCheckedChange = Assert<Exact<NonNullable<P_DropdownMenuCheckboxItem["onCheckedChange"]>, NonNullable<(checked: boolean) => void>>>
type DropdownMenuCheckboxItem_Own_onSelect = Assert<Has<P_DropdownMenuCheckboxItem, "onSelect">>
type DropdownMenuCheckboxItem_Optional_onSelect = Assert<Exact<IsOptional<P_DropdownMenuCheckboxItem, "onSelect">, true>>
type DropdownMenuCheckboxItem_Type_onSelect = Assert<Exact<NonNullable<P_DropdownMenuCheckboxItem["onSelect"]>, NonNullable<(event: Event) => void>>>
type DropdownMenuCheckboxItem_Own_shortcut = Assert<Has<P_DropdownMenuCheckboxItem, "shortcut">>
type DropdownMenuCheckboxItem_Optional_shortcut = Assert<Exact<IsOptional<P_DropdownMenuCheckboxItem, "shortcut">, true>>
type DropdownMenuCheckboxItem_Type_shortcut = Assert<Exact<NonNullable<P_DropdownMenuCheckboxItem["shortcut"]>, NonNullable<React.ReactNode>>>

// DropdownMenuContent: another exported part of the module
type P_DropdownMenuContent = React.ComponentProps<typeof DropdownMenuContent>
type DropdownMenuContent_Own_side = Assert<Has<P_DropdownMenuContent, "side">>
type DropdownMenuContent_Optional_side = Assert<Exact<IsOptional<P_DropdownMenuContent, "side">, true>>
type DropdownMenuContent_Type_side = Assert<Exact<NonNullable<P_DropdownMenuContent["side"]>, NonNullable<DropdownMenuSide>>>
type DropdownMenuContent_Union_side = Assert<Exact<NonNullable<P_DropdownMenuContent["side"]>, "bottom" | "top">>

// DropdownMenuGroup: another exported part of the module
type P_DropdownMenuGroup = React.ComponentProps<typeof DropdownMenuGroup>

// DropdownMenuItem: another exported part of the module
type P_DropdownMenuItem = React.ComponentProps<typeof DropdownMenuItem>
type DropdownMenuItem_Own_destructive = Assert<Has<P_DropdownMenuItem, "destructive">>
type DropdownMenuItem_Optional_destructive = Assert<Exact<IsOptional<P_DropdownMenuItem, "destructive">, true>>
type DropdownMenuItem_Type_destructive = Assert<Exact<NonNullable<P_DropdownMenuItem["destructive"]>, NonNullable<boolean>>>
type DropdownMenuItem_Own_disabled = Assert<Has<P_DropdownMenuItem, "disabled">>
type DropdownMenuItem_Optional_disabled = Assert<Exact<IsOptional<P_DropdownMenuItem, "disabled">, true>>
type DropdownMenuItem_Type_disabled = Assert<Exact<NonNullable<P_DropdownMenuItem["disabled"]>, NonNullable<boolean>>>
type DropdownMenuItem_Own_icon = Assert<Has<P_DropdownMenuItem, "icon">>
type DropdownMenuItem_Optional_icon = Assert<Exact<IsOptional<P_DropdownMenuItem, "icon">, true>>
type DropdownMenuItem_Type_icon = Assert<Exact<NonNullable<P_DropdownMenuItem["icon"]>, NonNullable<React.ReactNode>>>
type DropdownMenuItem_Own_onSelect = Assert<Has<P_DropdownMenuItem, "onSelect">>
type DropdownMenuItem_Optional_onSelect = Assert<Exact<IsOptional<P_DropdownMenuItem, "onSelect">, true>>
type DropdownMenuItem_Type_onSelect = Assert<Exact<NonNullable<P_DropdownMenuItem["onSelect"]>, NonNullable<(event: Event) => void>>>
type DropdownMenuItem_Own_shortcut = Assert<Has<P_DropdownMenuItem, "shortcut">>
type DropdownMenuItem_Optional_shortcut = Assert<Exact<IsOptional<P_DropdownMenuItem, "shortcut">, true>>
type DropdownMenuItem_Type_shortcut = Assert<Exact<NonNullable<P_DropdownMenuItem["shortcut"]>, NonNullable<React.ReactNode>>>

// DropdownMenuLabel: another exported part of the module
type P_DropdownMenuLabel = React.ComponentProps<typeof DropdownMenuLabel>

// DropdownMenuRadioGroup: another exported part of the module
type P_DropdownMenuRadioGroup = React.ComponentProps<typeof DropdownMenuRadioGroup>
type DropdownMenuRadioGroup_Own_onValueChange = Assert<Has<P_DropdownMenuRadioGroup, "onValueChange">>
type DropdownMenuRadioGroup_Optional_onValueChange = Assert<Exact<IsOptional<P_DropdownMenuRadioGroup, "onValueChange">, true>>
type DropdownMenuRadioGroup_Type_onValueChange = Assert<Exact<NonNullable<P_DropdownMenuRadioGroup["onValueChange"]>, NonNullable<(value: string) => void>>>
type DropdownMenuRadioGroup_Own_value = Assert<Has<P_DropdownMenuRadioGroup, "value">>
type DropdownMenuRadioGroup_Optional_value = Assert<Exact<IsOptional<P_DropdownMenuRadioGroup, "value">, true>>
type DropdownMenuRadioGroup_Type_value = Assert<Exact<NonNullable<P_DropdownMenuRadioGroup["value"]>, NonNullable<string>>>

// DropdownMenuRadioItem: another exported part of the module
type P_DropdownMenuRadioItem = React.ComponentProps<typeof DropdownMenuRadioItem>
type DropdownMenuRadioItem_Own_disabled = Assert<Has<P_DropdownMenuRadioItem, "disabled">>
type DropdownMenuRadioItem_Optional_disabled = Assert<Exact<IsOptional<P_DropdownMenuRadioItem, "disabled">, true>>
type DropdownMenuRadioItem_Type_disabled = Assert<Exact<NonNullable<P_DropdownMenuRadioItem["disabled"]>, NonNullable<boolean>>>
type DropdownMenuRadioItem_Own_onSelect = Assert<Has<P_DropdownMenuRadioItem, "onSelect">>
type DropdownMenuRadioItem_Optional_onSelect = Assert<Exact<IsOptional<P_DropdownMenuRadioItem, "onSelect">, true>>
type DropdownMenuRadioItem_Type_onSelect = Assert<Exact<NonNullable<P_DropdownMenuRadioItem["onSelect"]>, NonNullable<(event: Event) => void>>>
type DropdownMenuRadioItem_Own_shortcut = Assert<Has<P_DropdownMenuRadioItem, "shortcut">>
type DropdownMenuRadioItem_Optional_shortcut = Assert<Exact<IsOptional<P_DropdownMenuRadioItem, "shortcut">, true>>
type DropdownMenuRadioItem_Type_shortcut = Assert<Exact<NonNullable<P_DropdownMenuRadioItem["shortcut"]>, NonNullable<React.ReactNode>>>
type DropdownMenuRadioItem_Own_value = Assert<Has<P_DropdownMenuRadioItem, "value">>
type DropdownMenuRadioItem_Optional_value = Assert<Exact<IsOptional<P_DropdownMenuRadioItem, "value">, false>>
type DropdownMenuRadioItem_Type_value = Assert<Exact<NonNullable<P_DropdownMenuRadioItem["value"]>, NonNullable<string>>>

// DropdownMenuSeparator: another exported part of the module
type P_DropdownMenuSeparator = React.ComponentProps<typeof DropdownMenuSeparator>

// DropdownMenuSub: another exported part of the module
type P_DropdownMenuSub = React.ComponentProps<typeof DropdownMenuSub>
type DropdownMenuSub_Own_children = Assert<Has<P_DropdownMenuSub, "children">>
type DropdownMenuSub_Optional_children = Assert<Exact<IsOptional<P_DropdownMenuSub, "children">, true>>
type DropdownMenuSub_Type_children = Assert<Exact<NonNullable<P_DropdownMenuSub["children"]>, NonNullable<React.ReactNode>>>

// DropdownMenuSubContent: another exported part of the module
type P_DropdownMenuSubContent = React.ComponentProps<typeof DropdownMenuSubContent>

// DropdownMenuSubTrigger: another exported part of the module
type P_DropdownMenuSubTrigger = React.ComponentProps<typeof DropdownMenuSubTrigger>
type DropdownMenuSubTrigger_Own_disabled = Assert<Has<P_DropdownMenuSubTrigger, "disabled">>
type DropdownMenuSubTrigger_Optional_disabled = Assert<Exact<IsOptional<P_DropdownMenuSubTrigger, "disabled">, true>>
type DropdownMenuSubTrigger_Type_disabled = Assert<Exact<NonNullable<P_DropdownMenuSubTrigger["disabled"]>, NonNullable<boolean>>>
type DropdownMenuSubTrigger_Own_icon = Assert<Has<P_DropdownMenuSubTrigger, "icon">>
type DropdownMenuSubTrigger_Optional_icon = Assert<Exact<IsOptional<P_DropdownMenuSubTrigger, "icon">, true>>
type DropdownMenuSubTrigger_Type_icon = Assert<Exact<NonNullable<P_DropdownMenuSubTrigger["icon"]>, NonNullable<React.ReactNode>>>

// DropdownMenuTrigger: another exported part of the module
type P_DropdownMenuTrigger = React.ComponentProps<typeof DropdownMenuTrigger>
type DropdownMenuTrigger_Own_asChild = Assert<Has<P_DropdownMenuTrigger, "asChild">>
type DropdownMenuTrigger_Optional_asChild = Assert<Exact<IsOptional<P_DropdownMenuTrigger, "asChild">, true>>
type DropdownMenuTrigger_Type_asChild = Assert<Exact<NonNullable<P_DropdownMenuTrigger["asChild"]>, NonNullable<boolean>>>

// exported types of the module
type Type_DropdownMenuSide = Assert<Exact<DropdownMenuSide, "bottom" | "top">>
