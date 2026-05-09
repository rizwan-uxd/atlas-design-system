# Atlas Design System — QA Report

> **Version:** 1.0  
> **Status:** In progress  
> **Last updated:** 2026-05-09

---

## Summary

| Metric | Value |
|---|---|
| Sessions completed | 2 of 14 |
| Total bugs filed | 6 |
| P1 bugs open | 0 |
| P2 bugs open | 2 (BUG-004, BUG-005 — open) |
| P3 bugs open | 1 (BUG-006 — open) |
| Components spec-complete | 0 of 12 |

---

## Component Results

| Component | Token Audit | Visual QA | Dark Mode | Responsive | Accessibility | Mobile | Notes |
|---|---|---|---|---|---|---|---|
| **Token layer** | ✅ Pass | — | — | — | — | — | 3 bugs found + fixed |
| Button | ✅ Pass | ✅ Pass | ✅ Pass | ⚠️ P2 | ⚠️ P3 | — | 3 bugs open (BUG-004–006) |
| Input | — | — | — | — | — | — | — |
| Label | — | — | — | — | — | — | — |
| Textarea | — | — | — | — | — | — | — |
| Checkbox | — | — | — | — | — | — | — |
| Switch | — | — | — | — | — | — | — |
| Card | — | — | — | — | — | — | — |
| Badge | — | — | — | — | — | — | — |
| Alert | — | — | — | — | — | — | — |
| Dialog | — | — | — | — | — | — | — |
| Tabs | — | — | — | — | — | — | — |
| NavBar | — | — | — | — | — | — | — |

---

## Bug Log

### QA-01 — Token Audit

---

#### BUG-001 · P2 · FIXED

**Title:** Missing token `--atlas-spacing-9`

**Component:** `Dialog` → `Dialog.module.css:191`

**Description:** `Dialog.module.css` referenced `var(--atlas-spacing-9)` for the sheet drag handle width (36px), but the token was never defined in `atlas.tokens.css`. The spacing scale jumped from `--atlas-spacing-8` (32px) to `--atlas-spacing-10` (40px), leaving a gap at 36px. At runtime this would resolve to `unset`, making the drag handle collapse to 0 width.

**Fix applied:**
- Added `--atlas-spacing-9: 36px` to `atlas.tokens.css` spacing primitives
- Added `--spacing-9: var(--atlas-spacing-9)` to `@theme inline` block for Tailwind exposure

**Files changed:** `atlas.tokens.css`

---

#### BUG-002 · P2 · FIXED

**Title:** Hardcoded max-width values in `Dialog.module.css`

**Component:** `Dialog` → `Dialog.module.css` lines 38, 55, 57, 58

**Description:** Dialog size variants used raw pixel values (`400px`, `560px`, `720px`, `960px`) for `--_max-w` instead of design tokens. This made dialog sizing invisible to the token system and unaffected by any future global layout adjustments.

**Fix applied:**
- Added `--atlas-dialog-sm/md/lg/xl` tokens to `atlas.tokens.css`
- Updated `Dialog.module.css` to reference these tokens for all size variants

**Files changed:** `atlas.tokens.css`, `components/Dialog/Dialog.module.css`

---

#### BUG-003 · P3 · FIXED

**Title:** No global `prefers-reduced-motion` fallback in `globals.css`

**Component:** Global → `app/globals.css`

**Description:** `globals.css` contained only two import lines. While 10 of 12 components handled `prefers-reduced-motion` in their own module CSS, there was no system-level catch-all. Any future component added without a per-file override would silently animate under reduced-motion settings. Label and Badge have no animations today, but the global block protects against future drift.

**Fix applied:** Added a `@media (prefers-reduced-motion: reduce)` block to `globals.css` that sets `animation-duration`, `transition-duration`, and their delays to `var(--atlas-duration-instant)` (0ms) using `!important` as a last-resort fallback.

**Files changed:** `app/globals.css`

---

#### NOTE · P3 · DEFERRED

**Title:** NavBar `@media` queries use hardcoded `1024px` instead of a CSS variable

**Component:** `NavBar` → `NavBar.module.css` lines 106, 188

**Description:** `@media (min-width: 1024px)` appears twice. Standard CSS cannot use `var()` inside `@media` conditions, so this is not technically a bug — but it creates a maintenance risk if the breakpoint value ever changes in `atlas.tokens.css`. The `--atlas-breakpoint-lg: 1024px` token exists, but it cannot be referenced in a media query.

**Recommended approach:** Migrate NavBar responsive logic from `NavBar.module.css` `@media` rules to Tailwind `lg:` utility classes in `NavBar.tsx`, which resolves the token at build time.

**Status:** Deferred to QA-08 (NavBar session).

---

### QA-02 — Button

---

#### BUG-004 · P2 · OPEN

**Title:** Disabled state does not apply `--atlas-foreground-disabled` color

**Guard:** `state-helper`

**Component:** `Button` → `components/Button/Button.module.css:44–49`

**Description:** The spec foreground table explicitly maps `--atlas-foreground-disabled` as the text color for all variants when `disabled`. The current implementation applies only `opacity: var(--atlas-opacity-disabled)` at the element level, without overriding the `color` property. A disabled primary button renders `--atlas-primary-foreground` (white) at 50% opacity instead of the spec-defined neutral muted gray, deviating from the intended visual token and creating inconsistency across variants.

**Fix required:**
```css
.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: var(--atlas-opacity-disabled);
  cursor: not-allowed;
  pointer-events: none;
  color: var(--atlas-foreground-disabled); /* add this */
}
```

**Files to change:** `components/Button/Button.module.css`

---

#### BUG-005 · P2 · OPEN

**Title:** `icon` size is a fixed 40px square — not composable with `sm` / `lg`

**Guard:** `structure-enforcer`

**Component:** `Button` → `components/Button/Button.module.css:151–157`

**Description:** The spec states icon should "match size", meaning icon-only layout should be available at all three height steps (32px sm, 40px md, 48px lg). The current implementation treats `icon` as a 4th independent size hardcoded to 40px (md dimensions), making sm-icon and lg-icon impossible without breaking the type contract.

**Fix required:** Remove the standalone height/width from `.icon`. Introduce size-specific icon rules that clamp width = height and zero padding:
```css
/* .icon becomes a layout modifier only */
.icon { padding: 0; }
.sm.icon { width: var(--atlas-spacing-8); }   /* 32px */
.md.icon { width: var(--atlas-spacing-10); }  /* 40px */
.lg.icon { width: var(--atlas-spacing-12); }  /* 48px */
```
API stays `size="sm" | "md" | "lg" | "icon"` — but `icon` should combine with a size prop or be a boolean `iconOnly` modifier.

**Files to change:** `components/Button/Button.module.css`, `components/Button/Button.tsx`

---

#### BUG-006 · P3 · OPEN

**Title:** No runtime enforcement of `aria-label` when `size="icon"`

**Guard:** `accessibility-lite`

**Component:** `Button` → `components/Button/Button.tsx:60`

**Description:** The spec requires `aria-label` when `size="icon"` (the label slot is empty, so screen readers have nothing to announce). The requirement is noted only in a JSDoc comment — no dev-mode warning fires if a caller omits it, making the a11y regression silent and hard to catch in review.

**Fix required:** Add a dev-mode invariant in the component body:
```tsx
if (
  process.env.NODE_ENV !== "production" &&
  size === "icon" &&
  !rest["aria-label"] &&
  !rest["aria-labelledby"]
) {
  console.warn(
    "[Atlas Button] size='icon' requires an aria-label or aria-labelledby prop for screen reader accessibility."
  )
}
```

**Files to change:** `components/Button/Button.tsx`

---

## QA-02 Checklist — Button

**Source files reviewed:** `components/Button/Button.tsx`, `components/Button/Button.module.css`
**Spec:** `ATLAS-SPEC/Button.md`

- [x] All 6 variants declared and styled (primary, secondary, outline, ghost, destructive, link) ✅
- [x] All 4 sizes declared (sm 32px, md 40px, lg 48px, icon) ✅
- [x] All 6 states covered (default · hover · focus-visible · active · disabled · loading) ✅
- [x] Token audit — no hex literals, no magic pixel numbers; all values reference `--atlas-*` semantic tokens ✅
- [x] Background token mappings per variant × state match spec table ✅
- [x] Foreground token mappings — default states correct ✅
- [ ] Foreground token mappings — disabled state: missing `--atlas-foreground-disabled` override → **BUG-004**
- [x] Border: `outline` variant uses `--atlas-border-strong`; all others use `transparent` border ✅
- [x] Radius: `--atlas-radius-md` on all variants; link resets to `0` ✅
- [x] Focus ring: `var(--atlas-border-width-2)` outline + `var(--atlas-focus-ring)` + `var(--atlas-spacing-0_5)` offset ✅
- [x] Motion: `background-color`, `color`, `border-color` transition via `--atlas-duration-fast` + `--atlas-easing-standard` ✅
- [x] `prefers-reduced-motion` — transitions disabled; spinner frozen + dimmed ✅
- [x] Logical properties throughout — `padding-inline`, `border-block-start-color`; no `left`/`right` ✅
- [x] Loading: spinner replaces leading icon slot; label visible; trailing icon space preserved via `visibility: hidden` ✅
- [x] `aria-busy="true"` set when loading ✅
- [x] `aria-disabled="true"` set when disabled OR loading ✅
- [x] `pointer-events: none` on `[aria-disabled="true"]` ✅
- [x] `onClick` suppressed in JS when disabled or loading (belt-and-suspenders) ✅
- [x] Radix `Slot` used for `asChild` — correct polymorphic pattern ✅
- [x] `type="button"` default prevents accidental form submission ✅
- [ ] `icon` size composable with sm/md/lg → **BUG-005**
- [ ] Runtime `aria-label` warning for icon-only → **BUG-006**

**Exit condition:** 3 open bugs (BUG-004 P2, BUG-005 P2, BUG-006 P3). Fixes pending approval.

---

## QA-01 Checklist — Token Audit

- [x] `grep -rn "#[0-9a-fA-F]{3,6}" components/` — **zero results** ✅
- [x] `grep -rn "rgba\|rgb(" components/` — **zero results** ✅
- [x] `grep -rn "px\b" components/` — reviewed; all hardcoded px either in comments or in `@media` queries (unavoidable). BUG-001 + BUG-002 found and fixed.
- [x] `atlas.tokens.css` — every semantic token references a primitive token; no raw OKLCH in semantic layer ✅
- [x] Dark mode tokens — every `--atlas-color-*` semantic token has a `[data-theme="dark"]` override ✅ (38 dark overrides for 29 semantic root tokens; shadow tokens also overridden)
- [x] Motion tokens present — `--atlas-duration-*` and `--atlas-easing-*` defined ✅
- [x] `prefers-reduced-motion` override — global block added to `globals.css`; per-component overrides present in Button, Input, Textarea, Checkbox, Switch, Alert, Dialog, Card, NavBar, Tabs ✅

**Exit condition met:** All violations filed and fixed.

---

## Session Progress

| Session | Status | Date | Notes |
|---|---|---|---|
| QA-01 — Token Audit | ✅ Complete | 2026-05-09 | 3 bugs found, all fixed |
| QA-02 — Button | 🟡 Bugs Open | 2026-05-09 | 3 bugs open (BUG-004 P2, BUG-005 P2, BUG-006 P3) |
| QA-03 — Input + Label | ⬜ Pending | — | — |
| QA-04 — Textarea + Checkbox | ⬜ Pending | — | — |
| QA-05 — Switch + Badge | ⬜ Pending | — | — |
| QA-06 — Card | ⬜ Pending | — | — |
| QA-07 — Alert + Dialog | ⬜ Pending | — | — |
| QA-08 — Tabs + NavBar | ⬜ Pending | — | — |
| QA-09 — Dark Mode Pass | ⬜ Pending | — | — |
| QA-10 — Responsive Pass | ⬜ Pending | — | — |
| QA-11 — Accessibility Pass | ⬜ Pending | — | — |
| QA-12 — Mobile Pass | ⬜ Pending | — | — |
| QA-13 — Regression Pass | ⬜ Pending | — | — |
| QA-14 — Release Sign-off | ⬜ Pending | — | — |
