@AGENTS.md

# Atlas Design System — Project State

## Status
> **Monorepo restructured.** All 12 v1 components live in `packages/ui-web/src/` (classified by tier). Visual sandbox at `app/page.tsx`. Next: refine components one per session to full spec compliance.

---

## What is this project?
A monorepo that houses:
1. **Visual sandbox** — Next.js 16 app (`app/page.tsx`) rendering all 12 Atlas components
2. **Component library** — `packages/ui-web/src/` (web) + `packages/ui-native/` (React Native)
3. **Design tokens** — `packages/tokens/` (CSS vars, JSON, Figma export)
4. **Figma sync** — `packages/figma-sync/` (Code Connect mappings + MCP configs)
5. **AI workflows** — `packages/ai-workflows/` (Claude skill definitions)

Stack: React 19 · Next.js 16 · Tailwind v4 · Radix UI · Atlas tokens via `packages/tokens/atlas.tokens.css`

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
packages/
├── tokens/
│   ├── atlas.tokens.css          ← CSS custom properties (source of truth)
│   ├── atlas.tokens.json         ← Raw token JSON
│   └── atlas.figma.tokens.json   ← Figma Variables export
├── ui-web/src/
│   ├── primitives/               ← Button, Input, Label, Textarea, Checkbox, Switch, Badge
│   ├── compositions/             ← Alert, Card, Dialog
│   ├── patterns/                 ← Tabs
│   ├── layouts/                  ← NavBar
│   └── templates/                ← (coming soon)
├── ui-native/                    ← React Native components (Expo)
├── figma-sync/
│   ├── code-connect/             ← *.figma.tsx Code Connect mappings
│   └── mcp/configs/              ← figma.config.json
├── ai-workflows/
│   └── atlas-ui-skill/           ← Claude skill definition
└── governance/                   ← Token lint, API contracts (planned)
app/
├── page.tsx          ← visual sandbox (imports from packages/ui-web/src/*)
├── globals.css       ← imports packages/tokens/atlas.tokens.css + tailwind
└── layout.tsx
docs/
├── architecture/ATLAS-SPEC/      ← per-component specs (read before refining)
├── decisions/                    ← ATLAS-COMPONENTS-V1.md (locked v1 decisions)
├── audits/                       ← QA-REPORT.md, QA-PLAN.md, QA-SESSIONS.md
├── sessions/                     ← session planning logs
└── implementation/               ← implementation plans + mobile handoff
```

## Key decisions
- `@/*` alias → project root (set in `tsconfig.json`)
- Token prefix: `--atlas-*`
- Dark mode: `data-theme="dark"` on `<html>`
- Radix packages installed: `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`

---

# Claude Project Instructions — Atlas Design System

## File Writing Rules (CRITICAL)
- NEVER write files to `/outputs` unless explicitly asked.
- ALWAYS write files directly into the project source directories.

## Component Writing Convention

When creating or updating **web** components:
- Locate the correct tier folder before writing
- Write directly into the appropriate tier under `packages/ui-web/src/`

| Tier | Path | Components |
|------|------|-----------|
| Primitives | `packages/ui-web/src/primitives/<Name>/` | Button, Input, Label, Textarea, Checkbox, Switch, Badge |
| Compositions | `packages/ui-web/src/compositions/<Name>/` | Alert, Card, Dialog |
| Patterns | `packages/ui-web/src/patterns/<Name>/` | Tabs |
| Layouts | `packages/ui-web/src/layouts/<Name>/` | NavBar |

Examples:
- Button → `packages/ui-web/src/primitives/Button/Button.tsx`
- Alert → `packages/ui-web/src/compositions/Alert/Alert.tsx`
- NavBar → `packages/ui-web/src/layouts/NavBar/NavBar.tsx`

For **native** components: `packages/ui-native/components/<Name>/`

If the component already exists:
- Modify the existing file in place
- DO NOT create duplicate or alternative versions

If adding a new component, determine its tier first, then create the appropriate folder.

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

## QA Reporting Rules (CRITICAL)

Every QA session MUST update `QA-REPORT.md` before the session ends:
- Append the full bug log for that session (BUG-NNN entries with guard, location, description, fix)
- Append the session checklist with pass/fail per item
- Update the Summary table (sessions completed, total bugs filed, open counts)
- Update the Component Results table row for the audited component
- Update the Session Progress table row (status + date + notes)

The file to update is always: `docs/audits/QA-REPORT.md`.
NEVER create separate per-session files. All QA content lives in `docs/audits/QA-REPORT.md`.

## Git Commit Rules (CRITICAL)

At the end of every completed QA session, commit and push to `origin/main`:

```bash
git add -A
git commit -m "qa(<component>): QA-<NN> audit — <N> bugs filed"
git push origin main
```

Commit message format: `qa(<component-lowercase>): QA-<NN> audit — <N> bugs filed`

Examples:
- `qa(button): QA-02 audit — 3 bugs filed`
- `qa(input+label): QA-03 audit — 2 bugs filed`

If fixes are applied in the same session, include them in the same commit:
- `qa(button): QA-02 audit + fixes — 3 bugs found, 3 fixed`

Rules:
- Always `git add -A` (includes QA-REPORT.md + any patched component files)
- Always push immediately after commit — do not leave local commits un-pushed
- If `git push` fails (e.g. remote has changes), run `git pull --rebase origin main` then push again
- Never commit broken code — only commit after verifying the sandbox still runs

## If Folder Access Fails

If project folder is not accessible:
- STOP and inform the user
- Do NOT fallback to `/outputs` silently
