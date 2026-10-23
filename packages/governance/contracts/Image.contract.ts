// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Image.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Image, ImageFit, ImageRadius, ImageRatio, ImageState } from "@atlas/ui-web/primitives/Image/Image"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Image>

// own props of Image: deleting one, flipping its optionality or changing its type fails here
type Own_alt = Assert<Has<P, "alt">>
type Optional_alt = Assert<Exact<IsOptional<P, "alt">, false>>
type Type_alt = Assert<Exact<NonNullable<P["alt"]>, NonNullable<string>>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_fallback = Assert<Has<P, "fallback">>
type Optional_fallback = Assert<Exact<IsOptional<P, "fallback">, true>>
type Type_fallback = Assert<Exact<NonNullable<P["fallback"]>, NonNullable<React.ReactNode>>>
type Own_fit = Assert<Has<P, "fit">>
type Optional_fit = Assert<Exact<IsOptional<P, "fit">, true>>
type Type_fit = Assert<Exact<NonNullable<P["fit"]>, NonNullable<ImageFit>>>
type Own_radius = Assert<Has<P, "radius">>
type Optional_radius = Assert<Exact<IsOptional<P, "radius">, true>>
type Type_radius = Assert<Exact<NonNullable<P["radius"]>, NonNullable<ImageRadius>>>
type Own_ratio = Assert<Has<P, "ratio">>
type Optional_ratio = Assert<Exact<IsOptional<P, "ratio">, true>>
type Type_ratio = Assert<Exact<NonNullable<P["ratio"]>, NonNullable<ImageRatio>>>
type Own_src = Assert<Has<P, "src">>
type Optional_src = Assert<Exact<IsOptional<P, "src">, false>>
type Type_src = Assert<Exact<NonNullable<P["src"]>, NonNullable<string>>>
type Own_style = Assert<Has<P, "style">>
type Optional_style = Assert<Exact<IsOptional<P, "style">, true>>
type Type_style = Assert<Exact<NonNullable<P["style"]>, NonNullable<React.CSSProperties>>>
type Union_fit = Assert<Exact<NonNullable<P["fit"]>, "contain" | "cover">>
type Union_radius = Assert<Exact<NonNullable<P["radius"]>, "full" | "lg" | "md" | "none" | "sm" | "xl">>
type Union_ratio = Assert<Exact<NonNullable<P["ratio"]>, "16:10" | "16:9" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "9:16" | "auto">>

// exported types of the module
type Type_ImageFit = Assert<Exact<ImageFit, "contain" | "cover">>
type Type_ImageRadius = Assert<Exact<ImageRadius, "full" | "lg" | "md" | "none" | "sm" | "xl">>
type Type_ImageRatio = Assert<Exact<ImageRatio, "16:10" | "16:9" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "9:16" | "auto">>
type Type_ImageState = Assert<Exact<ImageState, "error" | "loaded" | "loading">>
