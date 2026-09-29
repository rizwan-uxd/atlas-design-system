# Atlas Dashboard Coverage Check

Molecules and composite shells pulled from the top 13 most-repeated components across 15 Mobbin dashboard references. Ordered by frequency (out of 15). Fill the Atlas columns to see what to build first.

## How to use

1. For each row, set **Atlas status** to one of: `Built` / `Partial` / `Missing`.
2. If Partial or Missing, note gaps in **Gap notes** (variants, states, tokens, a11y).
3. Set **Priority** using: **P0** = missing and blocks every dashboard, **P1** = partial with real gaps, **P2** = built but needs polish, **P3** = ok.
4. Order build work by Priority, then by Frequency.

## Components

| # | Component | Freq | Type | Atlas status | Gap notes | Priority |
|---|---|---|---|---|---|---|
| 1 | Sidebar navigation shell (collapsible, sections, workspace switcher slot, footer slot) | 15 | Composite | | | |
| 2 | Nav item (icon + label + active/hover/expanded states, nested child support) | 15 | Molecule | | | |
| 3 | Top app bar (logo/breadcrumb slot, search slot, actions cluster, avatar) | 14 | Composite | | | |
| 4 | Card / surface container (header slot, body, footer slot, dismissible variant) | 14 | Molecule | | | |
| 5 | KPI / stat card (label, big number, delta indicator, sparkline slot, info icon) | 14 | Composite | | | |
| 6 | Dropdown / select (trigger + menu, single/multi, search-in-menu, grouped items) | 12 | Molecule | | | |
| 7 | Chart container (title, legend slot, range control slot, empty state, loading state) | 12 | Composite | | | |

## Notes for the build

- Chart container is the wrapper only. Line / bar / area plot primitives and axis/legend/tooltip atoms are a separate track — worth splitting into their own tickets.
- KPI card and Card share layout DNA. Check whether Atlas' Card can compose into KPI card via slots before building KPI as a distinct component.
- Sidebar shell and Top app bar together form the app frame. If either is missing, prioritize both in the same sprint — one without the other is unusable.
- Nav item state matrix to verify: default, hover, active, active+child-open, collapsed (icon-only), with badge, with counter.
- Dropdown is the highest-effort molecule here (keyboard nav, focus trap, portal/positioning). If Partial, scope the gap carefully.

## Source

Mobbin references used: Supabase, Stripe, Midday, OpenAI Platform, Grok, Kajabi, Unity, Railway, Obvious, Whop, Framer, Klaviyo, Exa, Pinterest, Fireflies.
