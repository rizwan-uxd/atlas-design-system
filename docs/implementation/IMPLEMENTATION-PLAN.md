# Atlas Design System — Bug Fix Implementation Plan

**60 open bugs · 9 fix sessions**

| Priority | Count |
|---|---|
| P1 critical | 1 |
| P2 major | 47 |
| P3 minor | 12 |

---

## FIX-01 — Cross-cutting quick wins (9 bugs · 5 files)

Highest bugs-per-effort ratio. All magic-number line-heights, non-logical margin shorthands, physical CSS positioning, and the QA-REPORT header correction. Pure CSS edits — no TypeScript changes.

| Bug | P | Title | Files |
|---|---|---|---|
| BUG-017 | P3 | Switch `line-height: 1.4` magic number | `Switch.module.css` |
| BUG-025 | P3 | Badge `line-height: 1` magic numbers (`.badge`, `.removeBtn`) | `Badge.module.css` |
| BUG-033 | P3 | Alert `.dismissBtn` `line-height: 1` | `Alert.module.css` |
| BUG-035 | P3 | Dialog `.closeBtn` `line-height: 1` | `Dialog.module.css` |
| BUG-028 | P3 | Card `.description` non-logical `margin` shorthand | `Card.module.css` |
| BUG-034 | P3 | Dialog `.description` non-logical `margin` shorthand | `Dialog.module.css` |
| BUG-038 | P3 | Dialog modal: physical `top/left` → `inset-block-start/inset-inline-start` | `Dialog.module.css` |
| BUG-049 | P3 | NavBar `top: 0` → `inset-block-start: 0` | `NavBar.module.css` |
| BUG-076 | P3 | QA-REPORT stale `OPEN` headers on BUG-004/005/006 (already fixed) | `QA-REPORT.md` |

**Fix pattern for all line-heights:** Replace raw value with `var(--atlas-line-height-tight)` (icon buttons, badges, dismiss buttons) or `var(--atlas-line-height-normal)` (label/description text).

---

## FIX-02 — Switch component (6 bugs · 2 files)

| Bug | P | Title |
|---|---|---|
| BUG-018 | P2 | `required` prop missing from `SwitchProps`; no `aria-required` forwarded |
| BUG-019 | P3 | Thumb token: `--atlas-foreground-on-brand` → `--atlas-background` |
| BUG-020 | P3 | No `:active` pressed state on `.track` |
| BUG-053 | P2 | Unchecked track hover darkens in dark mode (inverted feedback) |
| BUG-060 | P2 | Track 18–24px — no `min-height: var(--atlas-touch-min)` |
| BUG-064 | P2 | No `aria-label` prop + no `...rest` spread; unlabeled when `label` omitted |

**Files:** `Switch.tsx`, `Switch.module.css`

**Key changes:**
- `SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, ...>` — adds `aria-label` + rest spread
- Add `required?: boolean`; wire `aria-required={required || undefined}` to `<button>`
- Replace `--atlas-foreground-on-brand` with `--atlas-background` on `.thumb`
- Add `:active` rules on `.track` for checked/unchecked states
- Add `[data-theme="dark"]` override for unchecked hover (use `--atlas-background` not `--atlas-background-subtle`)
- Add `min-height: var(--atlas-touch-min)` with `align-items: center` on `.track`

---

## FIX-03 — Badge component (6 bugs · 2 files)

| Bug | P | Title |
|---|---|---|
| BUG-021 | P2 | Intent foreground uses `--atlas-{intent}` not `--atlas-{intent}-foreground` |
| BUG-022 | P2 | Disabled: opacity only, no `--atlas-foreground-disabled` color override |
| BUG-023 | P2 | No `onClick` prop; no badge-level hover state |
| BUG-024 | P2 | Remove button `aria-label` generic fallback for non-string children |
| BUG-067 | P2 | `×` character inside remove button not `aria-hidden` |
| BUG-074 | P2 | Remove button 18–26px hit area — no touch target expansion |

**Files:** `Badge.tsx`, `Badge.module.css`

**Key changes:**
- Fix CSS: `.success { color: var(--atlas-success-foreground); }` etc.
- Add `color: var(--atlas-foreground-disabled)` to `.disabled`
- Add `onClick?: () => void` + `removeLabel?: string` to `BadgeProps`; render `<button>` when `onClick` present + `[data-interactive]` hover CSS
- Wrap `×` in `<span aria-hidden="true">`
- Add `@media (pointer: coarse)` pseudo-element touch target on `.removeBtn`

---

## FIX-04 — Card component (7 bugs · 2 files)

| Bug | P | Title |
|---|---|---|
| BUG-026 | P2 | Selected state missing `background-color: --atlas-background-subtle` |
| BUG-027 | P2 | Interactive card: no `aria-labelledby` → CardTitle linkage |
| BUG-065 | P2 | `role="button"` div: accessible name is empty (same root as BUG-027) |
| BUG-029 | P3 | `CardTitle` renders as `<p>` inside `<article>` — needs heading element |
| BUG-030 | P3 | Interactive uses `<div role="button">`; `asChild` prop absent |
| BUG-051 | P2 | `elevated` variant: `--atlas-background` merges with page in dark mode |
| BUG-054 | P2 | Filled interactive hover darkens in dark mode (inverted feedback) |

**Files:** `Card.tsx`, `Card.module.css`

**Key changes:**
- Add selected background: `.selected { background-color: var(--atlas-background-subtle); }`
- Generate `titleId = uid + "-title"`; pass via context; `CardTitle` sets `id={titleId}`; interactive element gets `aria-labelledby={titleId}`
- Change `CardTitle` default to `<h3>` with `as` prop
- Replace `<div role="button">` with native `<button type="button">`; add `asChild?: boolean` via Radix Slot
- `.elevated { background-color: var(--atlas-surface-raised); }`
- Add `[data-theme="dark"]` override for `.interactive.filled:hover`

---

## FIX-05 — Alert + token layer (2 bugs · 3 files)

| Bug | P | Title |
|---|---|---|
| BUG-031 | P2 | Border uses full intent tokens; `--atlas-{intent}-muted` tokens don't exist yet |
| BUG-032 | P2 | No exit/dismiss animation — alert unmounts instantly |

**Files:** `atlas.tokens.css`, `Alert.tsx`, `Alert.module.css`

**Key changes:**
- Add to `atlas.tokens.css`: `--atlas-info-muted`, `--atlas-success-muted`, `--atlas-warning-muted`, `--atlas-danger-muted` (100-level tints; add dark mode overrides)
- Update Alert border rules: `.info { border-color: var(--atlas-info-muted); }` etc.
- Add internal `isDismissing` state + `alertExit` keyframe (opacity 1→0 + max-height collapse)
- Wire `onAnimationEnd` to fire `onDismiss()` after exit completes

---

## FIX-06 — Dialog component (10 bugs · 2 files)

| Bug | P | Title |
|---|---|---|
| BUG-036 | P2 | Sheet/drawer: physical `left/right/bottom` → logical properties |
| BUG-037 | P2 | Drag handle wrapped in `RadixDialog.Close` — click = instant dismiss |
| BUG-050 | P2 | Panel uses `--atlas-background`; merges with page in dark mode |
| BUG-057 | P2 | `size="full"` variant missing from type and CSS |
| BUG-058 | P2 | Modal sm/md: no auto-sheet conversion below 640px |
| BUG-059 | P2 | Modal lg/xl: no full-screen override below 640px |
| BUG-062 | P3 | Drawer: physical `top/bottom/left/right` → logical equivalents |
| BUG-066 | P2 | Drag handle uses `<div role="button">` — should be visual-only `<div>` |
| BUG-071 | P2 | Sheet: no `padding-block-end: var(--atlas-safe-bottom)` |
| BUG-072 | P2 | Drawer: no `padding-block-start: var(--atlas-safe-top)` |

**Files:** `Dialog.tsx`, `Dialog.module.css`

**Key changes:**
- Sheet: `inset-inline: 0; inset-block-end: 0`
- Drawer: `inset-block: 0; inset-inline-end: 0` (end) / `inset-inline-start: 0` (start)
- Remove `<RadixDialog.Close>` from drag handle; render as `<div aria-hidden="true">` (BUG-037 + BUG-066 combined)
- `.panel { background-color: var(--atlas-surface-overlay); }`
- Add `"full"` to `DialogSize` + CSS rule
- Add `@media (max-width: 639px)` responsive overrides for sm/md (auto-sheet) and lg/xl (full-screen)
- Add safe-area padding on `.sheet` and `.drawer`

---

## FIX-07 — Tabs component (5 bugs · 2 files)

| Bug | P | Title |
|---|---|---|
| BUG-039 | P2 | Sliding indicator absent — active state jumps between triggers |
| BUG-040 | P2 | Compound API (`Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`) + `forceMount` missing |
| BUG-041 | P3 | `aria-label="Tabs"` hardcoded — should be caller-provided |
| BUG-042 | P3 | No `:active` pressed state on triggers |
| BUG-061 | P2 | Triggers sm/md below 44px — no coarse-pointer touch target |

**Files:** `Tabs.tsx`, `Tabs.module.css`

**Key changes:**
- Add `aria-label?: string` to `TabsProps`; remove hardcoded `"Tabs"` default
- Export `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel` as compound sub-components backed by `RadixTabs.*`
- Add `:active` CSS per variant mirroring hover assignments
- Add `@media (pointer: coarse) { .trigger { min-height: var(--atlas-touch-min); } }`
- Sliding indicator: add absolutely-positioned `.indicator` inside `.list`; track active trigger offset via `getBoundingClientRect` in `useLayoutEffect`

---

## FIX-08 — NavBar component (9 bugs · 3 files)

> Contains the only P1 bug in the entire codebase (BUG-069). Schedule before FIX-07.

| Bug | P | Title |
|---|---|---|
| **BUG-069** | **P1** | Mobile-native anatomy entirely absent (`NavBar.Header`, `NavBar.TabBar`, `NavBar.Tab`) |
| BUG-043 | P2 | Hamburger breakpoint 1024px; spec requires `< md` (768px) |
| BUG-044 | P2 | `aria-controls` points to non-existent id — `DialogContent` drops `id` prop |
| BUG-045 | P2 | `transparent` variant: no scroll listener |
| BUG-046 | P2 | `hideOnScroll` prop absent from `NavBarProps` |
| BUG-047 | P2 | Disabled link: no `.link[aria-disabled="true"]` CSS rule |
| BUG-048 | P2 | `NavLink` missing `leadingIcon` and `badge` props |
| BUG-068 | P3 | Brand slot not linked — no `brandHref` prop |
| BUG-070 | P2 | `--atlas-safe-top/bottom` tokens defined but never consumed |

**Files:** `NavBar.tsx`, `NavBar.module.css`, `Dialog.tsx`

**Key changes:**
- **BUG-069 (P1):** Implement `NavBar.Header`, `NavBar.Header.Leading`, `NavBar.Header.Title`, `NavBar.Header.Actions`, `NavBar.TabBar` (`role="tablist"`), `NavBar.Tab` (`role="tab"` + `aria-selected`)
- Fix breakpoint: `1024px` → `768px`
- Add `id?: string` to `DialogContentProps`; forward to `RadixDialog.Content`
- Add scroll listener for transparent variant; `.scrolled` class activates opaque surface
- Add `hideOnScroll?: boolean`; scroll-direction detection; `.hidden { transform: translateY(-100%); }`
- Add `.link[aria-disabled="true"] { color: var(--atlas-foreground-disabled); cursor: not-allowed; pointer-events: none; }`
- Add `leadingIcon?: React.ReactNode` + `badge?: React.ReactNode` to `NavLink`
- Add `brandHref?: string` + conditional `<a>` wrapper
- Apply `padding-block-start: var(--atlas-safe-top)` on `.navbar`

---

## FIX-09 — Input · Textarea · Checkbox · Button (6 bugs · 5 files)

| Bug | P | Title |
|---|---|---|
| BUG-052 | P2 | Input `filled` hover darkens in dark mode |
| BUG-055 | P2 | Textarea `filled` hover darkens in dark mode |
| BUG-056 | P3 | Checkbox `card` checked background near-invisible in dark mode |
| BUG-063 | P2 | Button `sm` / Input `sm` (32px): no coarse-pointer touch target |
| BUG-073 | P2 | Checkbox box 16–20px: no touch-target pseudo-element expansion |
| BUG-075 | P2 | Checkbox `forceMount={false}` TypeScript compile error |

**Files:** `Input.module.css`, `Textarea.module.css`, `Checkbox.tsx`, `Checkbox.module.css`, `Button.module.css`

**Key changes:**
- BUG-052/055: `[data-theme="dark"] .filled .input:hover { background-color: var(--atlas-background-muted); }` (hold at resting value)
- BUG-056: `[data-theme="dark"] .card[data-checked] { background-color: color-mix(in oklch, var(--atlas-primary) 15%, var(--atlas-surface-raised)); }`
- BUG-063: `@media (pointer: coarse) { .sm { min-height: var(--atlas-touch-min); } }` on Button + Input
- BUG-073: `@media (pointer: coarse)` pseudo-element expansion on `.box` (44×44px via `::before`)
- BUG-075: Remove `forceMount={false}` from `<RadixCheckbox.Indicator>` — omit prop entirely

---

## Recommended session order

| Order | Session | Rationale |
|---|---|---|
| 1 | FIX-01 | Pure CSS, zero risk, unblocks context for all other sessions |
| 2 | FIX-09 | Clears the TypeScript compile error (BUG-075) early |
| 3 | FIX-02 | Switch — self-contained, no dependencies |
| 4 | FIX-03 | Badge — self-contained |
| 5 | FIX-05 | Alert + tokens — adds muted tokens potentially needed downstream |
| 6 | FIX-04 | Card — no dependencies |
| 7 | FIX-06 | Dialog — complex but isolated; adds `id` prop needed by FIX-08 |
| 8 | FIX-07 | Tabs — compound API is the significant lift |
| 9 | FIX-08 | NavBar last — P1 BUG-069 is the largest single item; depends on Dialog `id` fix from FIX-06 |
