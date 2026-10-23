// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Card.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Card, CardContent, CardDescription, CardFooter, CardHeader, CardSize, CardTitle, CardVariant } from "@atlas/ui-web/compositions/Card/Card"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Card>

// own props of Card: deleting one, flipping its optionality or changing its type fails here
type Own_aria_label = Assert<Has<P, "aria-label">>
type Optional_aria_label = Assert<Exact<IsOptional<P, "aria-label">, true>>
type Type_aria_label = Assert<Exact<NonNullable<P["aria-label"]>, NonNullable<string>>>
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, true>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_interactive = Assert<Has<P, "interactive">>
type Optional_interactive = Assert<Exact<IsOptional<P, "interactive">, true>>
type Type_interactive = Assert<Exact<NonNullable<P["interactive"]>, NonNullable<boolean>>>
type Own_onClick = Assert<Has<P, "onClick">>
type Optional_onClick = Assert<Exact<IsOptional<P, "onClick">, true>>
type Type_onClick = Assert<Exact<NonNullable<P["onClick"]>, NonNullable<React.MouseEventHandler<HTMLElement>>>>
type Own_selected = Assert<Has<P, "selected">>
type Optional_selected = Assert<Exact<IsOptional<P, "selected">, true>>
type Type_selected = Assert<Exact<NonNullable<P["selected"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<CardSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<CardVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "elevated" | "filled" | "outlined">>

// CardContent: another exported part of the module
type P_CardContent = React.ComponentProps<typeof CardContent>
type CardContent_Own_children = Assert<Has<P_CardContent, "children">>
type CardContent_Optional_children = Assert<Exact<IsOptional<P_CardContent, "children">, true>>
type CardContent_Type_children = Assert<Exact<NonNullable<P_CardContent["children"]>, NonNullable<React.ReactNode>>>
type CardContent_Own_className = Assert<Has<P_CardContent, "className">>
type CardContent_Optional_className = Assert<Exact<IsOptional<P_CardContent, "className">, true>>
type CardContent_Type_className = Assert<Exact<NonNullable<P_CardContent["className"]>, NonNullable<string>>>

// CardDescription: another exported part of the module
type P_CardDescription = React.ComponentProps<typeof CardDescription>
type CardDescription_Own_children = Assert<Has<P_CardDescription, "children">>
type CardDescription_Optional_children = Assert<Exact<IsOptional<P_CardDescription, "children">, true>>
type CardDescription_Type_children = Assert<Exact<NonNullable<P_CardDescription["children"]>, NonNullable<React.ReactNode>>>
type CardDescription_Own_className = Assert<Has<P_CardDescription, "className">>
type CardDescription_Optional_className = Assert<Exact<IsOptional<P_CardDescription, "className">, true>>
type CardDescription_Type_className = Assert<Exact<NonNullable<P_CardDescription["className"]>, NonNullable<string>>>

// CardFooter: another exported part of the module
type P_CardFooter = React.ComponentProps<typeof CardFooter>
type CardFooter_Own_children = Assert<Has<P_CardFooter, "children">>
type CardFooter_Optional_children = Assert<Exact<IsOptional<P_CardFooter, "children">, true>>
type CardFooter_Type_children = Assert<Exact<NonNullable<P_CardFooter["children"]>, NonNullable<React.ReactNode>>>
type CardFooter_Own_className = Assert<Has<P_CardFooter, "className">>
type CardFooter_Optional_className = Assert<Exact<IsOptional<P_CardFooter, "className">, true>>
type CardFooter_Type_className = Assert<Exact<NonNullable<P_CardFooter["className"]>, NonNullable<string>>>
type CardFooter_Own_justify = Assert<Has<P_CardFooter, "justify">>
type CardFooter_Optional_justify = Assert<Exact<IsOptional<P_CardFooter, "justify">, true>>
type CardFooter_Type_justify = Assert<Exact<NonNullable<P_CardFooter["justify"]>, NonNullable<"start" | "between" | "end">>>
type CardFooter_Union_justify = Assert<Exact<NonNullable<P_CardFooter["justify"]>, "between" | "end" | "start">>

// CardHeader: another exported part of the module
type P_CardHeader = React.ComponentProps<typeof CardHeader>
type CardHeader_Own_action = Assert<Has<P_CardHeader, "action">>
type CardHeader_Optional_action = Assert<Exact<IsOptional<P_CardHeader, "action">, true>>
type CardHeader_Type_action = Assert<Exact<NonNullable<P_CardHeader["action"]>, NonNullable<React.ReactNode>>>
type CardHeader_Own_children = Assert<Has<P_CardHeader, "children">>
type CardHeader_Optional_children = Assert<Exact<IsOptional<P_CardHeader, "children">, true>>
type CardHeader_Type_children = Assert<Exact<NonNullable<P_CardHeader["children"]>, NonNullable<React.ReactNode>>>
type CardHeader_Own_className = Assert<Has<P_CardHeader, "className">>
type CardHeader_Optional_className = Assert<Exact<IsOptional<P_CardHeader, "className">, true>>
type CardHeader_Type_className = Assert<Exact<NonNullable<P_CardHeader["className"]>, NonNullable<string>>>
type CardHeader_Own_leading = Assert<Has<P_CardHeader, "leading">>
type CardHeader_Optional_leading = Assert<Exact<IsOptional<P_CardHeader, "leading">, true>>
type CardHeader_Type_leading = Assert<Exact<NonNullable<P_CardHeader["leading"]>, NonNullable<React.ReactNode>>>

// CardTitle: another exported part of the module
type P_CardTitle = React.ComponentProps<typeof CardTitle>
type CardTitle_Own_as = Assert<Has<P_CardTitle, "as">>
type CardTitle_Optional_as = Assert<Exact<IsOptional<P_CardTitle, "as">, true>>
type CardTitle_Type_as = Assert<Exact<NonNullable<P_CardTitle["as"]>, NonNullable<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">>>
type CardTitle_Own_children = Assert<Has<P_CardTitle, "children">>
type CardTitle_Optional_children = Assert<Exact<IsOptional<P_CardTitle, "children">, true>>
type CardTitle_Type_children = Assert<Exact<NonNullable<P_CardTitle["children"]>, NonNullable<React.ReactNode>>>
type CardTitle_Own_className = Assert<Has<P_CardTitle, "className">>
type CardTitle_Optional_className = Assert<Exact<IsOptional<P_CardTitle, "className">, true>>
type CardTitle_Type_className = Assert<Exact<NonNullable<P_CardTitle["className"]>, NonNullable<string>>>
type CardTitle_Union_as = Assert<Exact<NonNullable<P_CardTitle["as"]>, "h1" | "h2" | "h3" | "h4" | "h5" | "h6">>

// exported types of the module
type Type_CardSize = Assert<Exact<CardSize, "lg" | "md" | "sm">>
type Type_CardVariant = Assert<Exact<CardVariant, "default" | "elevated" | "filled" | "outlined">>
