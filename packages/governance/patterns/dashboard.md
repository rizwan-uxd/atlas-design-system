---
summary: Show the state of a product or account at a glance with filters, KPI cards, a chart and a detail table, including loading and empty states.
---
# Dashboard

## Use when
- The user opens the product to learn how things are going: usage, revenue, deployments, activity over a period.
- Several metrics, one chart and a detail list belong on one screen with shared filters.

## Don't use when
- One record's fields are shown. That is a `Card`, not a dashboard.
- The screen is a long sortable list of records. That is the Data table pattern.
- The user must act on each item (approve, triage). Use a list with actions, not metric cards.

## Decision rules
- Order top to bottom: filters (date range first) → KPI row → chart and detail table. On desktop the chart and the table share one row; on a phone they stack, chart first. Every number on the screen answers to the filters at the top. Why: Zoho, Mintlify and StackAI lead with a date range and KPI row.
- Filters: a `Select` of range presets (Last 24 hours, Last 7 days, Last 30 days, Custom range), a `DatePicker` for the custom range, a `Switch` labelled "Compare to previous period", and an outline `Button` for Export.
- Each KPI is a `Card variant="outlined"` with the label as title, the period as description, and the value and delta in the content slot: a delta with its comparison period ("Up 12% vs previous period"). Show the delta in a `Badge` (`success` up-good, `danger` down-bad, `neutral` flat) with the word up or down, not colour alone.
- Always state the period of a metric ("6h", "Last 7 days"). Why: Vercel overview cards label each period.
- Chart: one `Chart` per question at its natural width (the plot is fixed), a title that says what it shows, `ChartBar` with an `aria-label` describing the data. Use `Table` for exact values. Never more than one series per chart unless a legend is shown.
- Detail table: `Table` with `TableCaption`, numbers aligned `end`. Link to the Data table pattern when rows exceed one screen.
- Loading → `Skeleton` in the shape of the final content, or `Chart state="loading"`. Empty → say why and offer the next step inside the card ("No recent events", an "Enable analytics" `Button`). A first-use dashboard with no data at all is one empty state (icon, heading, text, one primary `Button`), with no filters or KPI cards above it. Why: Vercel in-card empty states with an action.
- Filters change results without a page reload and show a "Reset" `Button variant="ghost"` once any is set.
- A failed card load → an `Alert variant="danger"` with `actions` (Retry) in place of that card. One failed card never blanks the screen.
- Limit the first view to 4 KPIs and 2 charts. More goes behind `Tabs` (`variant="line"`), not further down the page.

## Components and variants
- `Select` size: `md`
- `DatePicker`
- `Switch` size: `md`
- `Button` variant: `primary`, `ghost`, `outline` · size: `md`
- `Card` variant: `outlined` · size: `md`
- `Badge` variant: `success`, `danger`, `neutral` · size: `sm`
- `Chart`
- `Table`
- `Skeleton`
- `Alert` variant: `danger` · size: `md`
- `Tabs` variant: `line` · size: `md`

## Layout and density
- A responsive grid: KPI cards in an auto-fit row (minimum width from `--atlas-content-width-sm`), spacing `--atlas-spacing-4` between cards and `--atlas-spacing-6` between sections.
- Below the KPIs, the chart (670 px) and the table fill one row, `--atlas-spacing-6` apart. Do not nest Cards.

## Hierarchy and composition
- One page title, then the filter row. The value is the largest text in a KPI; labels and periods are muted.
- The most important metric comes first. Group by question, not by data source.

## Responsive behavior
- Phone: filters wrap and stack, KPI cards stack one per row, the chart drops its stats, and the table scrolls horizontally.

## States
- default · loading (Skeleton or `Chart state="loading"`) · empty (explain and offer a step; first-use is the whole dashboard) · error (one Alert per failed card) · filtered (Reset visible).
- stale: show "Updated 2 min ago" when data is cached.

## Accessibility
- Every chart has an `aria-label` and a table or text equivalent. Deltas include the word up or down for screen readers.
- Filter controls are named; changing a filter announces the updated result politely.
- Do not rely on colour for good or bad.

## Anti-patterns
- KPI numbers with no period or comparison.
- Eight or more charts on first load.
- Colour-only deltas, or a chart with no text alternative.
- A spinner over the whole page while one card loads.
- Hardcoded chart colours.

## Example
{{example}}
