# Atlas Design System — QA Execution Plan

> **Version:** 1.0  
> **Scope:** Atlas v1 Web + Mobile-Native components  
> **Status:** Pre-release validation  
> **Owner:** Design Systems Team

---

## 1. QA Goals

- Verify all 12 v1 components meet the Atlas spec before release
- Confirm design token fidelity across web (Tailwind) and mobile (NativeWind)
- Validate functional correctness across all states, variants, and sizes
- Ensure WCAG 2.1 AA accessibility compliance on every component
- Confirm visual consistency across light/dark themes and all breakpoints
- Catch regressions introduced by token or component updates
- Produce a signed-off release artifact that documents QA results

---

## 2. Scope

### In scope
- All 12 Atlas v1 components: `Button`, `Input`, `Label`, `Textarea`, `Checkbox`, `Switch`, `Card`, `Badge`, `Alert`, `Dialog`, `Tabs`, `NavBar`
- Design tokens (`atlas.tokens.css`, NativeWind token mapping)
- Shared responsive layout patterns
- Light and dark theme switching
- Web: Next.js sandbox (`app/page.tsx`)
- Mobile: React Native / NativeWind implementation

### Out of scope
- v2 / experimental components not yet in `ATLAS-COMPONENTS-V1.md`
- Consumer app business logic
- Back-end / API integrations

---

## 3. Platforms Covered

| Platform | Environment | Engine |
|---|---|---|
| Web — Chrome | Desktop + Tablet | Blink |
| Web — Safari | Desktop + iOS | WebKit |
| Web — Firefox | Desktop | Gecko |
| Web — Edge | Desktop | Blink |
| iOS | iPhone 14 / 15, iPad | React Native / NativeWind |
| Android | Pixel 7, Samsung S23 | React Native / NativeWind |
| Screen readers | NVDA + Chrome, JAWS + Chrome, VoiceOver iOS, TalkBack Android | — |

---

## 4. Testing Types

| Type | Tool / Method | Trigger |
|---|---|---|
| **Visual QA** | Sandbox (`localhost:3000`), screenshots, design comp overlay | Every component change |
| **Functional QA** | Manual interaction in sandbox + unit tests | Every state/variant change |
| **Accessibility QA** | axe DevTools, keyboard-only walk, screen reader | Every component change |
| **Responsive QA** | Chrome DevTools device emulation + physical devices | Layout/token change |
| **Dark Mode QA** | `data-theme="dark"` toggle in sandbox | Token or theme file change |
| **Interaction QA** | Manual: hover, focus, click, drag, keyboard | Every interactive component |
| **Token QA** | CSS variable audit script, computed style checks | Any `atlas.tokens.css` change |
| **Regression QA** | Storybook snapshot diff / visual regression baseline | Pre-release, post any merge |

---

## 5. Component Validation Checklist

Run this checklist for **every component** before marking it spec-complete.

### 5.1 Visual fidelity
- [ ] Matches Figma comp at 1:1 (use overlay or side-by-side)
- [ ] All spacing values derived from `--atlas-spacing-*` tokens
- [ ] All radius values derived from `--atlas-radius-*` tokens
- [ ] All color values derived from `--atlas-color-*` semantic tokens — no hardcoded hex values
- [ ] Typography (size, weight, line-height, letter-spacing) maps to `--atlas-text-*` tokens
- [ ] Shadows use `--atlas-shadow-*` tokens
- [ ] Icon sizes match spec (16 / 20 / 24 px as defined per component)

### 5.2 States
- [ ] Default / rest
- [ ] Hover (cursor change + visual feedback)
- [ ] Focus-visible (ring color, width, offset from token)
- [ ] Active / pressed
- [ ] Disabled (no pointer events, reduced opacity or token-correct style)
- [ ] Loading (spinner or skeleton; accessible label)
- [ ] Error / invalid
- [ ] Read-only (where applicable)

### 5.3 Variants & sizes
- [ ] Every documented variant renders without layout break
- [ ] Every documented size renders without layout break
- [ ] Variant × size matrix: no combination produces broken output

### 5.4 Composition
- [ ] Compound slots (e.g. `Card.Header`, `Dialog.Footer`) compose correctly
- [ ] Icon slots accept arbitrary icon without overflow
- [ ] No content truncation unless spec calls for it (use `text-overflow` token pattern)

### 5.5 Theme
- [ ] All states look correct in light mode
- [ ] All states look correct in dark mode
- [ ] No `[data-theme]` override bleeds into wrong component

### 5.6 Token usage
- [ ] Zero hardcoded color values (`grep -r "#[0-9a-fA-F]" components/`)
- [ ] Zero hardcoded spacing values (`px-4` is acceptable only if `4` maps to an atlas token step)
- [ ] `atlas.tokens.css` is the single source of truth

### 5.7 Accessibility (per component)
- [ ] Correct ARIA role, name, and description
- [ ] `aria-disabled` set (not just `disabled` attribute) on interactive elements where applicable
- [ ] Focus ring visible and within 3:1 contrast ratio against adjacent color
- [ ] Color is never the only differentiator of state
- [ ] Touch target ≥ 44 × 44 px (web and mobile)
- [ ] Screen reader announces state changes (loading, error, expanded, selected)

### 5.8 Interaction behavior
- [ ] Keyboard-operable (Tab, Enter/Space, Escape where applicable)
- [ ] No focus trap outside of intended modal contexts
- [ ] `prefers-reduced-motion`: animations suppressed or replaced with instant transition

---

## 6. Responsive Testing Matrix

Test each component at the following breakpoints using Chrome DevTools and physical devices:

| Breakpoint | Width | Label |
|---|---|---|
| Mobile S | 375 px | `xs` |
| Mobile L | 430 px | `sm` |
| Tablet | 768 px | `md` |
| Desktop | 1280 px | `lg` |
| Large desktop | 1920 px | `xl` |

### Pass criteria per breakpoint

- [ ] No horizontal overflow / scrollbar introduced
- [ ] Text does not clip or truncate unexpectedly
- [ ] Icon and image assets scale correctly
- [ ] Touch targets remain ≥ 44 px on mobile breakpoints
- [ ] NavBar collapses to mobile menu at correct breakpoint
- [ ] Dialog / Sheet adapts correctly (full-screen on mobile)
- [ ] Card grid / flex layout reflows without gap irregularities
- [ ] Tabs overflow scrolls horizontally (mobile) rather than wrapping

---

## 7. Accessibility Checklist

### Contrast
- [ ] Text on background: ≥ 4.5:1 (normal text), ≥ 3:1 (large text / bold ≥ 18.66 px)
- [ ] UI component boundaries against adjacent surface: ≥ 3:1
- [ ] Focus ring against adjacent color: ≥ 3:1
- [ ] Both light and dark themes pass independently

### Keyboard navigation
- [ ] Tab order is logical and matches visual order
- [ ] No keyboard trap (except intentional modal trap)
- [ ] All interactive elements reachable via Tab / Shift+Tab
- [ ] Roving tabindex implemented for Tabs (arrow keys move focus between triggers)
- [ ] Dialog: focus moves to dialog on open, returns to trigger on close
- [ ] Escape closes Dialog, dismissible Alert, open Tabs dropdown
- [ ] NavBar mobile menu toggled via Enter/Space on hamburger button

### Screen readers
- [ ] Run with NVDA + Chrome (Windows) and VoiceOver + Safari (macOS/iOS)
- [ ] Buttons announce label + role (no icon-only ambiguity)
- [ ] Form inputs announce label, hint, error message via `aria-describedby`
- [ ] Checkbox / Switch announce checked / unchecked / indeterminate
- [ ] Badge count announced inline or via `aria-label`
- [ ] Alert auto-announces via `role="alert"` or `aria-live="polite"`
- [ ] Dialog announces title via `aria-labelledby`
- [ ] Loading state announced (spinner has `aria-label="Loading"`)

### Semantic HTML
- [ ] Headings used correctly inside Card, Dialog, NavBar
- [ ] Lists used for NavBar links and Tab triggers where applicable
- [ ] `<button>` used for actions, `<a>` used for navigation — not interchangeable
- [ ] Form elements wrapped with `<label>` (explicit `for` or wrapping pattern)

---

## 8. Token Validation Rules

### Structural rules
- All `--atlas-color-*` variables must resolve to an OKLCH value (no raw hex in token file)
- Semantic tokens (`--atlas-color-surface-primary`, etc.) must reference primitive tokens — no direct OKLCH values
- Spacing scale must be continuous and use a consistent multiplier (4 px base)
- Motion tokens (`--atlas-duration-*`, `--atlas-easing-*`) must be present and used by all animated components

### Automated checks (run before every release)
```bash
# 1. Find hardcoded colors in component files
grep -rn "#[0-9a-fA-F]\{3,6\}\b" components/

# 2. Find hardcoded pixel values that bypass token scale
grep -rn "style={{" components/ | grep -v "token"

# 3. Confirm all CSS variables referenced in components exist in atlas.tokens.css
node scripts/validate-tokens.js   # (to be authored)

# 4. Check NativeWind token map matches atlas.tokens.css
node scripts/validate-nativewind-tokens.js
```

### Manual checks
- [ ] Open browser DevTools → Computed → verify `--atlas-color-*` resolves to expected value
- [ ] Toggle `data-theme="dark"` and confirm semantic token values swap correctly
- [ ] Inspect component in isolation; confirm no `var(--atlas-*)` resolves to `undefined` (shown as empty in computed styles)

---

## 9. State & Variant Testing

For each component, build a test matrix: **Variant × Size × State**.

### Example: Button matrix

|  | Primary | Secondary | Tertiary | Ghost | Danger | Link |
|---|---|---|---|---|---|---|
| **Default** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Hover** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Focus** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Active** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Disabled** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Loading** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Icon-only** | ✓ | ✓ | — | ✓ | — | — |

Replicate this matrix for all 12 components. Mark ✓ (pass), ✗ (fail), or — (N/A). Every ✗ must have a linked bug report before release.

### State testing steps
1. Navigate to the sandbox `localhost:3000`
2. For each variant, manually trigger each state (hover via mouse, focus via Tab, disabled via prop)
3. Visually compare against Figma comp
4. Run axe DevTools scan on the focused element
5. Record result in the test matrix

---

## 10. Mobile-Specific Testing

### iOS
- [ ] Safe area insets respected (NavBar top, Dialog bottom, bottom sheets)
- [ ] No content hidden behind notch or Dynamic Island
- [ ] Soft keyboard pushes content up correctly (Input, Textarea in forms)
- [ ] Bottom sheet drag handle functional; dismisses on swipe-down
- [ ] Haptic feedback fires on primary Button press (if specified in spec)
- [ ] VoiceOver focus order matches visual order
- [ ] Orientation change (portrait → landscape) does not break layouts

### Android
- [ ] Safe area / cutout insets applied correctly
- [ ] Soft keyboard behavior matches iOS
- [ ] Back gesture dismisses Dialog / bottom sheet
- [ ] TalkBack announces all interactive elements correctly
- [ ] Ripple effect on tap (Button, Card) uses token-correct color
- [ ] Orientation change handled without state loss

### Cross-platform mobile
- [ ] NativeWind token values match web `atlas.tokens.css` values (same scale, same semantic names)
- [ ] Touch targets ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android)
- [ ] No gesture conflicts between component (e.g. Switch swipe) and system navigation gestures
- [ ] Font scaling: test at system text size 125% and 150% — no truncation or overflow
- [ ] High contrast mode (iOS Increase Contrast, Android High Contrast): components remain legible

---

## 11. Regression Testing

### When to run
- Before any release tag
- After any change to `atlas.tokens.css`
- After any shared utility or base style change
- After dependency upgrades (React, Tailwind, NativeWind, Radix UI)

### Regression process
1. Capture baseline screenshots of all 12 components (all states, both themes) using the sandbox
2. Apply the change under test
3. Re-capture screenshots
4. Diff using a visual regression tool (Chromatic, Percy, or `pixelmatch` script)
5. Review diffs — intentional changes approved by design lead, unintentional changes filed as bugs
6. All regressions resolved before merge to `main`

### Snapshot baseline storage
- Baselines stored in `__snapshots__/` at project root
- Branch: `qa/baseline-vX.X`
- Not committed to `main` — managed as CI artifacts

---

## 12. Bug Severity Matrix

| Severity | Definition | Examples | SLA |
|---|---|---|---|
| **P0 — Critical** | Component non-functional; blocks release | Crash on render, no visible output, broken token resolution | Fix before release; no exceptions |
| **P1 — High** | Core state or variant broken; accessibility failure | Focus ring missing, ARIA role wrong, disabled state not enforced, contrast failure | Fix before release |
| **P2 — Medium** | Visual deviation from spec; non-critical state issue | Wrong spacing by 1 token step, hover color slightly off, loading spinner misaligned | Fix before release or accepted with design sign-off |
| **P3 — Low** | Minor polish, edge-case cosmetic | Pixel-level icon alignment, animation timing slightly off, font weight imperceptible difference | Backlog; fix in next minor |
| **P4 — Trivial** | Nit or enhancement | Comment style, code readability, non-visible prop naming | Backlog |

All P0 and P1 bugs block release. P2 bugs require design lead approval to defer.

---

## 13. QA Workflow

```
1. SPEC READ
   └─ QA engineer reads ATLAS-SPEC/<Component>.md before testing

2. SANDBOX RUN
   └─ npm run dev → localhost:3000
   └─ Confirm no console errors before testing begins

3. COMPONENT TEST
   └─ Run Component Validation Checklist (§5)
   └─ Complete Variant × State matrix (§9)
   └─ Run axe DevTools scan
   └─ Keyboard-only walk-through

4. RESPONSIVE CHECK
   └─ Test all 5 breakpoints in DevTools
   └─ Test on 1 physical mobile device (iOS or Android)

5. DARK MODE CHECK
   └─ Toggle data-theme="dark"
   └─ Repeat visual + a11y checks

6. TOKEN AUDIT
   └─ Run grep checks (§8)
   └─ Inspect computed styles in DevTools

7. BUG FILING
   └─ File all failures with: component name, severity, state, screenshot, expected vs actual
   └─ Link to Figma frame if visual deviation

8. RETEST
   └─ QA engineer retests after fix is merged
   └─ Mark issue resolved only after successful retest

9. SIGN-OFF
   └─ Update Component Status table in CLAUDE.md
   └─ Record result in QA Report (§15)
```

---

## 14. Release Sign-off Criteria

All of the following must be true before a component is marked ✅ spec-complete and before a release is tagged:

- [ ] All 12 components pass the Component Validation Checklist (§5)
- [ ] Zero P0 or P1 bugs open
- [ ] All P2 bugs either fixed or accepted with written design lead sign-off
- [ ] Responsive matrix complete at all 5 breakpoints — no failures
- [ ] Dark mode passes visual + contrast checks on all components
- [ ] axe DevTools returns zero violations on the full sandbox page
- [ ] Keyboard-only walk-through completes without a broken interaction
- [ ] Screen reader test completed (minimum: VoiceOver + Safari, NVDA + Chrome)
- [ ] Token audit script returns zero violations
- [ ] Regression diff reviewed and approved (no unintentional visual changes)
- [ ] Mobile test completed on iOS and Android physical devices
- [ ] QA Report authored and attached to release PR
- [ ] Design lead sign-off on QA Report
- [ ] Engineering lead sign-off on QA Report

---

## 15. Final QA Report Format

Create one report per release. File as `QA-REPORT-vX.X.md` in the repo root.

```markdown
# Atlas Design System — QA Report vX.X

**Date:** YYYY-MM-DD  
**QA Engineer:** [Name]  
**Release branch:** `release/vX.X`  
**Sandbox commit:** [SHA]

---

## Summary

| Metric | Result |
|---|---|
| Components tested | 12 / 12 |
| P0 bugs | 0 |
| P1 bugs | 0 |
| P2 bugs (deferred) | N |
| P3/P4 bugs (backlog) | N |
| Accessibility violations (axe) | 0 |
| Responsive breakpoints passed | 5 / 5 |
| Dark mode passed | Yes |
| Screen reader tested | VoiceOver + NVDA |
| Mobile devices tested | [Device list] |

---

## Component Results

| Component | Visual | Functional | A11y | Responsive | Dark Mode | Status |
|---|---|---|---|---|---|---|
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Input | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Label | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Textarea | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Checkbox | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Switch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Badge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Alert | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Dialog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| Tabs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |
| NavBar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Ready |

---

## Bugs Filed

| ID | Component | Severity | Description | Status |
|---|---|---|---|---|
| #001 | Button | P2 | [description] | Fixed / Deferred |

---

## Deferred Issues

List any P2+ issues accepted for deferral with justification and design lead approval noted.

---

## Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Engineer | | | |
| Design Lead | | | |
| Engineering Lead | | | |

---

## Appendix

- Regression diff: [link to CI artifact]
- Figma file: `cKYhfaHLCoyMHi9nKr63Ig`
- axe DevTools export: [attached]
- Device test screenshots: [attached]
```

---

*This document is version-controlled. Update and re-sign for each release.*
