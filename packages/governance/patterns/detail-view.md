---
summary: Show everything about one record on its own page: a header with status and actions, peer views in tabs, grouped read-only facts, and loading, not-found and error states.
---
# Detail view

## Use when
- The user opened one record from a list (an order, a project, a customer) and needs its facts, its status and the actions that apply to it.
- The record has a few related views (Overview, Activity) that share the same header.

## Don't use when
- Editing a set of preferences. Use the Settings pattern.
- Entering new data. Use the Form pattern.
- Comparing many records. Use the Data table pattern.
- A quick peek that keeps the list in view. Use a `Sheet` or `Drawer` opened from the row.

## Decision rules
- The page header holds the record name as the one page title, a `Badge` for its status, and the actions. At most one `Button variant="primary"`; other actions are `outline` or `ghost`; a destructive action (Delete, Archive) is never primary and opens an `AlertDialog variant="destructive"` that names the record.
- Status is a `Badge` with a visible text label (Active, Failed, Draft). Never colour alone. Map `success` for healthy, `warning` for needs attention, `danger` for failed, `info` for in progress, `neutral` for inactive.
- 2 to 5 peer views of the same record → `Tabs variant="line"` under the header. More than five, or views that are steps, are the wrong pattern. The header stays put when the tab changes.
- Read-only facts are grouped by topic in `Card variant="outlined"`, each with a `CardTitle`. One level of Card only. Inside a card, show facts as label and value pairs in a description list (`dl`), separated with `Divider`, not as disabled inputs.
- A fact with no value shows an em dash and is never omitted, so the layout does not shift between records.
- Editing a single fact is an explicit `Button variant="ghost"` ("Edit") that opens a `Dialog` or a `Sheet` with the Form pattern. Never turn the read-only view into inputs in place.
- A related list inside a tab (Activity, Members) uses `ListItem` rows for 10 or fewer, and the Data table pattern for more.
- The page sits below the Navigation shell: top-level is the list, this page adds a `Breadcrumb` whose parent is the list and whose last segment is `BreadcrumbPage` with the record name.
- If the record does not exist or the user may not see it, replace the whole body with the Error recovery pattern. Do not show an empty page.

## Components and variants
- `Badge` variant: `success`, `warning`, `danger`, `info`, `neutral` · size: `md`
- `Button` variant: `primary`, `outline`, `ghost`, `destructive` · size: `md`
- `Tabs` variant: `line` · size: `md`
- `Card` variant: `outlined` · size: `md`
- `Divider`
- `Breadcrumb`
- `AlertDialog` variant: `destructive` · size: `md`
- `Skeleton`

## Layout and density
- Header: title and status on one line (wrap on narrow widths), actions at the inline-end, `--atlas-spacing-3` between them. `--atlas-spacing-4` between the header and the tabs, `--atlas-spacing-6` between cards.
- Cards fill the content column. At desktop width two cards may sit side by side with `--atlas-spacing-6` between them; the reading order is still one column.
- In a fact list, the label column is fixed to a consistent inline size so values align across cards; values wrap, never truncate without a tooltip.
- Build with logical properties so the layout mirrors in RTL.

## Hierarchy and composition
- The record name is the largest text on the page. Status and actions are secondary to it, facts are tertiary.
- Typography: record name `--atlas-text-h1`; card titles via `CardTitle`; fact labels `--atlas-text-body-sm` in `foreground-muted`; fact values `--atlas-text-body`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Put the actions in the header only. Do not repeat them inside cards, except a card's own "Edit".

## Responsive behavior
- Phone: the header stacks (title and status, then actions). More than two actions collapse the extras into a `DropdownMenu`; the primary action stays visible. Cards are one column, fact rows stack label above value. Tabs scroll horizontally rather than wrapping.

## States
- default · loading (`Skeleton` for the title, status and each card; the Breadcrumb and tabs stay) · not found or forbidden (Error recovery) · error loading (Error recovery with Retry) · empty tab (Empty state pattern) · action pending (the triggering `Button` shows `loading`, other actions stay enabled unless they conflict) · archived or read-only (a `Badge variant="neutral"` and the edit actions removed, with the reason in the status text).

## Accessibility
- One `<h1>` for the record name. Each card title is a heading one level below.
- The status `Badge` carries its text; screen readers read "Status: Active" because the label and value are in the same `dl` row or the header names it.
- The facts are a `dl` with `dt` and `dd`, so assistive technology reads label and value as a pair.
- `Tabs` list has an `aria-label` naming the record; arrow keys move between tabs and the panel is reachable by Tab.
- The destructive dialog names the record and the consequence, and returns focus to the trigger when closed. After a successful delete, move focus to the list page's title.

## Anti-patterns
- Disabled inputs used to show read-only facts.
- A primary-coloured Delete.
- Status shown by colour alone.
- Cards nested inside cards to group facts.
- More than five tabs, or tabs that are sequential steps.
- Omitting empty facts so the layout jumps between records.
- Page-level actions repeated in every card.

## Example
{{example}}
