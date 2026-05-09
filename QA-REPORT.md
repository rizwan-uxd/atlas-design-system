# Atlas Design System — QA Report

> **Version:** 1.0  
> **Status:** In progress  
> **Last updated:** 2026-05-09

---

## Summary

| Metric | Value |
|---|---|
| Sessions completed | 1 of 14 |
| Total bugs filed | 3 |
| P1 bugs open | 0 |
| P2 bugs open | 0 (both fixed in QA-01) |
| P3 bugs open | 0 (fixed in QA-01) |
| Components spec-complete | 0 of 12 |

---

## Component Results

| Component | Token Audit | Visual QA | Dark Mode | Responsive | Accessibility | Mobile | Notes |
|---|---|---|---|---|---|---|---|
| **Token layer** | ✅ Pass | — | — | — | — | — | 3 bugs found + fixed |
| Button | — | — | — | — | — | — | — |
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
| QA-02 — Button | ⬜ Pending | — | — |
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
