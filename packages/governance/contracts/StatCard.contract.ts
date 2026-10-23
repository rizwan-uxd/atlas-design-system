// GENERATED — do not hand-edit. registry-build from packages/registry/generated/StatCard.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { StatCard, StatCardDelta, StatCardSentiment, StatCardSize, StatCardSparkline, StatCardTrend } from "@atlas/ui-web/compositions/StatCard/StatCard"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof StatCard>

// own props of StatCard: deleting one, flipping its optionality or changing its type fails here
type Own_className = Assert<Has<P, "className">>
type Optional_className = Assert<Exact<IsOptional<P, "className">, true>>
type Type_className = Assert<Exact<NonNullable<P["className"]>, NonNullable<string>>>
type Own_delta = Assert<Has<P, "delta">>
type Optional_delta = Assert<Exact<IsOptional<P, "delta">, true>>
type Type_delta = Assert<Exact<NonNullable<P["delta"]>, NonNullable<StatCardDelta>>>
type Own_disabled = Assert<Has<P, "disabled">>
type Optional_disabled = Assert<Exact<IsOptional<P, "disabled">, true>>
type Type_disabled = Assert<Exact<NonNullable<P["disabled"]>, NonNullable<boolean>>>
type Own_icon = Assert<Has<P, "icon">>
type Optional_icon = Assert<Exact<IsOptional<P, "icon">, true>>
type Type_icon = Assert<Exact<NonNullable<P["icon"]>, NonNullable<React.ReactNode>>>
type Own_id = Assert<Has<P, "id">>
type Optional_id = Assert<Exact<IsOptional<P, "id">, true>>
type Type_id = Assert<Exact<NonNullable<P["id"]>, NonNullable<string>>>
type Own_label = Assert<Has<P, "label">>
type Optional_label = Assert<Exact<IsOptional<P, "label">, false>>
type Type_label = Assert<Exact<NonNullable<P["label"]>, NonNullable<React.ReactNode>>>
type Own_loading = Assert<Has<P, "loading">>
type Optional_loading = Assert<Exact<IsOptional<P, "loading">, true>>
type Type_loading = Assert<Exact<NonNullable<P["loading"]>, NonNullable<boolean>>>
type Own_onClick = Assert<Has<P, "onClick">>
type Optional_onClick = Assert<Exact<IsOptional<P, "onClick">, true>>
type Type_onClick = Assert<Exact<NonNullable<P["onClick"]>, NonNullable<React.MouseEventHandler<HTMLElement>>>>
type Own_period = Assert<Has<P, "period">>
type Optional_period = Assert<Exact<IsOptional<P, "period">, false>>
type Type_period = Assert<Exact<NonNullable<P["period"]>, NonNullable<React.ReactNode>>>
type Own_size = Assert<Has<P, "size">>
type Optional_size = Assert<Exact<IsOptional<P, "size">, true>>
type Type_size = Assert<Exact<NonNullable<P["size"]>, NonNullable<StatCardSize>>>
type Own_sparkline = Assert<Has<P, "sparkline">>
type Optional_sparkline = Assert<Exact<IsOptional<P, "sparkline">, true>>
type Type_sparkline = Assert<Exact<NonNullable<P["sparkline"]>, NonNullable<StatCardSparkline>>>
type Own_value = Assert<Has<P, "value">>
type Optional_value = Assert<Exact<IsOptional<P, "value">, false>>
type Type_value = Assert<Exact<NonNullable<P["value"]>, NonNullable<React.ReactNode>>>
type Union_size = Assert<Exact<NonNullable<P["size"]>, "lg" | "md" | "sm">>

// exported types of the module
type StatCardDelta_Own_sentiment = Assert<Has<StatCardDelta, "sentiment">>
type StatCardDelta_Optional_sentiment = Assert<Exact<IsOptional<StatCardDelta, "sentiment">, true>>
type StatCardDelta_Type_sentiment = Assert<Exact<NonNullable<StatCardDelta["sentiment"]>, NonNullable<StatCardSentiment>>>
type StatCardDelta_Own_text = Assert<Has<StatCardDelta, "text">>
type StatCardDelta_Optional_text = Assert<Exact<IsOptional<StatCardDelta, "text">, false>>
type StatCardDelta_Type_text = Assert<Exact<NonNullable<StatCardDelta["text"]>, NonNullable<string>>>
type StatCardDelta_Own_trend = Assert<Has<StatCardDelta, "trend">>
type StatCardDelta_Optional_trend = Assert<Exact<IsOptional<StatCardDelta, "trend">, false>>
type StatCardDelta_Type_trend = Assert<Exact<NonNullable<StatCardDelta["trend"]>, NonNullable<StatCardTrend>>>
type StatCardDelta_Own_trendLabel = Assert<Has<StatCardDelta, "trendLabel">>
type StatCardDelta_Optional_trendLabel = Assert<Exact<IsOptional<StatCardDelta, "trendLabel">, true>>
type StatCardDelta_Type_trendLabel = Assert<Exact<NonNullable<StatCardDelta["trendLabel"]>, NonNullable<string>>>
type StatCardDelta_Keys = Assert<Exact<keyof StatCardDelta, "sentiment" | "text" | "trend" | "trendLabel">>
type Type_StatCardSentiment = Assert<Exact<StatCardSentiment, "negative" | "neutral" | "positive">>
type Type_StatCardSize = Assert<Exact<StatCardSize, "lg" | "md" | "sm">>
type StatCardSparkline_Own_label = Assert<Has<StatCardSparkline, "label">>
type StatCardSparkline_Optional_label = Assert<Exact<IsOptional<StatCardSparkline, "label">, false>>
type StatCardSparkline_Type_label = Assert<Exact<NonNullable<StatCardSparkline["label"]>, NonNullable<string>>>
type StatCardSparkline_Own_values = Assert<Has<StatCardSparkline, "values">>
type StatCardSparkline_Optional_values = Assert<Exact<IsOptional<StatCardSparkline, "values">, false>>
type StatCardSparkline_Type_values = Assert<Exact<NonNullable<StatCardSparkline["values"]>, NonNullable<number[]>>>
type StatCardSparkline_Keys = Assert<Exact<keyof StatCardSparkline, "label" | "values">>
type Type_StatCardTrend = Assert<Exact<StatCardTrend, "down" | "flat" | "up">>
