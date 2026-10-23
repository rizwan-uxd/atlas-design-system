// GENERATED — do not hand-edit. registry-build from packages/registry/generated/NavBar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { NavBar, NavBarHeader, NavBarHeaderActions, NavBarHeaderLeading, NavBarHeaderTitle, NavBarSize, NavBarTab, NavBarTabBar, NavBarVariant, NavLink } from "@atlas/ui-web/layouts/NavBar/NavBar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof NavBar>

// own props of NavBar: deleting one, flipping its optionality or changing its type fails here
type Own_actions = Assert<Has<P, "actions">>
type Optional_actions = Assert<Exact<IsOptional<P, "actions">, true>>
type Type_actions = Assert<Exact<NonNullable<P["actions"]>, NonNullable<React.ReactNode>>>
type Own_brand = Assert<Has<P, "brand">>
type Optional_brand = Assert<Exact<IsOptional<P, "brand">, true>>
type Type_brand = Assert<Exact<NonNullable<P["brand"]>, NonNullable<React.ReactNode>>>
type Own_brandHref = Assert<Has<P, "brandHref">>
type Optional_brandHref = Assert<Exact<IsOptional<P, "brandHref">, true>>
type Type_brandHref = Assert<Exact<NonNullable<P["brandHref"]>, NonNullable<string>>>
type Own_breadcrumb = Assert<Has<P, "breadcrumb">>
type Optional_breadcrumb = Assert<Exact<IsOptional<P, "breadcrumb">, true>>
type Type_breadcrumb = Assert<Exact<NonNullable<P["breadcrumb"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_hideOnScroll = Assert<Has<P, "hideOnScroll">>
type Optional_hideOnScroll = Assert<Exact<IsOptional<P, "hideOnScroll">, true>>
type Type_hideOnScroll = Assert<Exact<NonNullable<P["hideOnScroll"]>, NonNullable<boolean>>>
type Own_links = Assert<Has<P, "links">>
type Optional_links = Assert<Exact<IsOptional<P, "links">, true>>
type Type_links = Assert<Exact<NonNullable<P["links"]>, NonNullable<NavLink[]>>>
type Own_search = Assert<Has<P, "search">>
type Optional_search = Assert<Exact<IsOptional<P, "search">, true>>
type Type_search = Assert<Exact<NonNullable<P["search"]>, NonNullable<React.ReactNode>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<NavBarSize>>>
type Own_style = Assert<Has<P, "style">>
type Optional_style = Assert<Exact<IsOptional<P, "style">, true>>
type Type_style = Assert<Exact<NonNullable<P["style"]>, NonNullable<React.CSSProperties>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<NavBarVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "bordered" | "default" | "floating" | "transparent">>

// NavBarHeader: another exported part of the module
type P_NavBarHeader = React.ComponentProps<typeof NavBarHeader>
type NavBarHeader_Own_children = Assert<Has<P_NavBarHeader, "children">>
type NavBarHeader_Optional_children = Assert<Exact<IsOptional<P_NavBarHeader, "children">, true>>
type NavBarHeader_Type_children = Assert<Exact<NonNullable<P_NavBarHeader["children"]>, NonNullable<React.ReactNode>>>
type NavBarHeader_Own_className = Assert<Has<P_NavBarHeader, "className">>
type NavBarHeader_Optional_className = Assert<Exact<IsOptional<P_NavBarHeader, "className">, true>>
type NavBarHeader_Type_className = Assert<Exact<NonNullable<P_NavBarHeader["className"]>, NonNullable<string>>>
type NavBarHeader_Own_size = Assert<Has<P_NavBarHeader, "size">>
type NavBarHeader_Optional_size = Assert<Exact<IsOptional<P_NavBarHeader, "size">, true>>
type NavBarHeader_Type_size = Assert<Exact<NonNullable<P_NavBarHeader["size"]>, NonNullable<NavBarSize>>>
type NavBarHeader_Own_variant = Assert<Has<P_NavBarHeader, "variant">>
type NavBarHeader_Optional_variant = Assert<Exact<IsOptional<P_NavBarHeader, "variant">, true>>
type NavBarHeader_Type_variant = Assert<Exact<NonNullable<P_NavBarHeader["variant"]>, NonNullable<NavBarVariant>>>
type NavBarHeader_Union_size = Assert<Exact<NonNullable<P_NavBarHeader["size"]>, "lg" | "md" | "sm">>
type NavBarHeader_Union_variant = Assert<Exact<NonNullable<P_NavBarHeader["variant"]>, "bordered" | "default" | "floating" | "transparent">>

// NavBarHeaderActions: another exported part of the module
type P_NavBarHeaderActions = React.ComponentProps<typeof NavBarHeaderActions>
type NavBarHeaderActions_Own_children = Assert<Has<P_NavBarHeaderActions, "children">>
type NavBarHeaderActions_Optional_children = Assert<Exact<IsOptional<P_NavBarHeaderActions, "children">, true>>
type NavBarHeaderActions_Type_children = Assert<Exact<NonNullable<P_NavBarHeaderActions["children"]>, NonNullable<React.ReactNode>>>
type NavBarHeaderActions_Own_className = Assert<Has<P_NavBarHeaderActions, "className">>
type NavBarHeaderActions_Optional_className = Assert<Exact<IsOptional<P_NavBarHeaderActions, "className">, true>>
type NavBarHeaderActions_Type_className = Assert<Exact<NonNullable<P_NavBarHeaderActions["className"]>, NonNullable<string>>>

// NavBarHeaderLeading: another exported part of the module
type P_NavBarHeaderLeading = React.ComponentProps<typeof NavBarHeaderLeading>
type NavBarHeaderLeading_Own_children = Assert<Has<P_NavBarHeaderLeading, "children">>
type NavBarHeaderLeading_Optional_children = Assert<Exact<IsOptional<P_NavBarHeaderLeading, "children">, true>>
type NavBarHeaderLeading_Type_children = Assert<Exact<NonNullable<P_NavBarHeaderLeading["children"]>, NonNullable<React.ReactNode>>>
type NavBarHeaderLeading_Own_className = Assert<Has<P_NavBarHeaderLeading, "className">>
type NavBarHeaderLeading_Optional_className = Assert<Exact<IsOptional<P_NavBarHeaderLeading, "className">, true>>
type NavBarHeaderLeading_Type_className = Assert<Exact<NonNullable<P_NavBarHeaderLeading["className"]>, NonNullable<string>>>

// NavBarHeaderTitle: another exported part of the module
type P_NavBarHeaderTitle = React.ComponentProps<typeof NavBarHeaderTitle>
type NavBarHeaderTitle_Own_children = Assert<Has<P_NavBarHeaderTitle, "children">>
type NavBarHeaderTitle_Optional_children = Assert<Exact<IsOptional<P_NavBarHeaderTitle, "children">, true>>
type NavBarHeaderTitle_Type_children = Assert<Exact<NonNullable<P_NavBarHeaderTitle["children"]>, NonNullable<React.ReactNode>>>
type NavBarHeaderTitle_Own_className = Assert<Has<P_NavBarHeaderTitle, "className">>
type NavBarHeaderTitle_Optional_className = Assert<Exact<IsOptional<P_NavBarHeaderTitle, "className">, true>>
type NavBarHeaderTitle_Type_className = Assert<Exact<NonNullable<P_NavBarHeaderTitle["className"]>, NonNullable<string>>>

// NavBarTab: another exported part of the module
type P_NavBarTab = React.ComponentProps<typeof NavBarTab>
type NavBarTab_Own_active = Assert<Has<P_NavBarTab, "active">>
type NavBarTab_Optional_active = Assert<Exact<IsOptional<P_NavBarTab, "active">, true>>
type NavBarTab_Type_active = Assert<Exact<NonNullable<P_NavBarTab["active"]>, NonNullable<boolean>>>
type NavBarTab_Own_badge = Assert<Has<P_NavBarTab, "badge">>
type NavBarTab_Optional_badge = Assert<Exact<IsOptional<P_NavBarTab, "badge">, true>>
type NavBarTab_Type_badge = Assert<Exact<NonNullable<P_NavBarTab["badge"]>, NonNullable<React.ReactNode>>>
type NavBarTab_Own_className = Assert<Has<P_NavBarTab, "className">>
type NavBarTab_Optional_className = Assert<Exact<IsOptional<P_NavBarTab, "className">, true>>
type NavBarTab_Type_className = Assert<Exact<NonNullable<P_NavBarTab["className"]>, NonNullable<string>>>
type NavBarTab_Own_disabled = Assert<Has<P_NavBarTab, "disabled">>
type NavBarTab_Optional_disabled = Assert<Exact<IsOptional<P_NavBarTab, "disabled">, true>>
type NavBarTab_Type_disabled = Assert<Exact<NonNullable<P_NavBarTab["disabled"]>, NonNullable<boolean>>>
type NavBarTab_Own_icon = Assert<Has<P_NavBarTab, "icon">>
type NavBarTab_Optional_icon = Assert<Exact<IsOptional<P_NavBarTab, "icon">, true>>
type NavBarTab_Type_icon = Assert<Exact<NonNullable<P_NavBarTab["icon"]>, NonNullable<React.ReactNode>>>
type NavBarTab_Own_label = Assert<Has<P_NavBarTab, "label">>
type NavBarTab_Optional_label = Assert<Exact<IsOptional<P_NavBarTab, "label">, false>>
type NavBarTab_Type_label = Assert<Exact<NonNullable<P_NavBarTab["label"]>, NonNullable<string>>>
type NavBarTab_Own_onClick = Assert<Has<P_NavBarTab, "onClick">>
type NavBarTab_Optional_onClick = Assert<Exact<IsOptional<P_NavBarTab, "onClick">, true>>
type NavBarTab_Type_onClick = Assert<Exact<NonNullable<P_NavBarTab["onClick"]>, NonNullable<(value: string) => void>>>
type NavBarTab_Own_value = Assert<Has<P_NavBarTab, "value">>
type NavBarTab_Optional_value = Assert<Exact<IsOptional<P_NavBarTab, "value">, false>>
type NavBarTab_Type_value = Assert<Exact<NonNullable<P_NavBarTab["value"]>, NonNullable<string>>>

// NavBarTabBar: another exported part of the module
type P_NavBarTabBar = React.ComponentProps<typeof NavBarTabBar>
type NavBarTabBar_Own_children = Assert<Has<P_NavBarTabBar, "children">>
type NavBarTabBar_Optional_children = Assert<Exact<IsOptional<P_NavBarTabBar, "children">, true>>
type NavBarTabBar_Type_children = Assert<Exact<NonNullable<P_NavBarTabBar["children"]>, NonNullable<React.ReactNode>>>
type NavBarTabBar_Own_className = Assert<Has<P_NavBarTabBar, "className">>
type NavBarTabBar_Optional_className = Assert<Exact<IsOptional<P_NavBarTabBar, "className">, true>>
type NavBarTabBar_Type_className = Assert<Exact<NonNullable<P_NavBarTabBar["className"]>, NonNullable<string>>>
type NavBarTabBar_Own_size = Assert<Has<P_NavBarTabBar, "size">>
type NavBarTabBar_Optional_size = Assert<Exact<IsOptional<P_NavBarTabBar, "size">, true>>
type NavBarTabBar_Type_size = Assert<Exact<NonNullable<P_NavBarTabBar["size"]>, NonNullable<NavBarSize>>>
type NavBarTabBar_Union_size = Assert<Exact<NonNullable<P_NavBarTabBar["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type Type_NavBarSize = Assert<Exact<NavBarSize, "lg" | "md" | "sm">>
type Type_NavBarVariant = Assert<Exact<NavBarVariant, "bordered" | "default" | "floating" | "transparent">>
type NavLink_Own_active = Assert<Has<NavLink, "active">>
type NavLink_Optional_active = Assert<Exact<IsOptional<NavLink, "active">, true>>
type NavLink_Type_active = Assert<Exact<NonNullable<NavLink["active"]>, NonNullable<boolean>>>
type NavLink_Own_badge = Assert<Has<NavLink, "badge">>
type NavLink_Optional_badge = Assert<Exact<IsOptional<NavLink, "badge">, true>>
type NavLink_Type_badge = Assert<Exact<NonNullable<NavLink["badge"]>, NonNullable<React.ReactNode>>>
type NavLink_Own_disabled = Assert<Has<NavLink, "disabled">>
type NavLink_Optional_disabled = Assert<Exact<IsOptional<NavLink, "disabled">, true>>
type NavLink_Type_disabled = Assert<Exact<NonNullable<NavLink["disabled"]>, NonNullable<boolean>>>
type NavLink_Own_href = Assert<Has<NavLink, "href">>
type NavLink_Optional_href = Assert<Exact<IsOptional<NavLink, "href">, true>>
type NavLink_Type_href = Assert<Exact<NonNullable<NavLink["href"]>, NonNullable<string>>>
type NavLink_Own_label = Assert<Has<NavLink, "label">>
type NavLink_Optional_label = Assert<Exact<IsOptional<NavLink, "label">, false>>
type NavLink_Type_label = Assert<Exact<NonNullable<NavLink["label"]>, NonNullable<string>>>
type NavLink_Own_leadingIcon = Assert<Has<NavLink, "leadingIcon">>
type NavLink_Optional_leadingIcon = Assert<Exact<IsOptional<NavLink, "leadingIcon">, true>>
type NavLink_Type_leadingIcon = Assert<Exact<NonNullable<NavLink["leadingIcon"]>, NonNullable<React.ReactNode>>>
type NavLink_Keys = Assert<Exact<keyof NavLink, "active" | "badge" | "disabled" | "href" | "label" | "leadingIcon">>
