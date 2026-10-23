// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Image.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Image } from "@atlas/ui-web/primitives/Image/Image"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Image>

// own props of Image: deleting one, or flipping its optionality, fails here
type Own_alt = Assert<Has<P, "alt">>
type Optional_alt = Assert<Exact<IsOptional<P, "alt">, false>>
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Own_fallback = Assert<Has<P, "fallback">>
type Optional_fallback = Assert<Exact<IsOptional<P, "fallback">, true>>
type Own_fit = Assert<Has<P, "fit">>
type Optional_fit = Assert<Exact<IsOptional<P, "fit">, true>>
type Own_radius = Assert<Has<P, "radius">>
type Optional_radius = Assert<Exact<IsOptional<P, "radius">, true>>
type Own_ratio = Assert<Has<P, "ratio">>
type Optional_ratio = Assert<Exact<IsOptional<P, "ratio">, true>>
type Own_src = Assert<Has<P, "src">>
type Optional_src = Assert<Exact<IsOptional<P, "src">, false>>
type Own_style = Assert<Has<P, "style">>
type Optional_style = Assert<Exact<IsOptional<P, "style">, true>>

// string unions: exactly these members, so removing one fails as well as adding one
type Union_fit = Assert<Exact<NonNullable<P["fit"]>, "contain" | "cover">>
type Union_radius = Assert<Exact<NonNullable<P["radius"]>, "full" | "lg" | "md" | "none" | "sm" | "xl">>
type Union_ratio = Assert<Exact<NonNullable<P["ratio"]>, "16:10" | "16:9" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "9:16" | "auto">>
