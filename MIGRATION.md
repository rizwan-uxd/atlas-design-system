# MIGRATION

## v1.0 — initial Atlas extraction from RDS

### Color
- HEX/RGB → OKLCH across all primitives (perceptually uniform, P3-ready)
- Two-tier model: `primitive` (raw scales) + `semantic` (purpose-named, mode-aware)
- New scales: `brand` (placeholder, tenant-overridable), `success`, `warning`, `danger`, `info`
- Neutral expanded to 13 stops (`0`–`1000`) for finer surface/border control in dark mode

### Tokens
- W3C DTCG format with `$type` / `$value` / `{ref}` syntax
- All semantic colors are references — zero duplication, zero hardcoded values
- Light mode and Dark mode are sibling token groups with the same semantic surface

### Spacing
- Locked to 14-step scale: `0, px, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16` (px-resolved)
- No arbitrary values permitted downstream

### Radius
- Derived scale anchored to `radius.base` (default `8px`)
- `md` always references `base` — change one var to reshape the whole system

### Typography
- `Nunito Sans` (LTR) + `Noto Sans Arabic` (RTL, auto-swaps via `[dir="rtl"]`) + `JetBrains Mono`
- Size scale: `xs → 5xl`; weights: `regular → bold`; line-heights: `tight → relaxed`

### Motion
- Duration scale: `instant / fast / base / slow`
- Easing scale: `linear / standard / emphasized / exit` (cubicBezier)

### Shadow
- Mode-aware: light shadows use low alpha, dark shadows use higher alpha for visibility
- Defined per surface elevation, not per component

### Tailwind v4
- CSS vars exposed via `@theme inline { --color-* }` — utilities like `bg-primary`, `text-foreground` work natively
- No `tailwind.config.js` required

### Figma
- Native Variables format (`atlas.figma.tokens.json`)
- Two collections: `Atlas/Primitives` (Default mode) + `Atlas/Semantic` (Light/Dark modes)
- Semantic vars alias primitives — Figma mode swap mirrors CSS theme swap

### RTL
- Native via `dir="rtl"` — fonts swap automatically, all spacing should use logical properties (`margin-inline-start`, etc.) downstream

### Breaking from prior RDS
- Hex literals removed from semantic layer
- Brand palette is now a placeholder — tenants override `--atlas-color-brand-*` only
- Component-specific tokens removed; components compose from semantic layer only

---

## v1.1 — multi-platform extension

Atlas now targets four surfaces: **responsive desktop web · tablet web · mobile web · mobile app**. The following groups were added so components can be designed against tokens (not magic numbers) on every platform.

### Breakpoints
Tailwind v4-aligned: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Exposed as CSS vars **and** Figma primitives so frame widths in Figma can reference the same source.

### Layout
New `atlas.layout.*` group:
- **Columns** — `4 mobile · 8 tablet · 12 desktop`
- **Gutter** — `spacing.4 · spacing.6 · spacing.8` (16/24/32)
- **Margin** — `spacing.4 · spacing.6 · spacing.8` (16/24/32)
- **Container max-width** — `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`

In CSS: a single active token per role (`--atlas-columns`, `--atlas-gutter`, `--atlas-margin`) is uplifted at `min-width: 768px` and `min-width: 1024px` via `@media`. Mobile-first by default.

In Figma: a new collection `Atlas/Layout` with modes `Mobile / Tablet / Desktop` exposes `columns / gutter / margin`. Mode switching mirrors the CSS uplift.

### Touch targets
New `atlas.touch.*` group:
- `min 44px` — iOS minimum, WCAG 2.5.5 AA
- `comfortable 48px` — Material Design 3 default
- `spacious 56px` — for primary CTAs and bottom-bar items

Mobile-app components MUST size hit areas to at least `--atlas-touch-min`.

### Safe area
New `atlas.safe-area.*` group, aliasing `env(safe-area-inset-*)`:
- `--atlas-safe-top` · `--atlas-safe-bottom` · `--atlas-safe-inline-start` · `--atlas-safe-inline-end`

Use logical-property names (`inline-start`/`inline-end`) so RTL works with no additional logic.

### Z-index
Existing `atlas.z-index.*` was already defined. No changes; documenting for completeness:
`base 0 · dropdown 1000 · sticky 1100 · overlay 1200 · modal 1300 · popover 1400 · toast 1500 · tooltip 1600`.

### Responsive type
New `atlas.typography.responsive.*` group with role-based tokens that **change size by viewport**:

| Role     | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| h1       | 28     | 36     | 48      |
| h2       | 22     | 28     | 36      |
| h3       | 18     | 22     | 24      |
| h4       | 16     | 18     | 20      |
| body     | 16     | 16     | 16      |
| body-sm  | 14     | 14     | 14      |
| caption  | 12     | 12     | 12      |

In CSS the active value is held in `--atlas-text-h1` etc. and uplifted in the `@media` blocks. Components reference the role token (`var(--atlas-text-h1)`), never the bp-specific value.

In Figma, the new collection `Atlas/Responsive Type` has modes `Mobile / Tablet / Desktop` exposing the same roles as primitives — text styles bind to these so swapping the mode on a frame swaps every heading size.

### What this enables
- A **single component spec** can target all four platforms by composing role tokens (responsive type, layout, touch) — no per-breakpoint variants required for typography or spacing.
- A Figma frame set to `Atlas/Layout: Mobile` + `Atlas/Responsive Type: Mobile` instantly previews mobile composition; the same frame switched to `Desktop` previews desktop. No re-binding.
- Mobile-app surfaces compose `safe-area` + `touch` tokens — native idioms (bottom nav, sheet handles) get their own dimensional vocabulary without leaking into web tokens.

### Files touched in v1.1
- `atlas.tokens.json` — added `layout`, `touch`, `safe-area`, `typography.responsive`
- `atlas.tokens.css` — added matching CSS vars + two `@media` uplift blocks + Tailwind `@theme inline` exposure (`--text-h1`, etc.)
- `atlas.figma.tokens.json` — added breakpoint/container/z-index/touch primitives + two new collections (`Atlas/Layout`, `Atlas/Responsive Type`) with platform modes
