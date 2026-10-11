# Atlas Dashboard Coverage Check

Molecules and composite shells from the 7 most-repeated components listed here, drawn from 15 Mobbin dashboard references. Ordered by frequency (out of 15). The Atlas columns were filled on 2026-10-11 against `main` at `f9162e2`, from the generated `atlas/` docs, the component source and the authored patterns. Where the evidence did not settle a point, the cell says `unverified`.

## How to use

1. For each row, set **Atlas status** to one of: `Built` / `Partial` / `Missing`.
2. If Partial or Missing, note gaps in **Gap notes** (variants, states, tokens, a11y).
3. Set **Priority** using: **P0** = missing and blocks every dashboard, **P1** = partial with real gaps, **P2** = built but needs polish, **P3** = ok.
4. Order build work by Priority, then by Frequency.

A composition that works from existing components is not a missing component. A row is `Partial` when part of its listed anatomy has no support at all (no prop, slot or documented composition), and the **Gap notes** say whether the gap is covered by composing existing parts.

## Components

| # | Component | Freq | Type | Atlas status | Gap notes | Priority | Next pattern |
|---|---|---|---|---|---|---|---|
| 1 | Sidebar navigation shell (collapsible, sections, workspace switcher slot, footer slot) | 15 | Composite | Built | Header slot, labelled sections, footer slot and collapse (`collapsed`, `SidebarCollapseToggle`) are in `atlas/Sidebar.md`. There is no workspace-switcher component or documented composition; the switcher would be a `DropdownMenu` placed in `SidebarHeader`, which no doc or pattern shows. Unverified: how that composition behaves in the collapsed rail. | P2 | App shell (proposed; no existing pattern mentions Sidebar or NavBar) |
| 2 | Nav item (icon + label + active/hover/expanded states, nested child support) | 15 | Molecule | Built | `atlas/SidebarMenuRow.md` lists default, hover, active, expanded (`hasChildren` + `expanded`), disabled, a `badge` slot and one level of children (`SidebarMenuRowChild`). Collapsed icon-only is handled by the parent (`[data-collapsed]` in `SidebarMenuRow.module.css`), which hides the label, badge and chevron, so a count is lost in the rail (no dot or compact count). No separate counter prop; a counter is a `Badge` in `badge`. | P2 | App shell (proposed) |
| 3 | Top app bar (logo/breadcrumb slot, search slot, actions cluster, avatar) | 14 | Composite | Built | `atlas/NavBar.md` has `brand`, `breadcrumb`, `search` and `actions` slots; its code example puts an `Avatar` in `actions`. The actions "cluster" is one `ReactNode` slot with no spacing or overflow behaviour of its own. No gap found beyond that. | P3 | App shell (proposed) |
| 4 | Card / surface container (header slot, body, footer slot, dismissible variant) | 14 | Molecule | Partial | Header (`leading` and `action` slots), `CardContent` and `CardFooter` are built (`atlas/Card.md`). There is no dismissible variant or dismiss prop in `Card.tsx`. The need is covered by composition: the Get started checklist puts a ghost "Hide" `Button` in `CardHeader action` (`packages/governance/patterns/examples/onboarding.example.tsx`). The gap is a missing convention (dismiss label, focus after dismiss), not a blocker. | P2 | Onboarding (existing) |
| 5 | KPI / stat card (label, big number, delta indicator, sparkline slot, info icon) | 14 | Composite | Partial | No component (candidate `CAND-036`, `occurrences: 0`). Composition is sufficient for label, value and delta: `Card variant="outlined"` with `CardDescription`, a value and a `Badge` delta, as in `atlas/patterns/dashboard.md` and its rendered example. Not supported by any component or documented composition: a sparkline slot (`Chart` draws a bar series only) and an info icon. No candidate exists for a sparkline. | P1 | Dashboard (existing) |
| 6 | Dropdown / select (trigger + menu, single/multi, search-in-menu, grouped items) | 12 | Molecule | Partial | `Select` is single choice only and groups with `SelectGroup`/`SelectLabel`/`SelectSeparator` (`atlas/Select.md`). Typing jumps to a match, but there is no search field in the menu and no multi-select. `DropdownMenu` offers checkbox items, which are action toggles, not a form value. No candidate covers a combobox or multi-select (the only nearby entry is `CAND-037`, a command palette). Also found in the 2026-10-11 visual pass: a controlled `Select` shows its placeholder or a blank value until opened (`SelectValue` reads labels that only register when `SelectContent` mounts), which affects the dashboard range filter. | P1 | Search and filter (existing) |
| 7 | Chart container (title, legend slot, range control slot, empty state, loading state) | 12 | Composite | Partial | Title, description, `ChartLegend`, `state="loading"` and `state="empty"` are built (`atlas/Chart.md`). There is no range-control slot: `ChartHeader` takes `stats` for series toggles only. The dashboard pattern puts the date range in a filter row above all charts, so a screen-wide range is covered; a per-chart range control is not. The plot is a single bar series in v1. | P2 | Dashboard (existing) |

## Notes for the build

- Chart container is the wrapper only. Line / bar / area plot primitives and axis/legend/tooltip atoms are a separate track — worth splitting into their own tickets.
- KPI card and Card share layout DNA. Audit result: Card composes into a KPI card with no slot changes (row 5). A component is only worth building if the sparkline and info icon are wanted; that is `CAND-036`'s decision.
- Sidebar shell and Top app bar together form the app frame. Both are built (rows 1 and 3), but no pattern describes how they fit together, which is why rows 1 to 3 point at a proposed App shell pattern.
- Nav item state matrix: default, hover, active, expanded (child open), disabled, with badge and with counter are covered; collapsed (icon-only) hides badge and counter (row 2).
- Dropdown is the highest-effort molecule here (keyboard nav, focus trap, portal/positioning). The multi-select and search-in-menu gap in row 6 has no candidate yet; adding one needs approval.

## Source

Mobbin references used: Supabase, Stripe, Midday, OpenAI Platform, Grok, Kajabi, Unity, Railway, Obvious, Whop, Framer, Klaviyo, Exa, Pinterest, Fireflies.
