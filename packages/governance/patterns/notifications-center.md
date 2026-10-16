---
summary: A place to review what happened while the user was away: a list of notifications split into All and Unread, with read state, mark-all-read, per-item actions, and empty, loading and error states.
---
# Notifications center

## Use when
- The product generates events for the user (a mention, an approval, a failed payment) and they need a durable list to review, act on and clear.
- A notification can be unread, and reading it should change its state.

## Don't use when
- Confirming an action the user just took ("Saved"). Use a `Toast`.
- A condition that stays in the page until it is fixed. Use an `Alert`.
- Choosing which events notify the user. Use the Settings pattern (a group of `Switch` rows).
- A conversation. Use the Chat pattern.

## Decision rules
- Two views, `All` and `Unread`, as `Tabs variant="line"`. The Unread tab shows its count in its label ("Unread 3"). No more tabs; filter further with the Search and filter pattern if the list grows.
- Each notification is a `ListItem` rendered as `li` inside one `ul`: a `ListItemMedia` (the actor's `Avatar` size `sm`, or an icon), `ListItemContent` with a `ListItemTitle` (what happened) and a `ListItemDescription` (where and when), and `ListItemActions`.
- Unread is shown by a `Badge dot` with the text "Unread" visible to assistive technology and a stronger title, never by colour alone. Read items drop the dot and use `variant="default"`; unread items use `variant="muted"`.
- Opening a notification (activating its link) marks it read and navigates to the thing it is about. The title is a real link (`<a href>`); do not put `onClick` on the row.
- Per-item actions are at most two: a "Mark as read" or "Mark as unread" `Button variant="ghost"`, and, where the event is actionable, one `Button variant="outline"` for that action (Approve, Review). A destructive action never lives on a notification row.
- "Mark all as read" is one `Button variant="ghost"` in the header, disabled when nothing is unread. It acts on the whole list and needs no confirmation, because it is reversible per item and does not delete anything.
- Dismissing (removing) a notification is separate from reading it. If supported, show a `Toast` with Undo after removing; do not use a confirmation dialog.
- Group by day with a heading ("Today", "Yesterday", "Earlier"), newest first within a group. Show relative time in the description and the exact time as the `<time>` `dateTime`.
- Real-time arrivals while the user is looking: do not insert rows above the one being read. Show a "N new notifications" `Button variant="outline"` that loads them.
- Long lists load with the Pagination pattern or a "Load more" `Button`; do not auto-load an endless feed.

## Components and variants
- `ListItem` variant: `default`, `muted` · size: `md`
- `Avatar` size: `sm`
- `Badge` variant: `primary`, `neutral` · size: `sm`
- `Tabs` variant: `line` · size: `md`
- `Button` variant: `ghost`, `outline` · size: `sm`
- `Toast` variant: `default`
- `EmptyState` size: `md`
- `Alert` variant: `danger`
- `Skeleton`
- `Divider`

## Layout and density
- Single column at a readable width, within the Navigation shell's content column. Header row: page title at the inline-start, "Mark all as read" at the inline-end, `--atlas-spacing-3` between. Tabs `--atlas-spacing-4` below the header.
- Rows are stacked with `--atlas-spacing-2` between items; day headings have `--atlas-spacing-6` above and `--atlas-spacing-2` below.
- Row actions sit at the inline-end and wrap below the text on narrow widths. Build with logical properties so the list mirrors in RTL.

## Hierarchy and composition
- The title of a notification is the primary text; the description (source and time) is muted and secondary. Only unread rows carry emphasis, so the eye finds what is new.
- Typography: page title `--atlas-text-h1`; day headings `--atlas-text-h4`; row text from `ListItem`; time and helper text `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Do not put forms, cards or long content inside a row. If the user needs more, the title links to the full page.

## Responsive behavior
- Phone: the list fills the width, actions move below the row text, and "Mark all as read" stays in the header. Tabs keep two labels and do not scroll.

## States
- default · unread / read · hover and focus on the row's link · loading (`Skeleton` rows in the list only; the header and tabs stay) · empty All (`EmptyState`: "You're all caught up", no action) · empty Unread (`EmptyState`: "No unread notifications", with a "View all" action) · error loading (`Alert variant="danger"` with a Retry button above an empty list) · updating (the row's action `Button` shows `loading`) · new arrivals (the "N new" button).

## Accessibility
- The list is a `ul` with an accessible name; the count in the Unread tab is part of its text. Unread is conveyed by the visible "Unread" label or the dot's text alternative, not by weight or colour alone.
- Each row's link has a meaningful name from its title; the action buttons name their notification (`aria-label="Mark “Invoice failed” as read"`), so they are not ambiguous in a list of identical buttons.
- When an item is marked read on the Unread tab, it leaves the list: announce that with a polite live region ("Marked as read") and move focus to the next row, never to the page top.
- `Tabs` list has an `aria-label`; arrow keys move between tabs.
- A new-arrival count button is announced politely, not as an alert. Do not steal focus.

## Anti-patterns
- Inserting new rows above what the user is reading.
- Unread shown only by a coloured dot or bold text.
- `onClick` on a row instead of a link.
- Identical unnamed "Mark as read" buttons.
- A confirmation dialog for mark-all-read, or a delete without Undo.
- Using a `Toast` as the only record of an event the user must act on.
- More than two actions per row, or a destructive action on the row.

## Example
{{example}}
