// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Tabs.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { TabItem, Tabs, TabsList, TabsOrientation, TabsPanel, TabsRoot, TabsSize, TabsTrigger, TabsVariant } from "@atlas/ui-web/patterns/Tabs/Tabs"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Tabs>

// own props of Tabs: deleting one, flipping its optionality or changing its type fails here
type Own_activationMode = Assert<Has<P, "activationMode">>
type Optional_activationMode = Assert<Exact<IsOptional<P, "activationMode">, true>>
type Type_activationMode = Assert<Exact<NonNullable<P["activationMode"]>, NonNullable<"automatic" | "manual">>>
type Own_activeTab = Assert<Has<P, "activeTab">>
type Optional_activeTab = Assert<Exact<IsOptional<P, "activeTab">, true>>
type Type_activeTab = Assert<Exact<NonNullable<P["activeTab"]>, NonNullable<string>>>
type Own_animated = Assert<Has<P, "animated">>
type Optional_animated = Assert<Exact<IsOptional<P, "animated">, true>>
type Type_animated = Assert<Exact<NonNullable<P["animated"]>, NonNullable<boolean>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_defaultTab = Assert<Has<P, "defaultTab">>
type Optional_defaultTab = Assert<Exact<IsOptional<P, "defaultTab">, true>>
type Type_defaultTab = Assert<Exact<NonNullable<P["defaultTab"]>, NonNullable<string>>>
type Own_defaultValue = Assert<Has<P, "defaultValue">>
type Optional_defaultValue = Assert<Exact<IsOptional<P, "defaultValue">, true>>
type Type_defaultValue = Assert<Exact<NonNullable<P["defaultValue"]>, NonNullable<string>>>
type Own_items = Assert<Has<P, "items">>
type Optional_items = Assert<Exact<IsOptional<P, "items">, false>>
type Type_items = Assert<Exact<NonNullable<P["items"]>, NonNullable<TabItem[]>>>
type Own_onTabChange = Assert<Has<P, "onTabChange">>
type Optional_onTabChange = Assert<Exact<IsOptional<P, "onTabChange">, true>>
type Type_onTabChange = Assert<Exact<NonNullable<P["onTabChange"]>, NonNullable<(value: string) => void>>>
type Own_onValueChange = Assert<Has<P, "onValueChange">>
type Optional_onValueChange = Assert<Exact<IsOptional<P, "onValueChange">, true>>
type Type_onValueChange = Assert<Exact<NonNullable<P["onValueChange"]>, NonNullable<(value: string) => void>>>
type Own_orientation = Assert<Has<P, "orientation">>
type Optional_orientation = Assert<Exact<IsOptional<P, "orientation">, true>>
type Type_orientation = Assert<Exact<NonNullable<P["orientation"]>, NonNullable<TabsOrientation>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<TabsSize>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, true>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<string>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<TabsVariant>>>
type Union_activationMode = Assert<Exact<NonNullable<P["activationMode"]>, "automatic" | "manual">>
type Union_orientation = Assert<Exact<NonNullable<P["orientation"]>, "horizontal" | "vertical">>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "line" | "outline" | "pill" | "segmented">>

// TabsList: another exported part of the module
type P_TabsList = React.ComponentProps<typeof TabsList>
type TabsList_Own_aria_label = Assert<Has<P_TabsList, "aria-label">>
type TabsList_Optional_aria_label = Assert<Exact<IsOptional<P_TabsList, "aria-label">, true>>
type TabsList_Type_aria_label = Assert<Exact<NonNullable<P_TabsList["aria-label"]>, NonNullable<string>>>
type TabsList_Own_children = Assert<Has<P_TabsList, "children">>
type TabsList_Optional_children = Assert<Exact<IsOptional<P_TabsList, "children">, true>>
type TabsList_Type_children = Assert<Exact<NonNullable<P_TabsList["children"]>, NonNullable<React.ReactNode>>>
type TabsList_Own_className = Assert<Has<P_TabsList, "className">>
type TabsList_Optional_className = Assert<Exact<IsOptional<P_TabsList, "className">, true>>
type TabsList_Type_className = Assert<Exact<NonNullable<P_TabsList["className"]>, NonNullable<string>>>

// TabsPanel: another exported part of the module
type P_TabsPanel = React.ComponentProps<typeof TabsPanel>
type TabsPanel_Own_children = Assert<Has<P_TabsPanel, "children">>
type TabsPanel_Optional_children = Assert<Exact<IsOptional<P_TabsPanel, "children">, true>>
type TabsPanel_Type_children = Assert<Exact<NonNullable<P_TabsPanel["children"]>, NonNullable<React.ReactNode>>>
type TabsPanel_Own_className = Assert<Has<P_TabsPanel, "className">>
type TabsPanel_Optional_className = Assert<Exact<IsOptional<P_TabsPanel, "className">, true>>
type TabsPanel_Type_className = Assert<Exact<NonNullable<P_TabsPanel["className"]>, NonNullable<string>>>
type TabsPanel_Own_forceMount = Assert<Has<P_TabsPanel, "forceMount">>
type TabsPanel_Optional_forceMount = Assert<Exact<IsOptional<P_TabsPanel, "forceMount">, true>>
type TabsPanel_Type_forceMount = Assert<Exact<NonNullable<P_TabsPanel["forceMount"]>, NonNullable<true>>>
type TabsPanel_Own_value = Assert<Has<P_TabsPanel, "value">>
type TabsPanel_Optional_value = Assert<Exact<IsOptional<P_TabsPanel, "value">, false>>
type TabsPanel_Type_value = Assert<Exact<NonNullable<P_TabsPanel["value"]>, NonNullable<string>>>

// TabsRoot: another exported part of the module
type P_TabsRoot = React.ComponentProps<typeof TabsRoot>
type TabsRoot_Own_activationMode = Assert<Has<P_TabsRoot, "activationMode">>
type TabsRoot_Optional_activationMode = Assert<Exact<IsOptional<P_TabsRoot, "activationMode">, true>>
type TabsRoot_Type_activationMode = Assert<Exact<NonNullable<P_TabsRoot["activationMode"]>, NonNullable<"automatic" | "manual">>>
type TabsRoot_Own_animated = Assert<Has<P_TabsRoot, "animated">>
type TabsRoot_Optional_animated = Assert<Exact<IsOptional<P_TabsRoot, "animated">, true>>
type TabsRoot_Type_animated = Assert<Exact<NonNullable<P_TabsRoot["animated"]>, NonNullable<boolean>>>
type TabsRoot_Own_children = Assert<Has<P_TabsRoot, "children">>
type TabsRoot_Optional_children = Assert<Exact<IsOptional<P_TabsRoot, "children">, true>>
type TabsRoot_Type_children = Assert<Exact<NonNullable<P_TabsRoot["children"]>, NonNullable<React.ReactNode>>>
type TabsRoot_Own_className = Assert<Has<P_TabsRoot, "className">>
type TabsRoot_Optional_className = Assert<Exact<IsOptional<P_TabsRoot, "className">, true>>
type TabsRoot_Type_className = Assert<Exact<NonNullable<P_TabsRoot["className"]>, NonNullable<string>>>
type TabsRoot_Own_defaultValue = Assert<Has<P_TabsRoot, "defaultValue">>
type TabsRoot_Optional_defaultValue = Assert<Exact<IsOptional<P_TabsRoot, "defaultValue">, true>>
type TabsRoot_Type_defaultValue = Assert<Exact<NonNullable<P_TabsRoot["defaultValue"]>, NonNullable<string>>>
type TabsRoot_Own_onValueChange = Assert<Has<P_TabsRoot, "onValueChange">>
type TabsRoot_Optional_onValueChange = Assert<Exact<IsOptional<P_TabsRoot, "onValueChange">, true>>
type TabsRoot_Type_onValueChange = Assert<Exact<NonNullable<P_TabsRoot["onValueChange"]>, NonNullable<(value: string) => void>>>
type TabsRoot_Own_orientation = Assert<Has<P_TabsRoot, "orientation">>
type TabsRoot_Optional_orientation = Assert<Exact<IsOptional<P_TabsRoot, "orientation">, true>>
type TabsRoot_Type_orientation = Assert<Exact<NonNullable<P_TabsRoot["orientation"]>, NonNullable<TabsOrientation>>>
type TabsRoot_Own_size = Assert<Has<P_TabsRoot, "size">>
type TabsRoot_Optional_size = Assert<Exact<IsOptional<P_TabsRoot, "size">, true>>
type TabsRoot_Type_size = Assert<Exact<NonNullable<P_TabsRoot["size"]>, NonNullable<TabsSize>>>
type TabsRoot_Own_value = Assert<Has<P_TabsRoot, "value">>
type TabsRoot_Optional_value = Assert<Exact<IsOptional<P_TabsRoot, "value">, true>>
type TabsRoot_Type_value = Assert<Exact<NonNullable<P_TabsRoot["value"]>, NonNullable<string>>>
type TabsRoot_Own_variant = Assert<Has<P_TabsRoot, "variant">>
type TabsRoot_Optional_variant = Assert<Exact<IsOptional<P_TabsRoot, "variant">, true>>
type TabsRoot_Type_variant = Assert<Exact<NonNullable<P_TabsRoot["variant"]>, NonNullable<TabsVariant>>>
type TabsRoot_Union_activationMode = Assert<Exact<NonNullable<P_TabsRoot["activationMode"]>, "automatic" | "manual">>
type TabsRoot_Union_orientation = Assert<Exact<NonNullable<P_TabsRoot["orientation"]>, "horizontal" | "vertical">>
type TabsRoot_Union_size = Assert<Exact<NonNullable<P_TabsRoot["size"]>, "lg" | "md" | "sm">>
type TabsRoot_Union_variant = Assert<Exact<NonNullable<P_TabsRoot["variant"]>, "line" | "outline" | "pill" | "segmented">>

// TabsTrigger: another exported part of the module
type P_TabsTrigger = React.ComponentProps<typeof TabsTrigger>
type TabsTrigger_Own_badge = Assert<Has<P_TabsTrigger, "badge">>
type TabsTrigger_Optional_badge = Assert<Exact<IsOptional<P_TabsTrigger, "badge">, true>>
type TabsTrigger_Type_badge = Assert<Exact<NonNullable<P_TabsTrigger["badge"]>, NonNullable<React.ReactNode>>>
type TabsTrigger_Own_children = Assert<Has<P_TabsTrigger, "children">>
type TabsTrigger_Optional_children = Assert<Exact<IsOptional<P_TabsTrigger, "children">, true>>
type TabsTrigger_Type_children = Assert<Exact<NonNullable<P_TabsTrigger["children"]>, NonNullable<React.ReactNode>>>
type TabsTrigger_Own_className = Assert<Has<P_TabsTrigger, "className">>
type TabsTrigger_Optional_className = Assert<Exact<IsOptional<P_TabsTrigger, "className">, true>>
type TabsTrigger_Type_className = Assert<Exact<NonNullable<P_TabsTrigger["className"]>, NonNullable<string>>>
type TabsTrigger_Own_disabled = Assert<Has<P_TabsTrigger, "disabled">>
type TabsTrigger_Optional_disabled = Assert<Exact<IsOptional<P_TabsTrigger, "disabled">, true>>
type TabsTrigger_Type_disabled = Assert<Exact<NonNullable<P_TabsTrigger["disabled"]>, NonNullable<boolean>>>
type TabsTrigger_Own_leadingIcon = Assert<Has<P_TabsTrigger, "leadingIcon">>
type TabsTrigger_Optional_leadingIcon = Assert<Exact<IsOptional<P_TabsTrigger, "leadingIcon">, true>>
type TabsTrigger_Type_leadingIcon = Assert<Exact<NonNullable<P_TabsTrigger["leadingIcon"]>, NonNullable<React.ReactNode>>>
type TabsTrigger_Own_value = Assert<Has<P_TabsTrigger, "value">>
type TabsTrigger_Optional_value = Assert<Exact<IsOptional<P_TabsTrigger, "value">, false>>
type TabsTrigger_Type_value = Assert<Exact<NonNullable<P_TabsTrigger["value"]>, NonNullable<string>>>

// exported types of the module
type TabItem_Own_badge = Assert<Has<TabItem, "badge">>
type TabItem_Optional_badge = Assert<Exact<IsOptional<TabItem, "badge">, true>>
type TabItem_Type_badge = Assert<Exact<NonNullable<TabItem["badge"]>, NonNullable<React.ReactNode>>>
type TabItem_Own_content = Assert<Has<TabItem, "content">>
type TabItem_Optional_content = Assert<Exact<IsOptional<TabItem, "content">, false>>
type TabItem_Type_content = Assert<Exact<NonNullable<TabItem["content"]>, NonNullable<React.ReactNode>>>
type TabItem_Own_disabled = Assert<Has<TabItem, "disabled">>
type TabItem_Optional_disabled = Assert<Exact<IsOptional<TabItem, "disabled">, true>>
type TabItem_Type_disabled = Assert<Exact<NonNullable<TabItem["disabled"]>, NonNullable<boolean>>>
type TabItem_Own_icon = Assert<Has<TabItem, "icon">>
type TabItem_Optional_icon = Assert<Exact<IsOptional<TabItem, "icon">, true>>
type TabItem_Type_icon = Assert<Exact<NonNullable<TabItem["icon"]>, NonNullable<React.ReactNode>>>
type TabItem_Own_id = Assert<Has<TabItem, "id">>
type TabItem_Optional_id = Assert<Exact<IsOptional<TabItem, "id">, false>>
type TabItem_Type_id = Assert<Exact<NonNullable<TabItem["id"]>, NonNullable<string>>>
type TabItem_Own_label = Assert<Has<TabItem, "label">>
type TabItem_Optional_label = Assert<Exact<IsOptional<TabItem, "label">, false>>
type TabItem_Type_label = Assert<Exact<NonNullable<TabItem["label"]>, NonNullable<React.ReactNode>>>
type TabItem_Keys = Assert<Exact<keyof TabItem, "badge" | "content" | "disabled" | "icon" | "id" | "label">>
type Type_TabsOrientation = Assert<Exact<TabsOrientation, "horizontal" | "vertical">>
type Type_TabsSize = Assert<Exact<TabsSize, "lg" | "md" | "sm">>
type Type_TabsVariant = Assert<Exact<TabsVariant, "line" | "outline" | "pill" | "segmented">>
