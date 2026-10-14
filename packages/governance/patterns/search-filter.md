---
summary: Search a set of records with a query, scope tabs, filters, sort and removable filter chips, including no-results recovery.
---
# Search and filter

## Use when
- The user finds items by typing a query and narrowing by scope, attributes or sort (files, issues, people, products).
- A result list can be filtered by several attributes at once.

## Don't use when
- Choosing from a short known list. Use `Select` or `RadioGroup`.
- Sorting or filtering one table in place. That is the Data table pattern.
- Jumping to a page or running a command by keyboard. A command menu is a separate component (see candidates).

## Decision rules
- The query stays in one `Input` with a search `leadingIcon`, keeps its text after results load, and has a clear control when non-empty. Submit on Enter; do not search on every keystroke unless results are instant. Why: Linear, Slack and Dropbox keep the query visible.
- Scope the results with `Tabs variant="line"` under the query ("All", "Issues", "People") with a result count per tab where known. Why: Linear and Slack scope tabs.
- Sort → one `Select` on the right, default "Relevance". Show the result count next to it ("5 results").
- Few attributes (up to 3) → filter `Select`s in a row. Many attributes → a filter panel (`Sheet` on a phone, side column on wide screens). Why: Amplitude and Selfridges use a filter column; Dropbox and Slack use filter pills.
- Every applied filter appears as a removable `Badge` chip (`removable`, `onRemove`, `removeLabel`), plus one "Clear all" `Button variant="ghost"`. Why: Dropbox "Reset filters", Selfridges "Unselect all filters".
- Results are `ListItem`s (title, one line of match context, metadata) or a `Table` for dense data. Highlight the matched text with the foreground token, not a hardcoded colour.
- No results → echo the query ("No results for 'desig'"), say what to try (check spelling, remove a filter), and offer "Clear filters" `Button`. Why: Linear echoes the query in its empty state.
- Empty query → hide the scope tabs, count, sort and filters. Show "Recent searches" with a "Clear recent" `Button variant="ghost"` and up to 3 `ListItem`s (clock icon, past query as title); choosing one runs that search. Why: nothing to scope yet, and recent queries beat a blank list.
- Searching → `Skeleton` rows in the shape of results; keep the previous results visible until new ones arrive.
- A failed search → one `Alert variant="danger"` with Retry. Keep the query and filters.

## Components and variants
- `Input` variant: `default` · size: `md`
- `Tabs` variant: `line` · size: `md`
- `Select` size: `md`
- `Badge` variant: `neutral` · size: `md`
- `Button` variant: `ghost`, `outline` · size: `md`
- `ListItem` variant: `default` · size: `md`
- `Sheet` side: `bottom` (phone filter panel)
- `Skeleton`
- `Alert` variant: `danger` · size: `md`

## Layout and density
- Order: query → scope tabs → sort, count and filter controls → active chips → results. Spacing `--atlas-spacing-3` between controls and `--atlas-spacing-4` between sections.
- Filters in a side column use a fixed width from the content-width token; results take the rest.

## Hierarchy and composition
- The query is the largest control. Tabs scope the same query; they do not start a new search.
- Chips sit directly above the results they describe.
- Typography: No-results message `--atlas-text-body`, semibold; its help line `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.

## Responsive behavior
- Phone: query on its own row, tabs scroll horizontally, filters open in a `Sheet side="bottom"` from one "Filters" `Button` that shows the active count. The Sheet is titled "Filters", stacks one labelled `Select` per attribute at `--atlas-spacing-4`, and its footer has a primary `Button` "Show N results" and a ghost "Clear all". The results behind it stay visible, dimmed by the overlay.

## States
- default · loading (Skeleton rows) · results · no results (recovery) · error (Alert with Retry) · filtered (chips and Clear all visible).
- empty query (recent searches) · filter sheet (phone).

## Accessibility
- The search `Input` has a `Label` or `aria-label`. The result count is announced politely when it changes.
- Chips are focusable with an accessible remove name ("Remove filter Type: PDF"). Sort and filter controls are named.
- Keep focus on the query after clearing filters; move focus to the results heading after submitting.

## Anti-patterns
- Clearing the query when the user changes a filter.
- A "No results" screen with no way out.
- Filters that apply with no visible chip or count.
- Highlighting matches with a hardcoded colour.
- A raw `<select>` for sort.

## Example
{{example}}
