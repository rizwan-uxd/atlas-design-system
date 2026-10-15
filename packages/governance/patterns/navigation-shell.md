---
summary: Frame an app with a persistent sidebar, a content column with breadcrumb and page title, and one named main region, including collapsed and loading states.
---
# Navigation shell

## Use when
- The product has more destinations than fit in a top bar, grouped into sections (Home, Projects, Settings).
- Every signed-in screen shares the same persistent navigation and only the content column changes.

## Don't use when
- A marketing or simple site with a brand and a few links. Use `NavBar` alone.
- A single-purpose flow (checkout, setup). Remove the navigation and use the Onboarding or Form pattern.
- A temporary panel opened by a button. That is a `Drawer`.

## Decision rules
- One shell per app: a `Sidebar` on the inline-start side and a content column beside it. Do not use a `Sidebar` and a `NavBar` link list for the same destinations. Why: the Sidebar doc forbids two navigations for one set of destinations.
- The `Sidebar` is `SidebarHeader` (workspace or product name), `SidebarBody` with 2 to 4 `SidebarSection`s, and `SidebarFooter` (`Avatar` and the account name). Group rows by what the user is doing, not by data source.
- Every `SidebarMenuRow` is an anchor (`as="a"` with `href`) and has an `icon`, so the row survives collapse. Exactly one row is `active`; it is the page the user is on, and it sets `aria-current="page"`.
- Collapse is controlled: keep a `collapsed` boolean, pass it to `Sidebar` and flip it from the `SidebarCollapseToggle` `onClick`. Remember the choice across visits so the shell does not jump on reload.
- The content column starts with a `Breadcrumb` (the last segment is `BreadcrumbPage`), then one page title, then the page body. Top-level pages have no breadcrumb; the title alone says where the user is.
- One `<main>` holds the page body. It is the target of a "Skip to content" link that is the first focusable element on the page.
- Loading shows `Skeleton` in the content area only. The navigation never blanks while a page loads.
- On a phone the sidebar content moves into a `Drawer side="start"` instead of rendering inline (see Responsive behavior).

## Components and variants
- `Sidebar`
- `SidebarMenuRow`
- `Avatar` size: `sm`
- `Breadcrumb`
- `Button` variant: `ghost` · size: `md`
- `Skeleton`

## Layout and density
- Two columns: the `Sidebar` at its own width (`--atlas-content-width-xs`), the content column filling the rest. Build the grid with logical properties so it mirrors in RTL.
- Content column padding `--atlas-spacing-6`; `--atlas-spacing-4` between the breadcrumb, the title and the page body.
- The `Sidebar` is full height and scrolls its body on its own. The content column scrolls independently of it.

## Hierarchy and composition
- The page title is the largest text in the content column; the breadcrumb and any helper text are muted.
- Typography: page title `--atlas-text-h1`; breadcrumb and help text `--atlas-text-body-sm` in `foreground-muted`. Set every heading and paragraph from `--atlas-text-*` or `--atlas-font-size-*`; never a bare `<h1>` or `<p>`.
- Put page content in the content column only. Never put forms or page content inside the `Sidebar`.

## Responsive behavior
- Phone: render no inline sidebar. Its content goes in a `Drawer side="start"` opened from a menu `Button` in the page header. Selecting a row closes the drawer. The `Sidebar` doc is the source for this rule.

## States
- default · collapsed (icon rail, section labels hidden) · active row · disabled row · row with a badge · loading (Skeleton in the content column only).
- A collapsed row still shows its icon; keep the row name available to assistive technology.

## Accessibility
- The `Sidebar` renders an `<aside>` named "Sidebar". If there is more than one sidebar, give each its own `aria-label`.
- The Breadcrumb is a named `nav` ("Breadcrumb") and its current segment carries `aria-current="page"`.
- The "Skip to content" link is the first focusable element, visible on focus, and moves focus to `<main>`.
- `SidebarCollapseToggle` sets `aria-expanded` and its own label ("Collapse sidebar" or "Expand sidebar").
- Keyboard order: skip link, sidebar rows, toggle, then the content column.

## Anti-patterns
- Two navigations for the same destinations (a Sidebar and a NavBar link list).
- Rows with no icon, which turn into blank squares when collapsed.
- More than one active row, or an active row that is not the current page.
- Hiding the whole sidebar while a page loads.
- Page content or forms inside the Sidebar.

## Example
{{example}}
