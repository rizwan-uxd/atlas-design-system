# Atlas Tokens — Semantic Surface

Source of truth: `atlas.tokens.json` (DTCG). Generated outputs: `atlas.tokens.css` (CSS vars + Tailwind v4 `@theme inline`) · `atlas.figma.tokens.json` (Figma Variables).

## Color (semantic — components use these only)

| Token | Tailwind utility | Purpose |
|---|---|---|
| `--atlas-background` | `bg-background` | Page background |
| `--atlas-background-subtle` | `bg-background-subtle` | Subtle surface (hover on outline/ghost) |
| `--atlas-background-muted` | `bg-background-muted` | Muted surface (secondary fill, active on outline/ghost) |
| `--atlas-surface` | `bg-surface` | Card / sheet surface |
| `--atlas-surface-raised` | `bg-surface-raised` | Elevated surface |
| `--atlas-surface-overlay` | `bg-surface-overlay` | Modal / popover surface |
| `--atlas-border` | `border-border` | Default border |
| `--atlas-border-strong` | `border-border-strong` | Outline-variant border |
| `--atlas-border-subtle` | `border-border-subtle` | Hairline divider |
| `--atlas-foreground` | `text-foreground` | Primary text |
| `--atlas-foreground-muted` | `text-foreground-muted` | Secondary text |
| `--atlas-foreground-subtle` | `text-foreground-subtle` | Tertiary text |
| `--atlas-foreground-disabled` | `text-foreground-disabled` | Disabled text |
| `--atlas-foreground-on-brand` | `text-foreground-on-brand` | Text on brand fill |
| `--atlas-primary` | `bg-primary` | Brand fill |
| `--atlas-primary-hover` | `bg-primary-hover` | Brand fill hover |
| `--atlas-primary-active` | `bg-primary-active` | Brand fill active |
| `--atlas-primary-foreground` | `text-primary-foreground` | Text on brand |
| `--atlas-primary-subtle` | `bg-primary-subtle` | Brand-tint background |
| `--atlas-success` / `--atlas-success-subtle` / `--atlas-success-foreground` | `bg-success` etc. | Positive intent |
| `--atlas-warning` / `--atlas-warning-subtle` / `--atlas-warning-foreground` | `bg-warning` etc. | Caution intent |
| `--atlas-danger` / `--atlas-danger-hover` / `--atlas-danger-subtle` / `--atlas-danger-foreground` | `bg-danger` etc. | Destructive intent |
| `--atlas-info` / `--atlas-info-subtle` / `--atlas-info-foreground` | `bg-info` etc. | Informational intent |
| `--atlas-focus-ring` | `outline-focus-ring` | Keyboard focus indicator |
| `--atlas-overlay` | `bg-overlay` | Scrim behind modals |

Light/Dark swap via `Atlas/Semantic` collection mode override. Mode IDs: `3:0` (Light), `3:1` (Dark). Collection ID: `VariableCollectionId:3:2`.

## Spacing (14-step locked scale)

| Token | px | Tailwind |
|---|---|---|
| `--atlas-spacing-0` | 0 | `p-0`, `gap-0` |
| `--atlas-spacing-px` | 1 | `p-px` |
| `--atlas-spacing-0_5` | 2 | (bracket) |
| `--atlas-spacing-1` | 4 | `p-1` |
| `--atlas-spacing-1_5` | 6 | (bracket) |
| `--atlas-spacing-2` | 8 | `p-2` |
| `--atlas-spacing-3` | 12 | `p-3` |
| `--atlas-spacing-4` | 16 | `p-4` |
| `--atlas-spacing-5` | 20 | `p-5` |
| `--atlas-spacing-6` | 24 | `p-6` |
| `--atlas-spacing-8` | 32 | `p-8` |
| `--atlas-spacing-10` | 40 | `p-10` |
| `--atlas-spacing-12` | 48 | `p-12` |
| `--atlas-spacing-16` | 64 | `p-16` |

## Radius

`none · sm (4) · md (8 = base) · lg (12) · xl (16) · 2xl (24) · full (9999)`.
All component radii anchor to `--atlas-radius-md` unless the spec calls for else.

## Typography

- Static sizes: `text-xs` (12) · `text-sm` (14) · `text-base` (16) · `text-lg` · `text-xl` · `text-2xl` … `text-5xl`.
- Responsive role tokens (auto-uplift via `@media`): `text-h1` · `text-h2` · `text-h3` · `text-h4` · `text-body` · `text-body-sm` · `text-caption`.
- Fonts: `font-sans` (Nunito Sans, LTR) · `font-arabic` (Noto Sans Arabic, auto-swap on `[dir="rtl"]`) · `font-mono` (JetBrains Mono).

## Motion (NOT in Tailwind theme — use bracket notation)

| Token | Value | Use |
|---|---|---|
| `--atlas-duration-instant` | 0ms | Reduced-motion fallback |
| `--atlas-duration-fast` | 120ms | Hover / focus transitions |
| `--atlas-duration-base` | 200ms | Default |
| `--atlas-duration-slow` | 320ms | Larger surface transitions |
| `--atlas-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `--atlas-easing-emphasized` | `cubic-bezier(0.3, 0, 0, 1)` | Entrance |
| `--atlas-easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Exit |

In Tailwind: `duration-[var(--atlas-duration-fast)] ease-[var(--atlas-easing-standard)]`.

## Opacity (NOT in Tailwind theme — use bracket notation)

| Token | Value | Use |
|---|---|---|
| `--atlas-opacity-disabled` | 0.5 | Disabled state |
| `--atlas-opacity-hover` | 0.9 | Hover dim |
| `--atlas-opacity-overlay` | 0.6 | Overlay scrim |

In Tailwind: `disabled:opacity-[var(--atlas-opacity-disabled)]`.

## Touch (mobile-native)

`--atlas-touch-min` 44 · `--atlas-touch-comfortable` 48 · `--atlas-touch-spacious` 56.

## Layout (responsive)

`Atlas/Layout` collection — modes Mobile/Tablet/Desktop. Vars: `columns`, `gutter`, `margin`. Collection ID `VariableCollectionId:4:2`.

## Z-index

base 0 · dropdown 1000 · sticky 1100 · overlay 1200 · modal 1300 · popover 1400 · toast 1500 · tooltip 1600.

## Figma collection IDs (canonical)

| Collection | ID | Modes |
|---|---|---|
| Atlas/Primitives | `VariableCollectionId:2:2` | Default `2:0` |
| Atlas/Semantic | `VariableCollectionId:3:2` | Light `3:0` · Dark `3:1` |
| Atlas/Layout | `VariableCollectionId:4:2` | Mobile `4:0` · Tablet `4:1` · Desktop `4:2` |
| Atlas/Responsive Type | `VariableCollectionId:4:6` | Mobile `4:3` · Tablet `4:4` · Desktop `4:5` |
