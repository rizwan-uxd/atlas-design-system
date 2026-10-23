// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Breadcrumb.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Breadcrumb, BreadcrumbDropdown, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbSeparatorStyle } from "@atlas/ui-web/patterns/Breadcrumb/Breadcrumb"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Breadcrumb>

// own props of Breadcrumb: deleting one, flipping its optionality or changing its type fails here
type Own_separator = Assert<Has<P, "separator">>
type Optional_separator = Assert<Exact<IsOptional<P, "separator">, true>>
type Type_separator = Assert<Exact<NonNullable<P["separator"]>, NonNullable<BreadcrumbSeparatorStyle>>>
type Union_separator = Assert<Exact<NonNullable<P["separator"]>, "chevron" | "dot">>

// BreadcrumbDropdown: another exported part of the module
type P_BreadcrumbDropdown = React.ComponentProps<typeof BreadcrumbDropdown>
type BreadcrumbDropdown_Own_expanded = Assert<Has<P_BreadcrumbDropdown, "expanded">>
type BreadcrumbDropdown_Optional_expanded = Assert<Exact<IsOptional<P_BreadcrumbDropdown, "expanded">, true>>
type BreadcrumbDropdown_Type_expanded = Assert<Exact<NonNullable<P_BreadcrumbDropdown["expanded"]>, NonNullable<boolean>>>

// BreadcrumbEllipsis: another exported part of the module
type P_BreadcrumbEllipsis = React.ComponentProps<typeof BreadcrumbEllipsis>
type BreadcrumbEllipsis_Own_label = Assert<Has<P_BreadcrumbEllipsis, "label">>
type BreadcrumbEllipsis_Optional_label = Assert<Exact<IsOptional<P_BreadcrumbEllipsis, "label">, true>>
type BreadcrumbEllipsis_Type_label = Assert<Exact<NonNullable<P_BreadcrumbEllipsis["label"]>, NonNullable<string>>>

// BreadcrumbItem: another exported part of the module
type P_BreadcrumbItem = React.ComponentProps<typeof BreadcrumbItem>

// BreadcrumbLink: another exported part of the module
type P_BreadcrumbLink = React.ComponentProps<typeof BreadcrumbLink>

// BreadcrumbList: another exported part of the module
type P_BreadcrumbList = React.ComponentProps<typeof BreadcrumbList>

// BreadcrumbPage: another exported part of the module
type P_BreadcrumbPage = React.ComponentProps<typeof BreadcrumbPage>

// BreadcrumbSeparator: another exported part of the module
type P_BreadcrumbSeparator = React.ComponentProps<typeof BreadcrumbSeparator>

// exported types of the module
type Type_BreadcrumbSeparatorStyle = Assert<Exact<BreadcrumbSeparatorStyle, "chevron" | "dot">>
