// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Label.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Label, LabelSize, LabelVariant } from "@atlas/ui-web/primitives/Label/Label"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Label>

// own props of Label: deleting one, flipping its optionality or changing its type fails here
type Own_children = Assert<Has<P, "children">>
type Optional_children = Assert<Exact<IsOptional<P, "children">, false>>
type Type_children = Assert<Exact<NonNullable<P["children"]>, NonNullable<React.ReactNode>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_invalid = Assert<Has<P, "invalid">>
type Optional_invalid = Assert<Exact<IsOptional<P, "invalid">, true>>
type Type_invalid = Assert<Exact<NonNullable<P["invalid"]>, NonNullable<boolean>>>
type Own_optional = Assert<Has<P, "optional">>
type Optional_optional = Assert<Exact<IsOptional<P, "optional">, true>>
type Type_optional = Assert<Exact<NonNullable<P["optional"]>, NonNullable<boolean>>>
type Own_required = Assert<Has<P, "required">>
type Optional_required = Assert<Exact<IsOptional<P, "required">, true>>
type Type_required = Assert<Exact<NonNullable<P["required"]>, NonNullable<boolean>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<LabelSize>>>
type Own_variant = Assert<Has<P, "variant">>
type Optional_variant = Assert<Exact<IsOptional<P, "variant">, true>>
type Type_variant = Assert<Exact<NonNullable<P["variant"]>, NonNullable<LabelVariant>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>
type Union_variant = Assert<Exact<NonNullable<P["variant"]>, "default" | "inline">>

// exported types of the module
type Type_LabelSize = Assert<Exact<LabelSize, "lg" | "md" | "sm">>
type Type_LabelVariant = Assert<Exact<LabelVariant, "default" | "inline">>

// Label: inherited props it must keep (packages/registry/contract-props.json)
type Label_Kept_ref = Assert<Has<P, "ref">>
type Label_KeptType_ref = Assert<Exact<NonNullable<P["ref"]>, NonNullable<React.Ref<HTMLLabelElement>>>>
