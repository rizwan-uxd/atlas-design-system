@AGENTS.md

# Atlas Design System — Project State

**Rules live in `AGENTS.md`.** This file is current state only — no rules, no conventions.

## Status
Monorepo restructured; all 12 v1 components live in `packages/ui-web/src/` classified by tier, with a visual sandbox at `app/page.tsx` and coded prototypes under `app/prototypes/`.
**Current work:** the AI upgrade in `docs/ATLAS-AI-UPGRADE-PLAN.md` — phases 0, 1, 2C (Checkbox) and 4 are done; phase 5 (sync skill) is next. The phase 0 baseline is locked in `benchmarks/results/SUMMARY.md`.

## What this is
A monorepo holding: the visual sandbox (Next.js 16, `app/page.tsx`), the web component library (`packages/ui-web/src/`), a React Native library (`packages/ui-native/`), design tokens (`packages/tokens/`), Figma sync (`packages/figma-sync/`), governance checks (`packages/governance/`), and the agent benchmark (`benchmarks/`).

Stack: React 19 · Next.js 16 · Tailwind v4 · Radix UI · Atlas tokens via `packages/tokens/atlas.tokens.css`
Figma file: `cKYhfaHLCoyMHi9nKr63Ig` (Atlas/Web + Atlas/Mobile-Native pages)

## Run it
```bash
npm run dev        # → http://localhost:3030
```

## Component status
All 12 are scaffolded and functional; each needs a refinement pass to full spec compliance (one per session).
🟡 Scaffolded · 🟢 Spec-complete · ✅ Code Connect verified

| Component | Tier | Status | Remaining focus |
|---|---|---|---|
| Button | primitives | 🟡 | Hover/focus/active via CSS, icon-only a11y, CVA class variants |
| Input | primitives | 🟡 | Prefix/suffix affixes, exact sm/md heights, focus ring |
| Label | primitives | 🟡 | Size inheritance from parent control, inline variant |
| Textarea | primitives | 🟡 | Resize handle, exact min-heights, sm/md padding |
| Checkbox | primitives | 🟡 | Focus ring on box only, indeterminate dash, error+checked colour |
| Switch | primitives | 🟡 | Exact track/thumb sizes, focus ring, reduced motion |
| Badge | primitives | 🟡 | Outline intent layering, exact padding/radius |
| Alert | compositions | 🟡 | Actions slot with inline buttons, per-variant icon |
| Card | compositions | 🟡 | Leading visual slot in Header, action slot, shadow token |
| Dialog | compositions | 🟡 | Focus trap, scroll lock, sheet drag handle |
| Tabs | patterns | 🟡 | Roving focus (arrow keys), keyboard activation, badge in trigger |
| NavBar | layouts | 🟡 | Mobile menu Drawer, responsive breakpoints, hamburger |

Figma ↔ code naming and variant mismatches are tracked in `docs/audits/FIGMA-CODE-PARITY.md`.
Checkbox is the phase-2 pilot: in Figma its variant property is renamed to `Checked`, a usage description is written, and 15 card variants at md size were added (60 total). The other 11 components are untouched in Figma.

## File map
```
packages/
├── tokens/            atlas.tokens.css (source of truth) · .json · .figma.tokens.json
├── ui-web/src/        primitives/ · compositions/ · patterns/ · layouts/
├── ui-native/         React Native components (Expo)
├── figma-sync/        code-connect/*.figma.tsx · mcp/configs/
├── governance/        token-lint.mjs · contracts/
└── ai-workflows/      legacy skill definitions (retired in phase 8)
app/
├── page.tsx           visual sandbox
├── prototypes/        coded flows (FlowShell + PhoneFrame + Atlas components)
└── globals.css        imports tokens + tailwind
benchmarks/            agent cost/quality benchmark · tasks/ · results/ · rubric.md
docs/
├── ATLAS-AI-UPGRADE-PLAN.md   current programme
├── HANDOFF-CLAUDE-CODE.md     one ready-to-paste prompt per phase
├── audits/                    QA-REPORT.md · FIGMA-CODE-PARITY.md
├── architecture/ATLAS-SPEC/   per-component specs
└── decisions/                 ATLAS-COMPONENTS-V1.md (locked v1 decisions)
```
`atlas/` holds the generated snapshot the agent reads: `index.md`, per-component docs and metadata, semantic tokens, and `state/` (status, discrepancies, decisions, candidates). Generated — never hand-edited.

## Key decisions
- `@/*` alias → project root; `@atlas/ui-web/*` → `packages/ui-web/src/*`
- Token prefix `--atlas-*`; dark mode via `data-theme="dark"` on `<html>`
- Radix installed: `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`
- Dev server runs on port 3030

## Baseline (phase 0, sonnet, 3 runs each)
| task | context tok | turns | reads | coverage | manual /20 |
|---|---|---|---|---|---|
| T1 send-money | 2,244,300 | 40 | 16 | 7/7 | 15 |
| T2 settings | 1,690,897 | 28 | 10 | 5/6 | 14 |
