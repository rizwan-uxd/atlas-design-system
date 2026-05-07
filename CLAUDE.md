@AGENTS.md

# Atlas Design System — Project State

## Status
> **Sandbox running.** All 12 v1 components scaffolded in `components/`. Visual sandbox live at `app/page.tsx`. Next: refine components one per session to full spec compliance.

---

## What is this project?
A Next.js 16 app (`app/` router) that serves as:
1. **Visual sandbox** — renders all 12 Atlas components for visual testing (`app/page.tsx`)
2. **Component library source** — `components/<Name>/<Name>.tsx` is the implementation for each Atlas/Web component

Stack: React 19 · Next.js 16 · Tailwind v4 · Radix UI · Atlas tokens via `atlas.tokens.css`

---

## Session log

### Session 1 — Figma component creation
- All 12 v1 components created in Figma (Atlas/Web + Atlas/Mobile-Native pages)
- Figma file: `cKYhfaHLCoyMHi9nKr63Ig`

### Session 2 — Sandbox scaffold (this session)
**Problem fixed:** `app/page.tsx` was importing Checkbox from `../../web/src/components/Checkbox/Checkbox` — path didn't exist. Project was crashing before rendering.

**What was built:**
- Created `components/` folder at project root
- Scaffolded all 12 components (functional, using Atlas tokens):
  - `components/Button/Button.tsx` — 6 variants, 4 sizes, loading/disabled states
  - `components/Input/Input.tsx` — 3 variants, 2 sizes, icon slots, invalid state
  - `components/Label/Label.tsx` — required/optional markers, 2 sizes
  - `components/Textarea/Textarea.tsx` — 2 variants, char counter, invalid state
  - `components/Checkbox/Checkbox.tsx` — uses `@radix-ui/react-checkbox`, card variant, indeterminate
  - `components/Switch/Switch.tsx` — 2 sizes, controlled/uncontrolled, label+description
  - `components/Card/Card.tsx` — 4 variants, compound slots (Header/Title/Description/Content/Footer)
  - `components/Badge/Badge.tsx` — 7 variants, dot, removable, icon slots
  - `components/Alert/Alert.tsx` — 4 variants, dismissible, title+description+actions
  - `components/Dialog/Dialog.tsx` — modal, overlay, keyboard (Escape), compound slots
  - `components/Tabs/Tabs.tsx` — 3 variants (underline/pills/enclosed), disabled tab support
  - `components/NavBar/NavBar.tsx` — brand, nav links with active state, actions slot
- Rewrote `app/page.tsx` as a full visual sandbox showing all components, all variants, all states
- NavBar has dark/light theme toggle wired to `data-theme` attribute

---

## Per-session refinement plan

Components are scaffolded but need full spec compliance. Do **one component per session**:

| # | Component | Status | Session focus |
|---|---|---|---|
| 1 | **Button** | 🟡 Scaffolded | Hover/focus/active states via CSS, icon-only a11y, CVA class variants |
| 2 | **Input** | 🟡 Scaffolded | Prefix/suffix affixes, size sm/md height exact tokens, focus ring |
| 3 | **Label** | 🟡 Scaffolded | Size inheritance from parent control, inline variant |
| 4 | **Textarea** | 🟡 Scaffolded | Resize handle, exact min-heights, size sm/md padding |
| 5 | **Checkbox** | 🟡 Scaffolded | Focus ring on box only, indeterminate dash icon, error+checked state color |
| 6 | **Switch** | 🟡 Scaffolded | Exact track/thumb sizes per spec, focus ring, reduced motion |
| 7 | **Card** | 🟡 Scaffolded | Leading visual slot in Header, action slot, shadow token |
| 8 | **Badge** | 🟡 Scaffolded | Outline intent layering, exact padding/radius per spec |
| 9 | **Alert** | 🟡 Scaffolded | Actions slot with inline buttons, proper icon per variant |
| 10 | **Dialog** | 🟡 Scaffolded | Focus trap, scroll lock, drag handle for sheet variant |
| 11 | **Tabs** | 🟡 Scaffolded | Roving tab focus (arrow keys), keyboard activation, badge in trigger |
| 12 | **NavBar** | 🟡 Scaffolded | Mobile menu Drawer, responsive breakpoints, MobileMenu hamburger |

**Status legend:** 🟡 Scaffolded · 🟢 Spec-complete · ✅ Code Connect verified

---

## How to run the sandbox
```bash
npm run dev
# Open http://localhost:3000
```

## File map
```
components/
├── Button/Button.tsx
├── Input/Input.tsx
├── Label/Label.tsx
├── Textarea/Textarea.tsx
├── Checkbox/Checkbox.tsx
├── Switch/Switch.tsx
├── Card/Card.tsx
├── Badge/Badge.tsx
├── Alert/Alert.tsx
├── Dialog/Dialog.tsx
├── Tabs/Tabs.tsx
└── NavBar/NavBar.tsx
app/
├── page.tsx          ← visual sandbox (imports all 12 components)
├── globals.css       ← imports atlas.tokens.css + tailwind
└── layout.tsx
atlas.tokens.css      ← design tokens (CSS variables, source of truth)
ATLAS-SPEC/           ← per-component specs (read before refining)
ATLAS-COMPONENTS-V1.md ← locked v1 decisions
```

## Key decisions
- `@/*` alias → project root (set in `tsconfig.json`)
- Only Radix package installed so far: `@radix-ui/react-checkbox`
- Token prefix: `--atlas-*`
- Dark mode: `data-theme="dark"` on `<html>`

---

# Claude Project Instructions — Atlas Design System

## File Writing Rules (CRITICAL)
- NEVER write files to `/outputs` unless explicitly asked.
- ALWAYS write files directly into the project source directories.

## Component Writing Convention

When creating or updating components:
- Locate the correct component folder before writing
- Write directly into: `components/<ComponentName>/`

Examples:
- Button → `components/Button/Button.tsx`
- Input → `components/Input/Input.tsx`
- Checkbox → `components/Checkbox/Checkbox.tsx`

If the component already exists:
- Modify the existing file in place
- DO NOT create duplicate or alternative versions

If the component does not exist:
- Create the appropriate folder and files inside `/components`

## No Session Artifacts
- Do NOT generate files in:
  - `/outputs`
  - temporary session folders
- Do NOT ask the user to copy files manually

## Code Change Behavior
- Prefer in-place edits over creating new files
- Preserve file structure and naming conventions
- Do not introduce parallel implementations

## Design System Compliance

All components must:
- Use only design tokens (no hardcoded values)
- Support accessibility (focus-visible, ARIA)
- Support all states (hover, active, disabled, loading)
- Use logical CSS properties (RTL-safe)
- Use token-based motion with reduced-motion support

## If Folder Access Fails

If project folder is not accessible:
- STOP and inform the user
- Do NOT fallback to `/outputs` silently
