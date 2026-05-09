# Atlas Design System — QA Session Plan

> **Strategy:** One focused session per component or concern. Each session has a fixed scope, a concrete exit condition, and produces a single update to `QA-REPORT.md`. No session bleeds into the next.

---

## Session Map

| Session | Focus | Components / Concern | Est. tokens |
|---|---|---|---|
| QA-01 | Token Audit | `atlas.tokens.css` + all 12 components (grep pass) | Low |
| QA-02 | Button | All variants × states × sizes | Low |
| QA-03 | Input + Label | Both components together (naturally paired) | Low |
| QA-04 | Textarea + Checkbox | Both together (form group) | Low |
| QA-05 | Switch + Badge | Both together (lightweight) | Low |
| QA-06 | Card | Compound slots, variants, shadows | Low |
| QA-07 | Alert + Dialog | Overlay / feedback components | Low |
| QA-08 | Tabs + NavBar | Navigation components | Low |
| QA-09 | Dark Mode Pass | All 12 components, theme toggle only | Low |
| QA-10 | Responsive Pass | All 12 components, 5 breakpoints | Medium |
| QA-11 | Accessibility Pass | axe scan + keyboard walk + screen reader | Medium |
| QA-12 | Mobile Pass | iOS + Android, gestures, safe areas | Medium |
| QA-13 | Regression Pass | Snapshot diff, token drift check | Low |
| QA-14 | Release Sign-off | Final report, bug triage, sign-off | Low |

---

## Session Templates

Each session follows the same structure:

```
OPEN  → Read ATLAS-SPEC/<Component>.md
TEST  → Run checklist for this session's scope only
FILE  → Log bugs found (ID, severity, description)
CLOSE → Update QA-REPORT.md with pass/fail per column
STOP  → Do not test outside session scope
```

---

## QA-01 — Token Audit

**Goal:** Confirm zero hardcoded values across all component files before any visual QA begins.

**Scope:** `atlas.tokens.css`, all files in `components/`

**Steps:**
- [ ] Run: `grep -rn "#[0-9a-fA-F]\{3,6\}\b" components/` — expect zero results
- [ ] Run: `grep -rn "rgba\|rgb(" components/` — expect zero results
- [ ] Run: `grep -rn "px\b" components/` and review — flag any value not mapping to an atlas spacing step
- [ ] Open `atlas.tokens.css` — confirm every semantic token references a primitive token (no raw OKLCH in semantic layer)
- [ ] Confirm dark mode tokens: every `--atlas-color-*` has a `[data-theme="dark"]` override where the spec calls for it
- [ ] Confirm motion tokens present: `--atlas-duration-*`, `--atlas-easing-*`
- [ ] Confirm `prefers-reduced-motion` override block exists in `globals.css`

**Exit condition:** Zero token violations OR all violations filed as bugs.

**Output:** Update `QA-REPORT.md` → Token Audit row.

---

## QA-02 — Button

**Goal:** Full spec validation of the Button component.

**Read first:** `ATLAS-SPEC/Button.md`

**Variant × State matrix:**

| State | Primary | Secondary | Tertiary | Ghost | Danger | Link |
|---|---|---|---|---|---|---|
| Default | | | | | | |
| Hover | | | | | | |
| Focus | | | | | | |
| Active | | | | | | |
| Disabled | | | | | | |
| Loading | | | | | | |
| Icon-only | | | | — | — | — |

Fill each cell: ✅ pass · ❌ fail (file bug) · — N/A

**Checklist:**
- [ ] All 6 variants render without layout break
- [ ] All 4 sizes (xs/sm/md/lg) render at correct height/padding per spec
- [ ] Loading spinner has `aria-label="Loading"` and hides button text from screen reader
- [ ] Icon-only buttons have `aria-label` set
- [ ] Disabled: `aria-disabled="true"`, pointer-events none, correct muted token
- [ ] Focus ring: correct color (`--atlas-color-focus-ring`), width, offset
- [ ] Hover/active states use token-based color shifts (not hardcoded darken)
- [ ] `prefers-reduced-motion`: loading spinner animation suppressed
- [ ] Touch target ≥ 44 × 44 px on all sizes

**Exit condition:** Matrix complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Button row.

---

## QA-03 — Input + Label

**Goal:** Full spec validation of Input and Label components, tested as a paired form unit.

**Read first:** `ATLAS-SPEC/Input.md`, `ATLAS-SPEC/Label.md`

**Input — Variant × State matrix:**

| State | Default | Filled | Invalid |
|---|---|---|---|
| Rest | | | |
| Focus | | | |
| Disabled | | | |
| Read-only | | | |

**Checklist — Input:**
- [ ] Two sizes (sm / md): height and padding match spec tokens exactly
- [ ] Prefix/suffix icon slots render without shifting input text
- [ ] Affix (text prefix/suffix) renders at correct size and color token
- [ ] Invalid state: border color uses `--atlas-color-danger-*`, error message linked via `aria-describedby`
- [ ] Focus ring on input box only (not the wrapper)
- [ ] Placeholder uses correct muted text token
- [ ] `autocomplete` attribute passes through correctly
- [ ] No layout shift when switching between variants programmatically

**Checklist — Label:**
- [ ] Required marker (`*`) uses `--atlas-color-danger-*`
- [ ] Optional marker uses muted text token
- [ ] Two sizes inherit from parent control size correctly
- [ ] Inline variant aligns vertically with control
- [ ] `for` attribute or wrapping pattern correctly associates with input

**Exit condition:** Both matrices complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Input + Label rows.

---

## QA-04 — Textarea + Checkbox

**Goal:** Full spec validation of Textarea and Checkbox components.

**Read first:** `ATLAS-SPEC/Textarea.md`, `ATLAS-SPEC/Checkbox.md`

**Textarea — State matrix:**

| State | Default | Invalid |
|---|---|---|
| Rest | | |
| Focus | | |
| Disabled | | |
| Read-only | | |

**Checklist — Textarea:**
- [ ] Two sizes (sm / md): min-height and padding match spec
- [ ] Resize handle visible and functional (vertical resize only per spec, if applicable)
- [ ] Character counter updates on input; turns danger color at limit
- [ ] Counter linked to textarea via `aria-describedby`
- [ ] Invalid state: border color + error message token correct
- [ ] Focus ring on textarea box only

**Checkbox — State matrix:**

| State | Unchecked | Checked | Indeterminate |
|---|---|---|---|
| Default | | | |
| Hover | | | |
| Focus | | | |
| Disabled | | | |
| Error | | | |
| Card variant | | | |

**Checklist — Checkbox:**
- [ ] Radix UI `@radix-ui/react-checkbox` used correctly
- [ ] Focus ring on box only — not the label
- [ ] Indeterminate renders dash icon (not partial check)
- [ ] Error + checked state: uses danger token (not primary)
- [ ] Card variant: full card is clickable target; keyboard activates correctly
- [ ] `aria-checked="mixed"` set for indeterminate state
- [ ] Touch target for checkbox box ≥ 44 × 44 px

**Exit condition:** Both matrices complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Textarea + Checkbox rows.

---

## QA-05 — Switch + Badge

**Goal:** Full spec validation of Switch and Badge components.

**Read first:** `ATLAS-SPEC/Switch.md`, `ATLAS-SPEC/Badge.md`

**Switch — State matrix:**

| State | Off | On |
|---|---|---|
| Default | | |
| Hover | | |
| Focus | | |
| Disabled | | |

**Checklist — Switch:**
- [ ] Two sizes (sm / md): track and thumb dimensions match spec tokens exactly
- [ ] Thumb translation distance correct (from token, not hardcoded px)
- [ ] Label + description slot renders without shifting switch position
- [ ] `aria-checked` reflects state correctly
- [ ] Focus ring on track, not the wrapper
- [ ] `prefers-reduced-motion`: thumb slides instantly (no transition)
- [ ] Controlled and uncontrolled modes both work

**Badge — Variant matrix:**

| Variant | Dot | Label | Removable |
|---|---|---|---|
| Default | | | |
| Primary | | | |
| Success | | | |
| Warning | | | |
| Danger | | | |
| Outline | | | |
| Neutral | | | |

**Checklist — Badge:**
- [ ] Outline variant: border + text use correct intent token; background transparent
- [ ] Padding and radius match spec per size
- [ ] Dot variant: circle size from token, no label rendered
- [ ] Removable: × button has `aria-label="Remove [badge label]"`
- [ ] Icon slots: icon scales with badge size
- [ ] Badge text does not wrap (single line enforced)

**Exit condition:** Both matrices complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Switch + Badge rows.

---

## QA-06 — Card

**Goal:** Full spec validation of Card and its compound slots.

**Read first:** `ATLAS-SPEC/Card.md`

**Variant matrix:**

| Slot | Default | Outlined | Elevated | Flat |
|---|---|---|---|---|
| Header + Title | | | | |
| Header + Leading visual | | | | |
| Description | | | | |
| Content | | | | |
| Footer + Actions | | | | |

**Checklist:**
- [ ] Four variants render with correct surface, border, shadow tokens
- [ ] `Card.Header` leading visual slot accepts image / icon without overflow
- [ ] `Card.Footer` action slot aligns buttons correctly (start / end)
- [ ] Shadow token: Elevated uses `--atlas-shadow-md`, Default uses `--atlas-shadow-sm`
- [ ] Card is not interactive by default — no focus ring unless `onClick` passed
- [ ] When interactive: focus ring on card boundary, role="button" or wrapping `<a>`
- [ ] Internal padding consistent across all variants (token-driven)
- [ ] Compound slots compose without layout break in any combination

**Exit condition:** All slot combinations tested across all variants.

**Output:** Update `QA-REPORT.md` → Card row.

---

## QA-07 — Alert + Dialog

**Goal:** Full spec validation of Alert and Dialog components.

**Read first:** `ATLAS-SPEC/Alert.md`, `ATLAS-SPEC/Dialog.md`

**Alert — Variant × Dismissible matrix:**

| Variant | Static | Dismissible |
|---|---|---|
| Info | | |
| Success | | |
| Warning | | |
| Danger | | |

**Checklist — Alert:**
- [ ] Correct icon per variant (info / check / warning / x-circle) using atlas icon token
- [ ] Icon color uses variant-specific token
- [ ] `role="alert"` present for auto-announcing (danger/warning) or `aria-live="polite"` for info/success
- [ ] Dismiss button: `aria-label="Dismiss"`, removes from DOM
- [ ] Actions slot: renders inline buttons at correct size
- [ ] Title and description are semantic (`<strong>` / `<p>` or heading level)

**Dialog — State matrix:**

| State | Default | Scrollable content | Sheet (mobile) |
|---|---|---|---|
| Open | | | |
| Close (× button) | | | |
| Close (Escape) | | | |
| Close (overlay click) | | | |

**Checklist — Dialog:**
- [ ] Focus moves to Dialog on open (first focusable element or dialog itself)
- [ ] Focus trap: Tab cycles within Dialog only while open
- [ ] Focus returns to trigger element on close
- [ ] Scroll lock on `<body>` while Dialog is open
- [ ] `aria-labelledby` points to Dialog title
- [ ] `aria-describedby` points to Dialog description (if present)
- [ ] Overlay click closes Dialog (configurable)
- [ ] Escape key closes Dialog
- [ ] Sheet variant: drag handle present; swipe-down dismisses (mobile session will verify gesture)

**Exit condition:** Both matrices complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Alert + Dialog rows.

---

## QA-08 — Tabs + NavBar

**Goal:** Full spec validation of Tabs and NavBar components.

**Read first:** `ATLAS-SPEC/Tabs.md`, `ATLAS-SPEC/NavBar.md`

**Tabs — Variant × State matrix:**

| State | Underline | Pills | Enclosed |
|---|---|---|---|
| Active tab | | | |
| Inactive tab | | | |
| Disabled tab | | | |
| Tab with badge | | | |

**Checklist — Tabs:**
- [ ] Three variants render with correct indicator/background tokens
- [ ] Roving tabindex: arrow keys move focus between triggers; Tab exits the tab list
- [ ] Enter/Space activates focused tab
- [ ] Disabled tab: not activatable via keyboard or click; `aria-disabled="true"`
- [ ] Badge in trigger: renders without breaking tab height
- [ ] Active indicator uses `--atlas-color-primary-*` token
- [ ] Panel content unmounts or hides correctly on tab switch

**NavBar — State matrix:**

| State | Desktop | Mobile (collapsed) | Mobile (open) |
|---|---|---|---|
| Default | | | |
| Active link | | | |
| Hover link | | | |

**Checklist — NavBar:**
- [ ] Brand slot accepts logo image and text
- [ ] Active nav link: correct active token color + indicator
- [ ] Collapses to hamburger at correct breakpoint (token-driven, not hardcoded px)
- [ ] Hamburger button: `aria-expanded`, `aria-controls` point to mobile menu
- [ ] Mobile menu opens as Drawer; closes on link click or Escape
- [ ] Actions slot (right side) renders correctly on desktop; preserved or moved in mobile menu
- [ ] Dark/light toggle (if in actions slot) updates `data-theme` correctly

**Exit condition:** Both matrices complete, all bugs filed.

**Output:** Update `QA-REPORT.md` → Tabs + NavBar rows.

---

## QA-09 — Dark Mode Pass

**Goal:** Validate all 12 components in dark mode only. Do not re-test states — focus on theme token correctness and contrast.

**Scope:** `data-theme="dark"` active on `<html>`

**Steps:**
- [ ] Toggle dark mode in sandbox
- [ ] Walk through each component visually — flag any component that looks identical to light mode (token not switching)
- [ ] Check contrast for each component: text on surface ≥ 4.5:1, UI boundaries ≥ 3:1
- [ ] Check focus rings in dark mode: ring visible against dark surfaces
- [ ] Check disabled state in dark mode: muted but still legible
- [ ] Check all semantic color tokens (danger, success, warning, info) in dark mode — confirm they use dark-specific values

**Tool:** Browser DevTools → toggle `data-theme` attribute + axe DevTools color contrast check.

**Exit condition:** All 12 components pass visual + contrast check in dark mode.

**Output:** Update `QA-REPORT.md` → Dark Mode column for all rows.

---

## QA-10 — Responsive Pass

**Goal:** Validate all 12 components across 5 breakpoints. Focus on layout — not state or theme.

**Breakpoints to test:**

| Label | Width | DevTools preset |
|---|---|---|
| Mobile S | 375 px | iPhone SE |
| Mobile L | 430 px | iPhone 15 Pro Max |
| Tablet | 768 px | iPad Mini |
| Desktop | 1280 px | Laptop L |
| Large desktop | 1920 px | Full HD |

**Steps per component:**
- [ ] Resize to breakpoint
- [ ] Check: no horizontal overflow, no scrollbar introduced
- [ ] Check: text not clipped or truncated unexpectedly
- [ ] Check: touch targets remain ≥ 44 px at mobile breakpoints
- [ ] NavBar: confirm collapse at correct breakpoint
- [ ] Dialog: confirm full-screen on mobile
- [ ] Tabs: confirm horizontal scroll on mobile (not wrap)
- [ ] Card grids: confirm reflow is clean

**Exit condition:** All 12 components × 5 breakpoints checked, no layout failures.

**Output:** Update `QA-REPORT.md` → Responsive column for all rows.

---

## QA-11 — Accessibility Pass

**Goal:** Structured a11y validation using tools and manual methods.

**This session only — do not re-test visual or responsive.**

**Steps:**

1. **axe DevTools full scan**
   - [ ] Open sandbox, run axe on full page
   - [ ] Export results; file a bug for every violation
   - [ ] Target: zero violations

2. **Keyboard-only walk**
   - [ ] Unplug mouse / disable trackpad
   - [ ] Tab through entire sandbox page
   - [ ] Verify: every interactive element reachable, focus ring always visible, Escape closes overlays, arrow keys navigate Tabs

3. **Screen reader — VoiceOver (macOS)**
   - [ ] Enable VoiceOver (Cmd + F5)
   - [ ] Navigate with VO+Right through all components
   - [ ] Verify: Button announces label + role, Input announces label + hint + error, Checkbox announces checked/unchecked/mixed, Alert auto-announces, Dialog announces title on open

4. **Screen reader — NVDA + Chrome (Windows)**
   - [ ] Repeat screen reader pass on Windows if available
   - [ ] File any announcements that differ from expected

**Exit condition:** axe scan clean, keyboard walk unblocked, screen reader walk complete.

**Output:** Update `QA-REPORT.md` → Accessibility column + axe export attached.

---

## QA-12 — Mobile Pass

**Goal:** Validate mobile-specific behaviors on physical devices or high-fidelity simulators.

**Devices:**
- iOS: iPhone 14 or 15 (Simulator acceptable for layout; physical preferred for gestures)
- Android: Pixel 7 or Samsung S23 (Emulator acceptable for layout)

**Checklist:**
- [ ] Safe area insets: NavBar top, Dialog/Sheet bottom — no content hidden behind notch or home indicator
- [ ] Soft keyboard: Input and Textarea scroll into view on focus, not hidden behind keyboard
- [ ] Bottom sheet (Dialog sheet variant): drag handle works, swipe-down dismisses
- [ ] Switch: swipe gesture activates correctly; no conflict with scroll
- [ ] Back gesture (Android): dismisses Dialog / Sheet correctly
- [ ] Touch targets: ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android) on all interactive components
- [ ] Font scaling at 125%: no truncation in Button, Badge, Label
- [ ] Font scaling at 150%: no overflow in Card, Alert, Dialog
- [ ] Orientation change (portrait → landscape): Dialog, NavBar, Tabs reflow correctly; no state loss
- [ ] TalkBack (Android): Button, Input, Checkbox announce correctly
- [ ] VoiceOver (iOS): same pass as QA-11 but on device

**Exit condition:** All checklist items pass on both iOS and Android.

**Output:** Update `QA-REPORT.md` → Mobile column for all rows.

---

## QA-13 — Regression Pass

**Goal:** Confirm no unintentional visual or behavioral changes were introduced by fixes from QA-02 through QA-12.

**Steps:**
- [ ] Pull final `main` branch (all QA fixes merged)
- [ ] Run sandbox: `npm run dev`
- [ ] Confirm no new console errors
- [ ] Run token audit again: `grep -rn "#[0-9a-fA-F]\{3,6\}\b" components/` — must return zero
- [ ] Visual walk: scroll through full sandbox page — spot-check 3 states per component
- [ ] Confirm all P0 and P1 bugs are closed (check bug log in `QA-REPORT.md`)
- [ ] Confirm all P2 deferrals have written design lead approval
- [ ] Run axe DevTools one final time — must return zero violations

**Exit condition:** Zero regressions found OR new regressions filed and triaged.

**Output:** Update `QA-REPORT.md` → Regression row.

---

## QA-14 — Release Sign-off

**Goal:** Finalize `QA-REPORT.md`, triage any remaining bugs, collect sign-offs.

**Steps:**
- [ ] Complete all rows in the `QA-REPORT.md` Component Results table
- [ ] Confirm Summary metrics are accurate (bug counts, test coverage)
- [ ] List all deferred issues with justification
- [ ] Attach: axe export, device screenshots, regression diff
- [ ] Update `CLAUDE.md` component status table — mark all passing components ✅ spec-complete
- [ ] Get sign-off: QA Engineer + Design Lead + Engineering Lead
- [ ] Tag release: `git tag v1.0.0`

**Exit condition:** All three sign-offs collected, report committed to repo.

**Output:** `QA-REPORT-v1.0.md` committed. Release tagged.

---

## Progress Tracker

Copy this into each session's first message to orient Claude:

```
QA Session: QA-0X — [Component / Concern]
Status of previous sessions: [paste summary or "all passed"]
Bugs open from prior sessions: [list IDs or "none"]
Goal this session: [paste session goal]
```

---

## Token Control Rules

- **One session = one conversation.** Do not carry component tests across sessions.
- **Read only the relevant ATLAS-SPEC file** for the session's component — not all specs.
- **Do not open `app/page.tsx`** unless a sandbox rendering bug is being diagnosed.
- **File bugs inline** in `QA-REPORT.md` as you find them — do not defer to end of session.
- **Stop when the exit condition is met** — do not expand scope.
