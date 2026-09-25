# Atlas component expansion: plan and shared understanding

Status: agreed, **not started**. Execute in the next session, beginning with Phase 1 (Avatar), only when the user says "start".
Written: 2026-09-24. Planned execution: 2026-09-25.

Components (web only): **Avatar, Breadcrumb, Divider, ListItem (replaced DescriptionList, DEC-014), DropdownMenu (added, DEC-012)**. Timeline was dropped from the plan on 2026-09-25 and will not be built.

---

## 1. Sources of authority

| Source | Role |
|---|---|
| Atlas Figma library, file `cKYhfaHLCoyMHi9nKr63Ig` | Implementation authority |
| shadcn Figma reference nodes | Structural references only |
| GitHub repo `rizwan-uxd/atlas-design-system` | Code authority |

Reference nodes:

| Component | shadcn node |
|---|---|
| Avatar | `3710:7319` |
| Breadcrumb | `3760:57674` |
| Divider | **not yet supplied** (user provides before Phase 3) |
| DescriptionList | `38982:3517` (shadcn Item node; no generic Item component is published) |

## 2. Non-negotiable rules

- No raw values. Atlas tokens only (`--atlas-*`, semantic tokens, no primitive refs in app code).
- A missing token goes to Figma foundations first, then to code tokens, then into the component.
- No code until the Figma page has an explicit **"approved"** reply from the user in chat.
- No next component until the previous one has final approval.
- Figma wins over code. `atlas/` is generated and never hand-edited.
- Figma work goes through the authenticated Figma MCP only.
- No new dependencies without asking.
- Read `node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md).

## 3. Workflow per phase (A to E)

- **A. Reference and Atlas audit.** Inspect the shadcn node against Atlas foundations and primitives. Produce a mapping table and list any proposed semantic tokens. Log gaps.
- **B. Figma work.** Build the component page in the Atlas file. Each page reproduces the reference node's structure, layout and variants using Atlas foundations and primitives only, and follows the established page structure of the 12 existing components.
- **C. Gate 1: Figma approval.** User replies "approved" in chat.
- **D. Code.** Steps below.
- **E. Gate 2: final approval.** User replies "approved" in chat, then commit and merge.

### Phase D pipeline (code)

1. `atlas-figma-sync` (pull, regenerate `atlas/`)
2. Implement via the `atlas-component` skill, in the correct tier
3. Code Connect file in `packages/figma-sync/code-connect/`
4. Tests: vitest and jest-axe
5. Sandbox section in `app/page.tsx`, checked with browser screenshots
6. `atlas-verify` (`npm run atlas:verify -- --scope "<globs>"`)

## 4. Settled decisions

### Scope
- Web only. Native parity is logged in `atlas/state/candidates.json` as a candidate for each component, not built.
- Exactly five components. Nothing else is added.

### Tiers (under `packages/ui-web/src/<tier>/<Name>/`)
| Component | Tier |
|---|---|
| Avatar | primitives |
| Divider | primitives |
| Breadcrumb | patterns |
| DescriptionList | compositions |

### APIs and primitives
- Breadcrumb uses a plain `<a>` styled with Atlas tokens. Log this in `candidates.json`. Link, Icon and Tag are **not** built.
- Icons follow the existing repo convention (inline SVG where that is the pattern). No icon dependency. Log any convention inconsistency as a candidate.
- Compound/slot APIs follow Card and Tabs, only where the approved Figma anatomy needs them. Divider stays flat.

### Tokens
- Standing approval for the semantic tokens these five components need, so no per-token approval is required.
- Each token goes into Figma foundations first, then code tokens (`packages/tokens/atlas.tokens.css`, `.json`, `.figma.tokens.json`), then the component.
- Names follow Atlas conventions and reference Atlas foundation tokens only.
- Each token is documented in that component's audit mapping and in the state records.

### Responsive
- First inspect for breakpoint and responsive-layout tokens. `--atlas-breakpoint-sm/md/lg/xl` exist (640/768/1024/1280px), but CSS variables cannot be used in `@media`.
- Use container queries and auto-fit grids with an Atlas spacing token as the minimum column width (DescriptionList).
- Add no breakpoint tokens.

### Contracts
- Contracts in `packages/governance/contracts/` for **Avatar and Divider only**.

### Testing and visual regression
- vitest and jest-axe are already installed and used. No Playwright, Chromatic or Storybook.
- No visual-regression dependency now. **Revisit visual-regression tooling after Avatar receives Gate 2 approval.**

### Branching and commits
- One branch per component (`feat/avatar`, `feat/breadcrumb`, and so on), merged to `main` only after Gate 2.
- Nothing is committed before Gate 2.
- The Gate 2 commit contains: code, tests and docs, the `atlas-figma-sync` output, state updates, and any new semantic tokens introduced for that component. Phase 1 only also carries the v1.1 decision.
- Commit only when complete and verified. Commit trailer: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- H3 sync improvements are already on `main` (`4d90522`). No cherry-pick is needed.

### State and drift
- New components stay out of the 17-entry drift count in `atlas/state/discrepancies.json` until approved.
- The v1.1 decision is added to `atlas/state/decisions.json` and `docs/decisions/ATLAS-COMPONENTS-V1.md` in Phase 1's Gate 2 commit.

## 5. Phases

### Phase 1: Avatar (`3710:7319`)
Tier primitives. Contract required. Carries the v1.1 decision. Branch `feat/avatar`.
After Gate 2: revisit visual-regression tooling.

### Phase 2: Breadcrumb (`3760:57674`)
Tier patterns. Plain `<a>`, logged as a candidate. Branch `feat/breadcrumb`.

### Phase 3: Divider (node to be supplied)
Tier primitives. Contract required. Flat API.
If the user supplies no reference node, use Atlas-only anatomy (horizontal, vertical, labelled, inset) and the "preserve exactly" rule does not apply.
Branch `feat/divider`.

### Phase 4: Timeline — removed
Dropped from the plan by the user (2026-09-25). Not started, not planned.

### Phase 5: DescriptionList (`38982:3517`)
Tier compositions. Built from the shadcn Item node as structural reference, since no generic Item exists. Auto-fit grid with an Atlas spacing token as minimum column width.
Branch `feat/description-list`.

## 6. Open dependencies and decisions

1. The user supplies the Divider reference node ID before Phase 3.
2. Timeline was removed from the plan; there is no second open decision.

## 7. Plan typos, as read

- "accessible name/imvior" reads as "accessible name/behavior".
- "layundations" reads as "layout foundations".

## 8. Facts confirmed in the repo (2026-09-24)

- Stack: Next.js 16, React 19, Tailwind v4, Radix UI, tokens via `packages/tokens/atlas.tokens.css`, dark mode via `data-theme="dark"`.
- Existing tiers: primitives (Button, Input, Label, Textarea, Checkbox, Switch, Badge), compositions (Alert, Card, Dialog), patterns (Tabs), layouts (NavBar).
- All 12 existing components are 🟡 scaffolded.
- No icon library installed.
- Contracts exist only for the 7 primitives.
- 17 open drift entries in `atlas/state/discrepancies.json`.

## 9. Files likely touched (per component)

- `packages/ui-web/src/<tier>/<Name>/`
- `packages/figma-sync/code-connect/<Name>.figma.tsx`
- `packages/tokens/atlas.tokens.css`, `.json`, `.figma.tokens.json` (only if new semantic tokens)
- `packages/governance/contracts/` (Avatar, Divider)
- `app/page.tsx` (sandbox section)
- `atlas/state/candidates.json`, `atlas/state/decisions.json`
- `docs/decisions/ATLAS-COMPONENTS-V1.md` (Phase 1)
- `atlas/` regenerated by `atlas-figma-sync`, never hand-edited

## 10. Completion criteria

A component is done only when: Gate 1 and Gate 2 both carry an explicit "approved"; code, tests, sync output, docs and state updates are committed together on its branch; `atlas-verify` passes; and the branch is merged to `main`. Only then does the next phase begin.

## 11. Start of next session

1. Read this file and `AGENTS.md`.
2. Wait for the user's "start".
3. Phase 1, step A: audit Avatar `3710:7319` against Atlas foundations, deliver the mapping table and any proposed semantic tokens. Create `feat/avatar`. No Figma edits until the mapping is reviewed as the workflow requires.
