// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Sidebar.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Sidebar, SidebarBody, SidebarCollapseToggle, SidebarFooter, SidebarHeader, SidebarSection } from "@atlas/ui-web/layouts/Sidebar/Sidebar"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Sidebar>

// own props of Sidebar: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_collapsed = Assert<Has<P, "collapsed">>
type Optional_collapsed = Assert<Exact<IsOptional<P, "collapsed">, true>>
type Type_collapsed = Assert<Exact<NonNullable<P["collapsed"]>, NonNullable<boolean>>>
type Own_onCollapsedChange = Assert<Has<P, "onCollapsedChange">>
type Optional_onCollapsedChange = Assert<Exact<IsOptional<P, "onCollapsedChange">, true>>
type Type_onCollapsedChange = Assert<Exact<NonNullable<P["onCollapsedChange"]>, NonNullable<(collapsed: boolean) => void>>>

// SidebarBody: another exported part of the module
type P_SidebarBody = React.ComponentProps<typeof SidebarBody>
type SidebarBody_Own_children = Assert<Has<P_SidebarBody, "children">>
type SidebarBody_Optional_children = Assert<Exact<IsOptional<P_SidebarBody, "children">, true>>
type SidebarBody_Type_children = Assert<Exact<NonNullable<P_SidebarBody["children"]>, NonNullable<React.ReactNode>>>

// SidebarCollapseToggle: another exported part of the module
type P_SidebarCollapseToggle = React.ComponentProps<typeof SidebarCollapseToggle>

// SidebarFooter: another exported part of the module
type P_SidebarFooter = React.ComponentProps<typeof SidebarFooter>
type SidebarFooter_Own_children = Assert<Has<P_SidebarFooter, "children">>
type SidebarFooter_Optional_children = Assert<Exact<IsOptional<P_SidebarFooter, "children">, true>>
type SidebarFooter_Type_children = Assert<Exact<NonNullable<P_SidebarFooter["children"]>, NonNullable<React.ReactNode>>>

// SidebarHeader: another exported part of the module
type P_SidebarHeader = React.ComponentProps<typeof SidebarHeader>
type SidebarHeader_Own_children = Assert<Has<P_SidebarHeader, "children">>
type SidebarHeader_Optional_children = Assert<Exact<IsOptional<P_SidebarHeader, "children">, true>>
type SidebarHeader_Type_children = Assert<Exact<NonNullable<P_SidebarHeader["children"]>, NonNullable<React.ReactNode>>>

// SidebarSection: another exported part of the module
type P_SidebarSection = React.ComponentProps<typeof SidebarSection>
type SidebarSection_Own_children = Assert<Has<P_SidebarSection, "children">>
type SidebarSection_Optional_children = Assert<Exact<IsOptional<P_SidebarSection, "children">, true>>
type SidebarSection_Type_children = Assert<Exact<NonNullable<P_SidebarSection["children"]>, NonNullable<React.ReactNode>>>
type SidebarSection_Own_label = Assert<Has<P_SidebarSection, "label">>
type SidebarSection_Optional_label = Assert<Exact<IsOptional<P_SidebarSection, "label">, true>>
type SidebarSection_Type_label = Assert<Exact<NonNullable<P_SidebarSection["label"]>, NonNullable<string>>>
