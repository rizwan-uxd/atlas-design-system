# Atlas v1 — Session-by-Session Implementation Plan

> **Goal:** Bring all 12 scaffolded components to full spec compliance. One component per session. Each session ends with a visual sign-off against the sandbox at `http://localhost:3000`.
>
> **Sign-off gate:** Component marked 🟢 Spec-complete only when Riz visually confirms all variants, sizes, and states in both Light and Dark mode.

---

## How each session runs

1. **Read** the ATLAS-SPEC `<Component>.md` before touching any code
2. **Read** the current `components/<Component>/<Component>.tsx` to assess gaps
3. **Implement** all deltas against spec (tokens, states, a11y, motion)
4. **Sandbox check** — run `npm run dev`, screenshot each variant/state group
5. **Sign-off** — Riz confirms visually; CLAUDE.md status updated to 🟢

---

## Session Map

| Session | Component | Key work | Sign-off checklist |
|---|---|---|---|
| S3 | Button | CVA variants, hover/focus/active CSS, icon-only a11y | 6 variants × 4 sizes × 6 states |
| S4 | Input | Prefix/suffix affixes, exact height tokens, focus ring | 3 variants × 2 sizes, icon slots, invalid |
| S5 | Label | Size inheritance, inline variant, required/optional markers | 2 sizes, required, optional, standalone |
| S6 | Textarea | Resize handle, exact min-heights, sm/md padding | 2 variants × 2 sizes, char counter, invalid |
| S7 | Checkbox | Focus ring box-only, indeterminate dash icon, error+checked color | 3 states (unchecked/checked/indeterminate), card variant, error |
| S8 | Switch | Exact track/thumb tokens, focus ring, reduced motion | 2 sizes, on/off, disabled, label+description |
| S9 | Card | Leading visual slot, action slot, shadow token | 4 variants, all compound slots |
| S10 | Badge | Outline intent layering, exact padding/radius | 7 variants, dot, removable, icon slots |
| S11 | Alert | Actions slot, correct icon per variant, dismissible | 4 variants, with/without title, dismissible |
| S12 | Dialog | Focus trap, scroll lock, sheet drag handle | Modal, sheet, keyboard (Escape), scroll |
| S13 | Tabs | Roving tab focus (arrow keys), keyboard activation, badge trigger | 3 variants (underline/pills/enclosed), disabled tab |
| S14 | NavBar | Mobile Drawer, responsive breakpoints, hamburger menu | Desktop + mobile, dark/light, active link |

---

## Detailed session briefs

---

### Session 3 — Button 🟡

**Spec:** `ATLAS-SPEC/Button.md`

**Gaps to fix:**
- Replace inline Tailwind classes with CVA (`class-variance-authority`) variant config
- Wire hover/focus-visible/active states via CSS (not just default browser styles)
- Icon-only size: enforce square shape, require `aria-label`
- Loading state: spinner replaces leading icon, button width locked (no reflow)
- `prefers-reduced-motion` guard on all transitions
- Confirm all token references — no hex literals, no hardcoded spacing

**Sign-off checklist:**
- [ ] All 6 variants render in correct colours (Light + Dark)
- [ ] All 4 sizes have correct height: sm=32px, md=40px, lg=48px, icon=square
- [ ] Hover, focus-visible, active, disabled, loading states all visible
- [ ] Icon-only buttons are square and announce via `aria-label`
- [ ] Loading: spinner visible, label stays, width unchanged
- [ ] Focus ring: 2px outline, `--atlas-focus-ring`, 2px offset
- [ ] Transitions removed at `prefers-reduced-motion: reduce`
- [ ] Zero hex literals in component file

---

### Session 4 — Input 🟡

**Spec:** `ATLAS-SPEC/Input.md`

**Gaps to fix:**
- Add prefix/suffix affix slots (icon or text, inside the field border)
- sm height = 32px, md height = 40px (exact token values)
- Focus ring on the container div, not the native `<input>`
- Invalid state: border swaps to `--atlas-danger`, error message slot below
- Disabled: background `--atlas-background-muted`, cursor not-allowed

**Sign-off checklist:**
- [ ] 3 variants (default, filled, unstyled) render correctly
- [ ] sm/md heights exact per spec
- [ ] Leading icon and trailing icon slots work independently
- [ ] Prefix/suffix text affixes visible, colour correct
- [ ] Invalid state: red border + error text below
- [ ] Focus ring wraps full input container
- [ ] Disabled state: muted background, no focus ring

---

### Session 5 — Label 🟡

**Spec:** `ATLAS-SPEC/Label.md`

**Gaps to fix:**
- `sm` label inherits `text-sm`, `md` inherits `text-body` — driven by parent control size
- Required marker (`*`) uses `--atlas-danger`
- Optional marker uses `--atlas-foreground-subtle`
- Inline variant: renders `display: inline` for use alongside controls

**Sign-off checklist:**
- [ ] sm and md sizes render correct type scale
- [ ] Required marker renders in danger colour
- [ ] Optional text renders in muted colour
- [ ] Standalone label above a field looks correct
- [ ] Inline variant sits level with an Input
- [ ] Dark mode: all colours correct

---

### Session 6 — Textarea 🟡

**Spec:** `ATLAS-SPEC/Textarea.md`

**Gaps to fix:**
- min-height: sm=80px, md=120px (from spec)
- Resize handle: `resize-y` only, custom handle or native browser
- Char counter: positioned bottom-right, colour flips to danger at limit
- Invalid state mirrors Input (red border + error slot)
- Padding sm/md matches Input token values exactly

**Sign-off checklist:**
- [ ] sm/md min-heights correct
- [ ] Resizes vertically only (not horizontally)
- [ ] Char counter appears and counts down
- [ ] Counter turns red at/over limit
- [ ] Invalid border and error message visible
- [ ] Dark mode: all colours correct

---

### Session 7 — Checkbox 🟡

**Spec:** `ATLAS-SPEC/Checkbox.md`

**Gaps to fix:**
- Focus ring must wrap only the checkbox box, not the label
- Indeterminate state: dash icon (not checkmark) via Radix `indeterminate` prop
- Error+checked state: box border uses `--atlas-danger`, check icon stays white
- Card variant: full row is the clickable target with a border/background
- Radix `@radix-ui/react-checkbox` already installed — use it fully

**Sign-off checklist:**
- [ ] Unchecked, checked, indeterminate all render correctly
- [ ] Focus ring wraps checkbox box only, not label text
- [ ] Indeterminate shows dash icon
- [ ] Error state: red border on box
- [ ] Error+checked: red border, white check visible
- [ ] Card variant: full card clickable, border highlights on check
- [ ] Dark mode: all colours correct

---

### Session 8 — Switch 🟡

**Spec:** `ATLAS-SPEC/Switch.md`

**Gaps to fix:**
- Install `@radix-ui/react-switch` (not yet installed)
- Track sizes: sm=20px tall, md=24px tall (exact per spec)
- Thumb sizes: sm=16px, md=20px; translate on toggle
- `checked` → track `--atlas-primary`; `unchecked` → `--atlas-border`
- Focus ring on thumb (not track)
- `prefers-reduced-motion` removes thumb slide animation

**Sign-off checklist:**
- [ ] sm and md sizes correct per spec
- [ ] Off state: neutral track, thumb left
- [ ] On state: primary track, thumb right
- [ ] Smooth thumb transition (ease-in-out)
- [ ] Focus ring visible on thumb
- [ ] Disabled: opacity-disabled applied, non-interactive
- [ ] Label + description slot renders alongside switch
- [ ] Animation removed at `prefers-reduced-motion: reduce`

---

### Session 9 — Card 🟡

**Spec:** `ATLAS-SPEC/Card.md`

**Gaps to fix:**
- Leading visual slot in `Card.Header` (image, icon, or avatar)
- Action slot in `Card.Header` (e.g., overflow menu button)
- Shadow: `--atlas-shadow-md` on elevated variant
- `interactive` variant: hover state adds shadow-lg, cursor pointer
- Compound exports: `Card`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer`

**Sign-off checklist:**
- [ ] 4 variants (default, elevated, outline, interactive) render correctly
- [ ] Leading visual slot accepts image and icon
- [ ] Action slot renders at the end of the header row
- [ ] Elevated variant has correct shadow
- [ ] Interactive variant has hover shadow
- [ ] All compound slots compose correctly in sandbox
- [ ] Dark mode: all colours correct

---

### Session 10 — Badge 🟡

**Spec:** `ATLAS-SPEC/Badge.md`

**Gaps to fix:**
- 7 variants: default, secondary, success, warning, danger, info, outline
- Outline variant: background transparent, border = current intent colour
- Exact padding: `2px 8px` (from spec tokens)
- Exact radius: `--atlas-radius-full` (pill shape)
- Dot indicator: 6px circle, same colour as variant fg
- Removable: `×` button inside badge, emits `onRemove`
- Leading icon and trailing icon slots

**Sign-off checklist:**
- [ ] All 7 variants render with correct colour pairs (bg/fg)
- [ ] Outline variant is transparent with coloured border
- [ ] Pill shape (radius-full) on all variants
- [ ] Dot variant shows 6px coloured dot
- [ ] Removable variant shows `×`, clicking it fires callback
- [ ] Icon slots work in leading and trailing positions
- [ ] Dark mode: all colours correct

---

### Session 11 — Alert 🟡

**Spec:** `ATLAS-SPEC/Alert.md`

**Gaps to fix:**
- Icon per variant: info→circle-i, success→check-circle, warning→triangle, danger→x-circle
- Actions slot: renders inline buttons below description
- Dismissible: `×` icon button top-right, fires `onDismiss`
- Left accent bar on all variants (3–4px wide, colour = variant primary)
- Token-correct bg/border/fg per variant

**Sign-off checklist:**
- [ ] 4 variants render with correct icon, colours, accent bar
- [ ] Title + description layout correct
- [ ] Actions slot renders buttons below description
- [ ] Dismissible `×` button visible and functional
- [ ] Dark mode: all colours correct

---

### Session 12 — Dialog 🟡

**Spec:** `ATLAS-SPEC/Dialog.md`

**Gaps to fix:**
- Install `@radix-ui/react-dialog` (not yet installed)
- Focus trap: Tab cycles only within the open dialog
- Scroll lock: `body` scroll locked when dialog is open
- Sheet variant: slides up from bottom, drag handle at top
- Overlay: `--atlas-overlay` background, animates in/out
- Escape key closes dialog
- Compound: `Dialog`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`, `Dialog.Footer`, `Dialog.Close`

**Sign-off checklist:**
- [ ] Modal opens centred with overlay
- [ ] Tab key stays trapped inside dialog
- [ ] Escape closes dialog
- [ ] Body scroll locked while open
- [ ] Sheet variant slides up from bottom
- [ ] Sheet has drag handle, can be dismissed by dragging down
- [ ] Overlay fades in/out with motion tokens
- [ ] All compound slots compose correctly

---

### Session 13 — Tabs 🟡

**Spec:** `ATLAS-SPEC/Tabs.md`

**Gaps to fix:**
- Install `@radix-ui/react-tabs` (not yet installed)
- Roving tabIndex: Left/Right arrow keys move focus between triggers
- `Enter`/`Space` activate the focused tab
- 3 variants: underline (active = bottom border), pills (active = filled bg), enclosed (active = white tab)
- Disabled tab: `aria-disabled`, visually muted, not activatable
- Badge in trigger: supports a `<Badge>` inside a tab label

**Sign-off checklist:**
- [ ] All 3 variants render with correct active indicator
- [ ] Left/Right arrows move focus across tabs
- [ ] Enter/Space activate the focused tab
- [ ] Tab content panel switches correctly
- [ ] Disabled tab is visually muted and non-interactive
- [ ] Badge renders correctly inside a tab trigger
- [ ] Dark mode: all colours correct

---

### Session 14 — NavBar 🟡

**Spec:** `ATLAS-SPEC/NavBar.md`

**Gaps to fix:**
- Mobile menu: hamburger icon button toggles a Drawer/Sheet
- Responsive breakpoints: nav links hidden below `lg`; hamburger visible below `lg`
- Active link: `--atlas-primary` colour + optional underline indicator
- Actions slot: right-side area for buttons (e.g., Login, CTA)
- Dark/light toggle already wired — confirm it still works after changes

**Sign-off checklist:**
- [ ] Desktop: brand, nav links, actions all in one row
- [ ] Active link is visually distinct
- [ ] Below `lg` breakpoint: hamburger appears, nav links hidden
- [ ] Hamburger opens mobile Drawer with nav links
- [ ] Dark mode toggle works correctly
- [ ] Dark mode: NavBar bg/border/text correct

---

## Progress tracker

Update this table as sessions complete.

| Session | Component | Status | Signed off by Riz |
|---|---|---|---|
| S3 | Button | 🟢 Spec-complete | Riz ✅ |
| S4 | Input | 🟢 Spec-complete | Riz ✅ |
| S5 | Label | 🟢 Spec-complete | Riz ✅ |
| S6 | Textarea | 🟢 Spec-complete | Riz ✅ |
| S7 | Checkbox | 🟢 Spec-complete | Riz ✅ |
| S8 | Switch | 🟢 Spec-complete | Riz ✅ |
| S9 | Card | 🟢 Spec-complete | Riz ✅ |
| S10 | Badge | 🟢 Spec-complete | Riz ✅ |
| S11 | Alert | 🟢 Spec-complete | Riz ✅ |
| S12 | Dialog | 🟢 Spec-complete | Riz ✅ |
| S13 | Tabs | 🟢 Spec-complete | Riz ✅ |
| S14 | NavBar | 🟡 In progress | — |

**Legend:** 🟡 Scaffolded · 🟢 Spec-complete · ✅ Code Connect verified

---

## Radix packages still to install

| Session | Package |
|---|---|
| S8 | `@radix-ui/react-switch` |
| S12 | `@radix-ui/react-dialog` |
| S13 | `@radix-ui/react-tabs` |

Install in the session that uses them — not ahead of time.

---

## After all 12 components are 🟢

1. Update `CLAUDE.md` status to: **All 12 v1 components spec-complete**
2. Wire Code Connect for each component (Figma property → React prop tables are in every spec)
3. Mark Code Connect-verified components ✅
4. Push Figma file to Atlas/Web page with Code Connect mappings live
5. Proceed to v1.1 scope: IconButton · Radio · Select · Tooltip · Toast · Skeleton
