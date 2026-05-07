# Atlas Component Fix Plan
> v1 · Generated 2026-05-05 · Covers all 12 components · Based on ATLAS-SPEC + six-guard rules

---

## How to read this plan

Each component lists:
1. **Guard violations** — which of the 6 guards it fails and why
2. **Exact fixes** — line-level actions, token swaps, and structural changes
3. **Pre-session checklist** — what to verify before marking done

All fixes must comply with these non-negotiable rules (token enforcer + structure enforcer):
- Zero hex literals in any component file
- Zero magic numbers — all spacing/radius/motion/opacity via `var(--atlas-*)` tokens
- Zero primitive token references (e.g. `--atlas-color-brand-600`) — use semantic aliases only (`--atlas-primary`)
- Logical CSS properties only: `padding-inline-*`, `margin-block-*`, `inset-inline-*`. Never `left`/`right`/`top`/`bottom` for directional layout
- All motion via `var(--atlas-duration-*)` + `var(--atlas-easing-*)`; always paired with `prefers-reduced-motion: reduce` override
- Variant matrix lives in CVA, never in per-state if/else branches
- Every interactive state declared: `default · hover (web) · focus-visible · active · disabled · loading`

---

## Pre-flight: Radix packages to install (before sessions start)

```bash
npm install @radix-ui/react-switch @radix-ui/react-dialog @radix-ui/react-tabs
# Already installed: @radix-ui/react-checkbox @radix-ui/react-slot
```

---

## Token gap (must fix BEFORE Alert session)

The following tokens are referenced in `ATLAS-SPEC/Alert.md` and `ATLAS-SPEC/Badge.md` but are **not defined** in `atlas.tokens.css`. Add them to the semantic section before touching Alert or Badge:

```css
/* Light */
--atlas-info-muted:    var(--atlas-color-info-100);
--atlas-success-muted: var(--atlas-color-success-100);
--atlas-warning-muted: var(--atlas-color-warning-100);
--atlas-danger-muted:  var(--atlas-color-danger-100);

/* Dark overrides — in [data-theme="dark"] block */
--atlas-info-muted:    var(--atlas-color-info-700);
--atlas-success-muted: var(--atlas-color-success-700);
--atlas-warning-muted: var(--atlas-color-warning-700);
--atlas-danger-muted:  var(--atlas-color-danger-700);
```

---

## Tier 1 — Close (1 focused session each)

---

### 1. Button

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Tokens likely in `.module.css` — audit for any hex or magic numbers |
| structure-enforcer | Verify logical properties and prefers-reduced-motion block |
| state-helper | Confirm all 6 states × 6 variants via CVA and CSS pseudo-classes |

**Exact fixes:**
1. Audit `Button.module.css` — replace `padding: 8px 16px` → `padding-block: 0; padding-inline: var(--atlas-spacing-4)`
2. `border-radius: 8px` → `var(--atlas-radius-md)`; link variant → `0`
3. `transition: 120ms ease-out` → `var(--atlas-duration-fast) var(--atlas-easing-standard)`
4. Add `@media (prefers-reduced-motion: reduce) { transition-duration: 0ms }` block
5. `aria-busy="true"` when `loading=true`
6. `aria-disabled` set alongside HTML `disabled`
7. `aria-label` enforced when `size="icon"`
8. Size heights via `min-block-size`: sm=`--atlas-spacing-8`, md=`--atlas-spacing-10`, lg=`--atlas-spacing-12`
9. Focus ring: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px` on `:focus-visible`

**Token map:**
```
primary bg:       --atlas-primary / --atlas-primary-hover / --atlas-primary-active
secondary bg:     --atlas-background-muted / --atlas-background-subtle
outline bg:       transparent / --atlas-background-subtle / --atlas-background-muted
ghost bg:         transparent / --atlas-background-subtle / --atlas-background-muted
destructive bg:   --atlas-danger / --atlas-danger-hover
disabled all:     opacity: var(--atlas-opacity-disabled)
foreground:       --atlas-primary-foreground (primary/destructive) / --atlas-foreground (others)
border:           outline variant only → --atlas-border-strong
focus ring:       --atlas-focus-ring
```

---

### 2. Input

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Zero `--atlas-*` tokens detected inline |
| state-helper | Loading state (trailing spinner) not wired |
| structure-enforcer | Affix slots need logical positioning |

**Exact fixes:**
1. Add full token-based state matrix via CSS module or CVA
2. Size heights: sm=32px, md=40px, lg=48px via `min-block-size`
3. Padding-inline: sm/md=`--atlas-spacing-3`, lg=`--atlas-spacing-4`
4. Background, border, foreground per variant/state (see token map)
5. Focus ring: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px`
6. Loading: hide trailing icon, show CSS spinner in trailing slot
7. Affix slots: `padding-inline-*` and `--atlas-border` separator
8. `aria-invalid="true"` when `invalid=true`
9. Radius: `--atlas-radius-md` (default/filled); `0` (unstyled)

**Token map:**
```
default bg:   --atlas-background / --atlas-background-muted (disabled)
filled bg:    --atlas-background-muted → --atlas-background-subtle (hover) → --atlas-background (focus)
border default: --atlas-border → --atlas-border-strong (hover) → --atlas-primary (focus) → --atlas-danger (error)
border filled: none → bottom --atlas-primary (focus) → bottom --atlas-danger (error)
text:         --atlas-foreground / --atlas-foreground-muted (placeholder) / --atlas-foreground-disabled (disabled)
icons:        --atlas-foreground-muted
```

---

### 3. Checkbox

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Zero `--atlas-*` inline tokens |
| structure-enforcer | Focus ring must scope to box only, not full row |

**Exact fixes:**
1. Box background per state → semantic tokens (see map)
2. Box border: `var(--atlas-border-width-1) solid var(--atlas-border-strong)` (unchecked) → none (checked)
3. Checked bg: `--atlas-primary` → `--atlas-primary-hover` (hover) → `--atlas-danger` (error)
4. Indicator stroke: `var(--atlas-primary-foreground)` / error+checked → `var(--atlas-danger-foreground)`
5. Box radius: `--atlas-radius-sm` (not md)
6. Focus ring on box element only: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px`
7. Indicator animation: `scale(0) → scale(1)` over `var(--atlas-duration-fast) var(--atlas-easing-emphasized)`
8. `prefers-reduced-motion` → instant indicator
9. Card variant: full card is click target; `--atlas-primary` border when checked
10. `aria-invalid="true"` when `invalid=true`; `aria-required="true"` when `required=true`

---

### 4. Switch

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Zero semantic tokens — hardcoded sizing and colours |
| state-helper | No Radix → no `role="switch"` or `aria-checked` |
| structure-enforcer | Track/thumb dimensions not tokenised |

**Exact fixes:**
1. Install and wrap `@radix-ui/react-switch`
2. Track sizes: sm=32×18px, md=40×24px — use `--atlas-spacing-8/10` for width; local vars for height
3. Thumb: sm=14px, md=20px diameter; `border-radius: var(--atlas-radius-full)`
4. Track bg: `--atlas-background-muted` (off) → `--atlas-primary` (on) → `--atlas-primary-hover` (on+hover)
5. Disabled: `opacity: var(--atlas-opacity-disabled)` + `pointer-events: none`
6. Thumb bg: `--atlas-background`; optional `box-shadow: var(--atlas-shadow-sm)`
7. Track radius: `--atlas-radius-full`
8. Focus ring on track: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px`
9. Thumb translate: `var(--atlas-duration-base) var(--atlas-easing-emphasized)`; `prefers-reduced-motion` → instant
10. `aria-labelledby` → label; `aria-describedby` → description

---

### 5. Textarea

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Only 1 token found; sizes and states are hardcoded |
| state-helper | Resize handle and character counter partially implemented |

**Exact fixes:**
1. Min-heights: sm=`min-block-size: 80px`, md=`96px`, lg=`128px`
2. Padding: sm=`--atlas-spacing-2` `--atlas-spacing-3`, md=`--atlas-spacing-3`, lg=`--atlas-spacing-3` `--atlas-spacing-4`
3. Same bg/border/foreground token matrix as Input
4. Resize handle: `color: var(--atlas-foreground-muted)`; 8×8px size
5. Counter: `inset-block-end: var(--atlas-spacing-2); inset-inline-end: var(--atlas-spacing-2)` — logical; `font-size: var(--atlas-font-size-xs)`
6. Counter over limit: `color: var(--atlas-danger)`
7. `aria-live="polite"` on counter
8. `aria-invalid="true"` when `invalid=true`
9. `prefers-reduced-motion` block

---

## Tier 2 — Needs Work (1–2 sessions each)

---

### 6. Label

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Zero tokens — no semantic color or typography tokens |
| accessibility-lite | Disabled/error color states missing |

**Exact fixes:**
1. `color` per state: default=`--atlas-foreground`, disabled=`--atlas-foreground-disabled`, error=`--atlas-danger`
2. Required marker `*`: `color: var(--atlas-danger)`; disabled → `--atlas-foreground-disabled`
3. Optional hint: `color: var(--atlas-foreground-muted)`
4. Font weight: `var(--atlas-font-weight-medium)`
5. Add `size` prop → font-size: sm=`--atlas-font-size-sm`, md=`--atlas-text-body-sm`, lg=`--atlas-text-body`
6. Gap to control: `margin-block-end: var(--atlas-spacing-1_5)`
7. `inline` variant: `display: inline-flex; align-items: center; margin-block-end: 0; margin-inline-end: var(--atlas-spacing-2)`
8. Label is not interactive — no focus ring needed

---

### 7. Card

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Missing size-driven padding tokens; shadow token missing for elevated |
| state-helper | No interactive/hover/focus states |
| accessibility-lite | No `role`, no `aria-labelledby` for interactive cards |
| structure-enforcer | No compound sub-components; no logical properties |
| consistency-guard | No `size` prop; no CVA matrix |

**Exact fixes:**
1. Full compound API: `Card`, `Card.Header`, `Card.Content`, `Card.Footer`
2. `Card.Header` slots: `leading`, `title` (required), `subtitle`, `action`
3. `Card.Footer` justify prop: `"start" | "between" | "end"`
4. `size` CVA: sm=`--atlas-spacing-3`, md=`--atlas-spacing-4`, lg=`--atlas-spacing-6` padding; gap tokens between sections
5. Radius: `--atlas-radius-lg` all variants
6. Elevated: `box-shadow: var(--atlas-shadow-md)`; no border
7. Outlined: `border: var(--atlas-border-width-1) solid var(--atlas-border-strong)`
8. Default: `border: var(--atlas-border-width-1) solid var(--atlas-border)`
9. Filled: `background: var(--atlas-background-muted)`
10. `interactive` prop: wrap in `<button>` or add `onClick`; hover=`--atlas-background-subtle`
11. Focus ring: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px` on `:focus-visible`
12. `selected` prop: `border: var(--atlas-border-width-1) solid var(--atlas-primary)` all variants
13. `role="article"` non-interactive; interactive → `role="button"` via `<button>`
14. `aria-labelledby` pointing to title when interactive
15. Title: `--atlas-foreground` `var(--atlas-text-h4)` · Subtitle: `--atlas-foreground-muted` `var(--atlas-text-body-sm)`
16. Motion: `var(--atlas-duration-fast) var(--atlas-easing-standard)`; `prefers-reduced-motion` block

---

### 8. Badge

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | **Critical** — uses primitive tokens (`--atlas-color-neutral-200`, `--atlas-color-success-100`) |
| state-helper | Missing `size` prop; missing `intent` prop for outline variant |
| accessibility-lite | Removable button missing `aria-label`; status badges missing `role="status"` |

**Exact fixes:**
1. Replace ALL primitive tokens:
   - `--atlas-color-neutral-200` → `--atlas-background-muted`
   - `--atlas-color-success-100` → `--atlas-success-subtle`
   - `--atlas-color-warning-100` → `--atlas-warning-subtle`
   - `--atlas-color-danger-100` → `--atlas-danger-subtle`
2. Fix foreground on subtle backgrounds: use `--atlas-success`, `--atlas-warning`, `--atlas-danger`, `--atlas-info` (mid-tone semantic tokens on subtle fills)
3. `size` prop CVA: sm=18px, md=22px, lg=26px heights; padding-inline and font-size per size
4. `square` prop: `border-radius: var(--atlas-radius-sm)` when true; default `--atlas-radius-full`
5. `intent` prop for outline variant: border and foreground follow intent token
6. Removable `<button aria-label="Remove {children}">`; `min-block-size: var(--atlas-touch-min)` on mobile
7. Dot: 6px circle, `margin-inline-end: var(--atlas-spacing-1_5)`; color = intent mid-tone
8. Disabled: `opacity: var(--atlas-opacity-disabled)`

---

### 9. Alert

**⚠ Requires token gap fix first** — add `--atlas-*-muted` tokens to `atlas.tokens.css`.

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Emoji icons, no motion tokens, no size prop |
| accessibility-lite | **Critical** — missing `role="alert"` / `role="status"` |
| state-helper | No enter/exit animation; no dismissing state |
| structure-enforcer | Only 41 lines — missing most anatomy slots |

**Exact fixes:**
1. Replace emoji icons with SVG icon components
2. `role="alert"` on `warning` + `danger` variants
3. `role="status"` on `info` + `success` variants
4. `size` prop: sm=`--atlas-spacing-3` padding, md=`--atlas-spacing-4`
5. Border: `var(--atlas-border-width-1) solid var(--atlas-*-muted)` per variant
6. Foreground: title=`--atlas-*-foreground`; description=`--atlas-foreground`
7. Radius: `--atlas-radius-md`
8. Enter animation: `opacity + translateY(4px→0)` over `var(--atlas-duration-base) var(--atlas-easing-emphasized)`
9. Exit: `opacity + height collapse` over `var(--atlas-duration-base) var(--atlas-easing-exit)`
10. `prefers-reduced-motion` → instant
11. `hideIcon` prop; `icon` prop to override default
12. Dismiss button: `<button aria-label="Dismiss">` ghost styled; `min-block-size: var(--atlas-touch-min)`
13. `actions` slot below description

---

## Tier 3 — Significant Rebuild (2 sessions each)

---

### 10. Dialog

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Missing overlay, z-index, shadow, padding tokens |
| accessibility-lite | **Critical** — no focus trap, no `aria-modal`, no scroll lock |
| state-helper | No compound sub-components; no open/closing animations |
| structure-enforcer | Must use `@radix-ui/react-dialog` |

**Session A — Structure + A11y:**
1. Wrap with `@radix-ui/react-dialog` (focus trap, scroll lock, `aria-modal`, `role="dialog"` built-in)
2. Compound API: `Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`, `Dialog.Title`, `Dialog.Description`, `Dialog.Body`, `Dialog.Footer`, `Dialog.Close`
3. Overlay: `background: oklch(from var(--atlas-overlay) l c h / var(--atlas-opacity-overlay))`; z-index: `var(--atlas-z-overlay)`
4. Content: z-index `var(--atlas-z-modal)`; bg `--atlas-background`; border `var(--atlas-border-width-1) solid var(--atlas-border)`; shadow `--atlas-shadow-xl`; radius `--atlas-radius-lg`
5. Title: `--atlas-foreground` `var(--atlas-text-h3)` · Description: `--atlas-foreground-muted` `var(--atlas-text-body-sm)`

**Session B — Variants, Sizes, Motion:**
6. `variant`: modal (centered scale+fade), sheet (translateY from bottom), drawer (translateX from side)
7. `size` prop max-widths: sm=400px, md=560px, lg=720px, xl=960px
8. `side` prop for drawer: `"start" | "end"` (logical)
9. Modal enter: `scale(0.96→1) + opacity(0→1)` over `var(--atlas-duration-base) var(--atlas-easing-emphasized)`
10. Sheet enter: `translateY(100%→0)` · Drawer: `translateX(...)` — same timing
11. All exit animations reversed; `prefers-reduced-motion` → instant
12. Padding: sm=`--atlas-spacing-4`, md=`--atlas-spacing-6`, xl=`--atlas-spacing-8`
13. Drag handle (sheet): 36×4px, `background: var(--atlas-border-strong)`, `border-radius: var(--atlas-radius-full)`, `margin-block-start: var(--atlas-spacing-2)`

---

### 11. Tabs

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Active indicator not animated; some hardcoded values |
| accessibility-lite | **Critical** — missing `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-controls`, `aria-labelledby` |
| state-helper | No roving tabindex / arrow-key navigation |
| structure-enforcer | Must use `@radix-ui/react-tabs` |

**Session A — Structure + A11y:**
1. Wrap with `@radix-ui/react-tabs` (tablist/tab/tabpanel roles, aria-controls/labelledby, arrow keys built-in)
2. Compound API: `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`
3. `Tabs.List` with `scrollable` prop (overflow-x: auto, scroll-snap)
4. `Tabs.Trigger` with `leadingIcon`, `badge`, `disabled` slots
5. `activationMode` prop: `"automatic"` | `"manual"`

**Session B — Variants, Sizes, Motion:**
6. `variant` CVA: underline / pills / enclosed (see token maps in spec)
7. `size` CVA: sm=32px, md=40px, lg=48px trigger heights
8. Underline: active → `border-block-end: 2px solid var(--atlas-primary)`; list → `var(--atlas-border-width-1) solid var(--atlas-border)` on block-end
9. Pills: active → `background: --atlas-primary; color: --atlas-primary-foreground`; radius `--atlas-radius-md`
10. Enclosed: list bg `--atlas-background-muted`; active → `background: --atlas-background; box-shadow: --atlas-shadow-sm`
11. Inactive: `--atlas-foreground-muted` → `--atlas-foreground` (hover); disabled `--atlas-foreground-disabled`
12. Active indicator slide: `transform: translateX(...)` over `var(--atlas-duration-base) var(--atlas-easing-emphasized)`
13. Color transitions: `var(--atlas-duration-fast) var(--atlas-easing-standard)`
14. Focus ring: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px`
15. `prefers-reduced-motion` → instant indicator

---

### 12. NavBar

**Guard violations:**
| Guard | Issue |
|---|---|
| token-enforcer | Missing z-index, logical border, motion tokens |
| accessibility-lite | Missing `aria-current="page"`, `role="navigation"`, `aria-label` |
| state-helper | No scroll state, no variant, no size prop |
| structure-enforcer | Missing compound slots; no Drawer for mobile; uses `left/right` |

**Session A — Compound structure + A11y:**
1. Compound API: `NavBar`, `NavBar.Brand`, `NavBar.Links`, `NavBar.Link`, `NavBar.Actions`, `NavBar.MobileMenu`
2. `<nav aria-label="Primary">` wrapping links
3. `NavBar.Link`: `aria-current="page"` when `active=true`
4. `NavBar.MobileMenu`: hamburger button → opens Dialog `variant="drawer"` `side="start"` at breakpoint < md
5. Z-index: `var(--atlas-z-sticky)` (1100)
6. `position: sticky; inset-block-start: 0`

**Session B — Variants, Sizes, Scroll, Motion:**
7. `variant` CVA: default, transparent, elevated (bg/border/shadow per spec)
8. `size` prop: sm=48px, md=64px, lg=80px via `min-block-size`
9. Scrolled state: `data-scrolled="true"` via JS scroll listener; CSS transitions bg → `--atlas-background` + border
10. Link states: `--atlas-foreground-muted` → `--atlas-foreground` (hover) → `--atlas-primary` underline (active)
11. Active underline: `border-block-end: 2px solid var(--atlas-primary)` — logical property
12. Touch targets: `min-block-size: var(--atlas-touch-min)` on all links
13. `hideOnScroll` prop: `transform: translateY(-100%)` over `var(--atlas-duration-base) var(--atlas-easing-emphasized)`
14. Focus ring: `outline: 2px solid var(--atlas-focus-ring); outline-offset: 2px`
15. All directional styles → logical properties; RTL handled automatically

---

## Session sequencing

| Session | Component | Key deliverable |
|---|---|---|
| 0 | `atlas.tokens.css` | Add missing muted tokens; install 3 Radix packages |
| 1 | Button | CSS module token audit; motion + a11y pass |
| 2 | Checkbox | Token pass; focus ring scoping; indicator animation |
| 3 | Switch | Radix wrap; track/thumb sizing; thumb glide motion |
| 4 | Input | Full token matrix; affixes; loading state |
| 5 | Textarea | Token pass; resize handle; counter; min-heights |
| 6 | Label | Token states; size prop; inline variant |
| 7 | Card | Full compound rebuild; interactive states; a11y |
| 8 | Badge | Primitive token purge; size/intent props; a11y |
| 9 | Alert | Role wiring; enter/exit animation; size prop |
| 10a | Dialog | Radix wrap; compound structure; a11y |
| 10b | Dialog | Variants + sizes + motion |
| 11a | Tabs | Radix wrap; compound structure; a11y |
| 11b | Tabs | Variants + indicator animation + keyboard |
| 12a | NavBar | Compound structure; a11y; Drawer wiring |
| 12b | NavBar | Variants + scroll state + motion |

---

## Definition of done (per component)

- [ ] Zero `grep --atlas-color-` hits in the component file (no primitive tokens)
- [ ] Zero hex color literals (`#`, `rgb(`, `hsl(`) in the component file
- [ ] Zero magic numbers for spacing/radius/motion/opacity
- [ ] All `left`/`right` replaced with logical equivalents
- [ ] `prefers-reduced-motion: reduce` block present (if component has transitions)
- [ ] All interactive states expressed via CSS pseudo-classes + CVA (no runtime if/else per state)
- [ ] ARIA roles, labels, and live regions correct per ATLAS-SPEC
- [ ] Focus ring visible in both Light and Dark via `--atlas-focus-ring`
- [ ] Sandbox builds without TypeScript errors (`npm run build`)
- [ ] Sandbox renders correctly in Light + Dark — verified visually in `app/page.tsx`
