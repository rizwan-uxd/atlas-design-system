---
summary: Show a set of records in rows and columns with search, filtering, row selection and bulk actions.
---
# Data table

## Use when
- Records share the same fields and the user compares, scans or acts on several of them (invoices, users, orders).

## Don't use when
- Two or three fields per record on a phone. Use a list of `ListItem` rows.
- One record's details. Use a `Card`.
- Mixed or nested content per row.

## Decision rules
- Build from the `Table` parts: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. Table has no selection, sorting state or filtering: you supply them. Pagination is its own component.
- Filters and search go in a toolbar above the table, never inside a header cell. Search is an `Input`, a fixed set of statuses is a `Select` (or `Tabs` `segmented` for 2–4 named views).
- Row selection: a `Checkbox` in the first cell of every row with an `aria-label` naming the row, and a select-all `Checkbox` in the header (`TableHead` Content checkbox). The select-all uses `checked="indeterminate"` when some but not all visible rows are selected. Set `selected` on `TableRow` for selected rows.
- Select-all covers the rows on the current page; selection is kept across pages and the bulk bar counts every selected row. Changing the filter keeps selection only for rows still visible, or clears it; state which.
- Bulk actions appear only when at least one row is selected, in a bar showing the count ("2 selected") with an `aria-live="polite"` region. At most two or three actions.
- A destructive bulk action (delete) opens an `AlertDialog variant="destructive"` that names the count and the consequence. Non-destructive actions apply directly and confirm with a `Toast`.
- Numeric and currency columns: `align="end"`. Text columns: start. One sorted column at a time with `sort` / `onSort`.
- Status column → `Badge` (`success`, `warning`, `danger`, `neutral`) with the status word, never colour alone.
- Long tables: `Pagination` below the table, aligned to the end, with a "Showing 21 to 25 of 50 invoices" line; or a Load more `Button` that grows the list. Use one, not both.
- Pagination: keep the page size constant, and go back to page 1 when the search or a filter changes. Hide it when everything fits on one page.
- Load more: a `Button variant="outline"` shown only while more rows exist, with `loading` while it fetches. The count line is an `aria-live="polite"` region, and focus stays on the Button. Atlas has no infinite scroll (candidate CAND-048).

## Components and variants
- `Table`
- `Checkbox` variant: `default` · size: `sm`
- `Input` variant: `default` · size: `md`
- `Select` size: `md`
- `Badge` variant: `success`, `warning`, `danger`, `neutral` · size: `sm`
- `Button` variant: `ghost`, `destructive`, `primary`, `outline` · size: `sm`
- `Pagination` size: `sm`
- `AlertDialog` variant: `destructive` · size: `md`
- `Skeleton`

## Layout and density
- Toolbar (search, filter) → bulk bar under it, only while rows are selected → table → footer row. Row height from the Table tokens; do not override.
- Footer row: the count line at the start and `Pagination` (or Load more) at the end.
- Dense by default: toolbar controls and bulk buttons use `sm`; keep Table cell content to one line and truncate.
- The table scrolls horizontally inside its own wrapper on small screens; do not shrink fonts to fit.

## Hierarchy and composition
- Page title above the toolbar. The table is one surface: no Card around it, no nested table.
- One primary action per view, normally outside the table (for example "New invoice").
- Typography: Page title `--atlas-text-h1`; no-results title `--atlas-text-h3`; no-results help `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.

## Responsive behavior
- Phone: keep the table in its scroll wrapper, pin the identifying column first, hide secondary columns only if the product allows it. The footer row stacks the count line above the paging control.
- Bulk bar stacks the count above the actions when narrower than the tablet breakpoint.

## States
- loading: `Skeleton` rows in the same column layout, toolbar still shown; set `aria-busy` on the table region.
- empty: no records at all → Empty state (first-use). Filters match nothing → Empty state (no-results) with "Clear filters".
- error: failed to load → Error recovery pattern, with Retry; keep the toolbar.
- selected, sorted, disabled (while a bulk action runs).

## Accessibility
- Name the table (`aria-label` or `TableCaption`). `aria-sort` is set by `TableHead`.
- Every row checkbox has a label that names the row; the select-all is labelled "Select all".
- Selection must be a visible control, not a row click only. Bulk bar count is announced (`aria-live`).
- Move focus to the dialog on open and back to the trigger on close (AlertDialog does this).

## Anti-patterns
- Row click as the only way to select.
- Delete without confirmation, or confirmation that does not say how many.
- Filters inside table cells.
- Colour-only status.
- Raw `<table>`, `<input type="checkbox">` or `<select>`.
- Bulk bar always visible with disabled buttons.
- Pagination and Load more on one table, a page control with no total, or infinite scroll.

## Example
{{example}}
