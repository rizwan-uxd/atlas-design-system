// GENERATED — do not hand-edit. registry-build from packages/registry/generated/Chart.facts.json; run npm run registry:build.
// A one-way tripwire (roadmap §2c): it asserts what the facts recorded and is never consulted as a definition.
import type React from "react"
import type { Chart, ChartBar, ChartContent, ChartDescription, ChartHeader, ChartLegend, ChartLegendItem, ChartStat, ChartState, ChartStats, ChartTitle } from "@atlas/ui-web/compositions/Chart/Chart"
import type { Assert, Exact, Has, IsOptional } from "./_assert"

type P = React.ComponentProps<typeof Chart>

// own props of Chart: deleting one, flipping its optionality or changing its type fails here
type Own_state = Assert<Has<P, "state">>
type Optional_state = Assert<Exact<IsOptional<P, "state">, true>>
type Type_state = Assert<Exact<NonNullable<P["state"]>, NonNullable<ChartState>>>
type Union_state = Assert<Exact<NonNullable<P["state"]>, "default" | "empty" | "loading">>

// ChartBar: another exported part of the module
type P_ChartBar = React.ComponentProps<typeof ChartBar>
type ChartBar_Own_aria_label = Assert<Has<P_ChartBar, "aria-label">>
type ChartBar_Optional_aria_label = Assert<Exact<IsOptional<P_ChartBar, "aria-label">, false>>
type ChartBar_Type_aria_label = Assert<Exact<NonNullable<P_ChartBar["aria-label"]>, NonNullable<string>>>
type ChartBar_Own_data = Assert<Has<P_ChartBar, "data">>
type ChartBar_Optional_data = Assert<Exact<IsOptional<P_ChartBar, "data">, false>>
type ChartBar_Type_data = Assert<Exact<NonNullable<P_ChartBar["data"]>, NonNullable<Array<Record<string, string | number>>>>>
type ChartBar_Own_dataKey = Assert<Has<P_ChartBar, "dataKey">>
type ChartBar_Optional_dataKey = Assert<Exact<IsOptional<P_ChartBar, "dataKey">, false>>
type ChartBar_Type_dataKey = Assert<Exact<NonNullable<P_ChartBar["dataKey"]>, NonNullable<string>>>
type ChartBar_Own_label = Assert<Has<P_ChartBar, "label">>
type ChartBar_Optional_label = Assert<Exact<IsOptional<P_ChartBar, "label">, false>>
type ChartBar_Type_label = Assert<Exact<NonNullable<P_ChartBar["label"]>, NonNullable<string>>>
type ChartBar_Own_xKey = Assert<Has<P_ChartBar, "xKey">>
type ChartBar_Optional_xKey = Assert<Exact<IsOptional<P_ChartBar, "xKey">, false>>
type ChartBar_Type_xKey = Assert<Exact<NonNullable<P_ChartBar["xKey"]>, NonNullable<string>>>

// ChartContent: another exported part of the module
type P_ChartContent = React.ComponentProps<typeof ChartContent>
type ChartContent_Own_emptyMessage = Assert<Has<P_ChartContent, "emptyMessage">>
type ChartContent_Optional_emptyMessage = Assert<Exact<IsOptional<P_ChartContent, "emptyMessage">, true>>
type ChartContent_Type_emptyMessage = Assert<Exact<NonNullable<P_ChartContent["emptyMessage"]>, NonNullable<React.ReactNode>>>
type ChartContent_Own_loadingLabel = Assert<Has<P_ChartContent, "loadingLabel">>
type ChartContent_Optional_loadingLabel = Assert<Exact<IsOptional<P_ChartContent, "loadingLabel">, true>>
type ChartContent_Type_loadingLabel = Assert<Exact<NonNullable<P_ChartContent["loadingLabel"]>, NonNullable<string>>>

// ChartDescription: another exported part of the module
type P_ChartDescription = React.ComponentProps<typeof ChartDescription>

// ChartHeader: another exported part of the module
type P_ChartHeader = React.ComponentProps<typeof ChartHeader>
type ChartHeader_Own_stats = Assert<Has<P_ChartHeader, "stats">>
type ChartHeader_Optional_stats = Assert<Exact<IsOptional<P_ChartHeader, "stats">, true>>
type ChartHeader_Type_stats = Assert<Exact<NonNullable<P_ChartHeader["stats"]>, NonNullable<React.ReactNode>>>

// ChartLegend: another exported part of the module
type P_ChartLegend = React.ComponentProps<typeof ChartLegend>

// ChartLegendItem: another exported part of the module
type P_ChartLegendItem = React.ComponentProps<typeof ChartLegendItem>

// ChartStat: another exported part of the module
type P_ChartStat = React.ComponentProps<typeof ChartStat>
type ChartStat_Own_label = Assert<Has<P_ChartStat, "label">>
type ChartStat_Optional_label = Assert<Exact<IsOptional<P_ChartStat, "label">, false>>
type ChartStat_Type_label = Assert<Exact<NonNullable<P_ChartStat["label"]>, NonNullable<React.ReactNode>>>
type ChartStat_Own_selected = Assert<Has<P_ChartStat, "selected">>
type ChartStat_Optional_selected = Assert<Exact<IsOptional<P_ChartStat, "selected">, true>>
type ChartStat_Type_selected = Assert<Exact<NonNullable<P_ChartStat["selected"]>, NonNullable<boolean>>>
type ChartStat_Own_value = Assert<Has<P_ChartStat, "value">>
type ChartStat_Optional_value = Assert<Exact<IsOptional<P_ChartStat, "value">, false>>
type ChartStat_Type_value = Assert<Exact<NonNullable<P_ChartStat["value"]>, NonNullable<React.ReactNode>>>

// ChartStats: another exported part of the module
type P_ChartStats = React.ComponentProps<typeof ChartStats>

// ChartTitle: another exported part of the module
type P_ChartTitle = React.ComponentProps<typeof ChartTitle>

// exported types of the module
type Type_ChartState = Assert<Exact<ChartState, "default" | "empty" | "loading">>
