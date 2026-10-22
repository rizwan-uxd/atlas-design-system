@AGENTS.md

# Atlas Design System — Project State

**Rules live in `AGENTS.md`.** This file is current state only — no rules, no conventions.

## Status
Monorepo restructured; 47 web components are tracked in `atlas/state/status.json` (35 spec-complete, 12 scaffolded) and live in `packages/ui-web/src/` by tier, with 17 native components in `packages/ui-native/components/` and 15 screen patterns in `packages/governance/patterns/` (generated copies in `atlas/patterns/`). A visual sandbox is at `app/page.tsx` and the prototype scaffold is under `app/prototypes/_shared/` (no flows currently).
**Current work:** component batches per `docs/componentlist plan _next6_2026-09-25.md` (batch 2 and its screen patterns complete; current next steps in `docs/HANDOFF-next-session.md`). The harness (phases 0 to 9) is finished and documented in `docs/HARNESS.md`; H3 is integrated on `main`.

## What this is
A monorepo holding: the visual sandbox (Next.js 16, `app/page.tsx`), the web component library (`packages/ui-web/src/`), a React Native library (`packages/ui-native/`), design tokens (`packages/tokens/`), Figma sync (`packages/figma-sync/`), governance checks (`packages/governance/`), and the agent benchmark (`benchmarks/`).

Stack: React 19 · Next.js 16 · Tailwind v4 · Radix UI · Atlas tokens via `packages/tokens/atlas.tokens.css`
Figma file: `cKYhfaHLCoyMHi9nKr63Ig` (Atlas/Web + Atlas/Mobile-Native pages)

## Run it
```bash
npm run dev        # → http://localhost:3030
npm run atlas:sync # regenerate atlas/ (add --pull for a Figma sync; see the atlas-figma-sync skill)
```

## Component status
47 web components are tracked in `atlas/state/status.json`: 35 spec-complete and 12 scaffolded. The 12 are the 9 v1 components below that are still scaffolded plus Pagination, PasswordInput and EmptyState; each needs a refinement pass to full spec compliance (one per session). The table lists the 12 v1 components only; `atlas/index.md` and `status.json` hold the rest.
🟡 Scaffolded · 🟢 Spec-complete · ✅ Code Connect verified

| Component | Tier | Status | Remaining focus |
|---|---|---|---|
| Button | primitives | 🟢 | Spec-complete. Open: DISC-095 (link variant ignores size; needs a decision) |
| Input | primitives | 🟡 | Prefix/suffix affixes, exact sm/md heights, focus ring |
| Label | primitives | 🟢 | Spec-complete: Code Connect maps State, ref/className/state tests, contract covers ref |
| Textarea | primitives | 🟡 | Resize handle, exact min-heights, sm/md padding |
| Checkbox | primitives | 🟡 | Focus ring on box only, indeterminate dash, error+checked colour |
| Switch | primitives | 🟡 | Exact track/thumb sizes, focus ring, reduced motion |
| Badge | primitives | 🟡 | Outline intent layering, exact padding/radius |
| Alert | compositions | 🟡 | Actions slot with inline buttons, per-variant icon |
| Card | compositions | 🟢 | Header slots and footer justify are not drawn in Figma (DISC-096, DISC-097) |
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
└── ai-workflows/      retired in phase 8 (README only)
app/
├── page.tsx           visual sandbox
├── prototypes/        _shared scaffold (FlowShell + PhoneFrame + registry); no flows yet
└── globals.css        imports tokens + tailwind
.agents/skills/        authored skills (symlinked as .claude/skills) — atlas-figma-sync · atlas-verify · atlas-prototype · atlas-component · atlas-pattern
scripts/               convert-tokens.mjs · atlas-sync.mjs (regenerates atlas/)
benchmarks/            agent cost/quality benchmark · tasks/ · results/ · rubric.md
docs/
├── HARNESS.md                 the one harness record: what was built, benchmark results
├── componentlist plan _next6…  batch 2 plan + progress log · HANDOFF-next-session.md (the one handoff)
├── audits/                    QA-REPORT.md · FIGMA-CODE-PARITY.md
├── architecture/ATLAS-SPEC/   per-component specs
└── decisions/                 ATLAS-COMPONENTS-V1.md (locked v1 decisions)
```
The snapshot was first synced from Figma on 2026-09-12 and last on 2026-10-21 (`figmaVersion` `lib:Atlas Design System v1@2026-07-06T03:44:45Z`); `atlas/state/discrepancies.json` holds 104 entries, 11 open (DISC-027, 095-104).

`atlas/` holds the generated snapshot the agent reads: `index.md`, per-component docs and metadata, semantic tokens, and `state/` (status, discrepancies, decisions, candidates). Generated — never hand-edited.

## Key decisions
- `@/*` alias → project root; `@atlas/ui-web/*` → `packages/ui-web/src/*`
- Token prefix `--atlas-*`; dark mode via `data-theme="dark"` on `<html>`
- Radix installed: `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`
- Dev server runs on port 3030
- Motion layer: `packages/ui-web/src/motion/` + `animated-icons/` (utility modules, not Figma components; skipped by `atlas:verify`). Motion tokens (duration and easing incl. `emphasized`, `exit`, plus `opacity/pulse`) exist in Figma `Atlas/Primitives` and match the CSS values, checked 2026-09-30. Figma opacity variables hold percent (50) where CSS holds fractions (0.5), DEC-058. `packages/tokens/atlas.figma.tokens.json` carries the Figma-scale values.

## Baseline (phase 0, sonnet, 3 runs each)
| task | context tok | turns | reads | coverage | manual /20 |
|---|---|---|---|---|---|
| T1 send-money | 2,244,300 | 40 | 16 | 7/7 | 15 |
| T2 settings | 1,690,897 | 28 | 10 | 5/6 | 14 |

## Phase 8 result (harness-v2 `d7967d7`, sonnet, 3 runs each, means)
| task | cost $ | turns | cache read | coverage | final verify | manual /20 |
|---|---|---|---|---|---|---|
| T1 send-money | 0.78 | 32.3 | 1.50M | 7/7 ×3 | 3/3 | 16 |
| T2 settings | 0.51 | 24.3 | 0.88M | 5/6 ×3 | 3/3 | 16 |
