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
- Build from the `Table` parts: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. Table has no selection, sorting state, filtering or pagination: you supply them.
- Filters and search go in a toolbar above the table, never inside a header cell. Search is an `Input`, a fixed set of statuses is a `Select` (or `Tabs` `segmented` for 2–4 named views).
- Row selection: a `Checkbox` in the first cell of every row with an `aria-label` naming the row, and a select-all `Checkbox` in the header (`TableHead` Content checkbox). The select-all uses `checked="indeterminate"` when some but not all visible rows are selected. Set `selected` on `TableRow` for selected rows.
- Selection scope is the visible (filtered) rows. Changing the filter keeps selection only for rows still visible, or clears it; state which.
- Bulk actions appear only when at least one row is selected, in a bar showing the count ("2 selected") with an `aria-live="polite"` region. At most two or three actions.
- A destructive bulk action (delete) opens an `AlertDialog variant="destructive"` that names the count and the consequence. Non-destructive actions apply directly and confirm with a `Toast`.
- Numeric and currency columns: `align="end"`. Text columns: start. One sorted column at a time with `sort` / `onSort`.
- Status column → `Badge` (`success`, `warning`, `danger`, `neutral`) with the status word, never colour alone.
- Long tables: paginate or virtualise; Atlas has no Pagination component, so log the gap.

## Components and variants
- `Table`
- `Checkbox` variant: `default` · size: `sm`
- `Input` variant: `default` · size: `md`
- `Select` size: `md`
- `Badge` variant: `success`, `warning`, `danger`, `neutral` · size: `sm`
- `Button` variant: `ghost`, `destructive`, `primary` · size: `sm`
- `AlertDialog` variant: `destructive` · size: `md`
- `Skeleton`

## Layout and density
- Toolbar (search, filter) → optional bulk bar replacing or sitting under it → table. Row height from the Table tokens; do not override.
- Dense by default: toolbar controls and bulk buttons use `sm`; keep Table cell content to one line and truncate.
- The table scrolls horizontally inside its own wrapper on small screens; do not shrink fonts to fit.

## Hierarchy and composition
- Page title above the toolbar. The table is one surface: no Card around it, no nested table.
- One primary action per view, normally outside the table (for example "New invoice").

## Responsive behavior
- Phone: keep the table in its scroll wrapper, pin the identifying column first, hide secondary columns only if the product allows it.
- Bulk bar stacks the count above the actions when narrower than the tablet breakpoint.

## States
- loading: `Skeleton` rows with the same column layout; set `aria-busy` on the table region.
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

## Example
{{example}}
