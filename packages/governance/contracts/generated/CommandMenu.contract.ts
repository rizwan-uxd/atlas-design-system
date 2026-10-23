// GENERATED — do not hand-edit. registry-build from packages/registry/generated/CommandMenu.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { CommandMenu, CommandMenuContent, CommandMenuFilter, CommandMenuGroup, CommandMenuItem, CommandMenuSize } from "@atlas/ui-web/compositions/CommandMenu/CommandMenu"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof CommandMenuContent>

// own props of CommandMenuContent: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_closeOnSelect = Assert<Has<P, "closeOnSelect">>
type Optional_closeOnSelect = Assert<Exact<IsOptional<P, "closeOnSelect">, true>>
type Type_closeOnSelect = Assert<Exact<NonNullable<P["closeOnSelect"]>, NonNullable<boolean>>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Type_defaultValue = Assert<Exact<NonNullable<P["defaultValue"]>, NonNullable<string>>>
type Own_emptyText = Assert<Has<P, "emptyText">>
type Optional_emptyText = Assert<Exact<IsOptional<P, "emptyText">, true>>
type Type_emptyText = Assert<Exact<NonNullable<P["emptyText"]>, NonNullable<string>>>
type Own_filter = Assert<Has<P, "filter">>
type Optional_filter = Assert<Exact<IsOptional<P, "filter">, true>>
type Type_filter = Assert<Exact<NonNullable<P["filter"]>, NonNullable<CommandMenuFilter | false>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, true>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<string>>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Type_loading = Assert<Exact<NonNullable<P["loading"]>, NonNullable<boolean>>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Type_onValueChange = Assert<Exact<NonNullable<P["onValueChange"]>, NonNullable<(value: string) => void>>>
type Own_placeholder = Assert<Has<P, "placeholder">>
type Optional_placeholder = Assert<Exact<IsOptional<P, "placeholder">, true>>
type Type_placeholder = Assert<Exact<NonNullable<P["placeholder"]>, NonNullable<string>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<CommandMenuSize>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<string>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md">>

// CommandMenu: another exported part of the module
type P_CommandMenu = React.ComponentProps<typeof CommandMenu>
type CommandMenu_Own_children = Assert<Has<P_CommandMenu, "children">>
type CommandMenu_Optional_children = Assert<Exact<IsOptional<P_CommandMenu, "children">, true>>
type CommandMenu_Type_children = Assert<Exact<NonNullable<P_CommandMenu["children"]>, NonNullable<React.ReactNode>>>
type CommandMenu_Own_defaultOpen = Assert<Has<P_CommandMenu, "defaultOpen">>
type CommandMenu_Optional_defaultOpen = Assert<Exact<IsOptional<P_CommandMenu, "defaultOpen">, true>>
type CommandMenu_Type_defaultOpen = Assert<Exact<NonNullable<P_CommandMenu["defaultOpen"]>, NonNullable<boolean>>>
type CommandMenu_Own_hotkey = Assert<Has<P_CommandMenu, "hotkey">>
type CommandMenu_Optional_hotkey = Assert<Exact<IsOptional<P_CommandMenu, "hotkey">, true>>
type CommandMenu_Type_hotkey = Assert<Exact<NonNullable<P_CommandMenu["hotkey"]>, NonNullable<string | false>>>
type CommandMenu_Own_onOpenChange = Assert<Has<P_CommandMenu, "onOpenChange">>
type CommandMenu_Optional_onOpenChange = Assert<Exact<IsOptional<P_CommandMenu, "onOpenChange">, true>>
type CommandMenu_Type_onOpenChange = Assert<Exact<NonNullable<P_CommandMenu["onOpenChange"]>, NonNullable<(open: boolean) => void>>>
type CommandMenu_Own_open = Assert<Has<P_CommandMenu, "open">>
type CommandMenu_Optional_open = Assert<Exact<IsOptional<P_CommandMenu, "open">, true>>
type CommandMenu_Type_open = Assert<Exact<NonNullable<P_CommandMenu["open"]>, NonNullable<boolean>>>

// CommandMenuGroup: another exported part of the module
type P_CommandMenuGroup = React.ComponentProps<typeof CommandMenuGroup>
type CommandMenuGroup_Own_heading = Assert<Has<P_CommandMenuGroup, "heading">>
type CommandMenuGroup_Optional_heading = Assert<Exact<IsOptional<P_CommandMenuGroup, "heading">, true>>
type CommandMenuGroup_Type_heading = Assert<Exact<NonNullable<P_CommandMenuGroup["heading"]>, NonNullable<React.ReactNode>>>

// CommandMenuItem: another exported part of the module
type P_CommandMenuItem = React.ComponentProps<typeof CommandMenuItem>
type CommandMenuItem_Own_disabled = Assert<Has<P_CommandMenuItem, "disabled">>
type CommandMenuItem_Optional_disabled = Assert<Exact<IsOptional<P_CommandMenuItem, "disabled">, true>>
type CommandMenuItem_Type_disabled = Assert<Exact<NonNullable<P_CommandMenuItem["disabled"]>, NonNullable<boolean>>>
type CommandMenuItem_Own_icon = Assert<Has<P_CommandMenuItem, "icon">>
type CommandMenuItem_Optional_icon = Assert<Exact<IsOptional<P_CommandMenuItem, "icon">, true>>
type CommandMenuItem_Type_icon = Assert<Exact<NonNullable<P_CommandMenuItem["icon"]>, NonNullable<React.ReactNode>>>
type CommandMenuItem_Own_keywords = Assert<Has<P_CommandMenuItem, "keywords">>
type CommandMenuItem_Optional_keywords = Assert<Exact<IsOptional<P_CommandMenuItem, "keywords">, true>>
type CommandMenuItem_Type_keywords = Assert<Exact<NonNullable<P_CommandMenuItem["keywords"]>, NonNullable<string[]>>>
type CommandMenuItem_Own_onSelect = Assert<Has<P_CommandMenuItem, "onSelect">>
type CommandMenuItem_Optional_onSelect = Assert<Exact<IsOptional<P_CommandMenuItem, "onSelect">, true>>
type CommandMenuItem_Type_onSelect = Assert<Exact<NonNullable<P_CommandMenuItem["onSelect"]>, NonNullable<(value: string) => void>>>
type CommandMenuItem_Own_shortcut = Assert<Has<P_CommandMenuItem, "shortcut">>
type CommandMenuItem_Optional_shortcut = Assert<Exact<IsOptional<P_CommandMenuItem, "shortcut">, true>>
type CommandMenuItem_Type_shortcut = Assert<Exact<NonNullable<P_CommandMenuItem["shortcut"]>, NonNullable<string>>>
type CommandMenuItem_Own_value = Assert<Has<P_CommandMenuItem, "value">>
type CommandMenuItem_Optional_value = Assert<Exact<IsOptional<P_CommandMenuItem, "value">, true>>
type CommandMenuItem_Type_value = Assert<Exact<NonNullable<P_CommandMenuItem["value"]>, NonNullable<string>>>

// exported types of the module
type Type_CommandMenuFilter = Assert<Exact<CommandMenuFilter, (value: string, query: string, keywords?: string[]) => boolean>>
type Type_CommandMenuSize = Assert<Exact<CommandMenuSize, "lg" | "md">>

// CommandMenuItem: absent by design (packages/registry/contract-props.json)
/** The roles are fixed so the combobox and listbox pattern cannot be broken from outside. */
type CommandMenuItem_Absent_role = Assert<Exact<Has<P_CommandMenuItem, "role">, false>>

// CommandMenuGroup: absent by design (packages/registry/contract-props.json)
/** The roles are fixed so the combobox and listbox pattern cannot be broken from outside. */
type CommandMenuGroup_Absent_role = Assert<Exact<Has<P_CommandMenuGroup, "role">, false>>
