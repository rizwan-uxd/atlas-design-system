# Atlas AI upgrade — Claude Code handoff

A fresh Claude Code session knows nothing about the decisions behind this work. Each phase below gives it exactly what it needs: paste the prompt, nothing else. Plan: `docs/ATLAS-AI-UPGRADE-PLAN.md`. Audit: `docs/audits/FIGMA-CODE-PARITY.md`.

## Setup (once)

1. **Figma MCP** — `.mcp.json` is committed with Figma's remote server (`https://mcp.figma.com/mcp`). On first launch Claude Code asks to approve the project server, then Figma asks you to sign in.
   *Alternative:* run the Figma desktop app with the Dev Mode MCP server enabled and point the config at its local URL instead. Use whichever your Figma plan and setup allow — only phases 2F/3/5 need it.
   Verify with: `claude mcp list`, or ask a session "list the pages in the Atlas Figma file".
2. **Run the Phase 0 baseline before anything else.** Once the repo changes, a clean "before" number is gone.
3. Pick one model for the benchmark and keep it for the "after" runs.

## Phase order
`0 → 1 → 2F (here, Figma) → 2C → 3 (here, Figma) → 4 → 5 → 6 → 7 → 8`
"here" = the Cowork session with Figma access. Everything else runs in Claude Code.

---

## Phase 0 — Baseline
Terminal, not a prompt:
```bash
benchmarks/run.sh baseline T1 3 <model>
benchmarks/run.sh baseline T2 3 <model>
```
Then score one run per task with `benchmarks/rubric.md` → `benchmarks/results/baseline/<task>/manual.json`.
**Done when** `benchmarks/results/SUMMARY.md` has both baseline rows.

---

## Phase 1 — Harness rules
```
Read docs/ATLAS-AI-UPGRADE-PLAN.md, then rewrite AGENTS.md as the Atlas harness rules file.

It must define, in under 120 lines: source of truth (Figma leads, atlas/ snapshot is a cache, escalate to Figma only when the snapshot is missing a field or stale); context priority order; the tool-selection rule (understand → identify context → minimum tools → execute → verify); task boundaries (no working ahead, no unrelated refactors, no new components or tokens); the execution loop (parse, scope, retrieve, plan, execute, verify, correct, report); the uncertainty rule (never invent a design-system rule — resolve via state, references, code, then Figma; otherwise stop and name the missing decision); token rules; and a routing table of task type → skill.

Keep the existing Next.js rules block at the top. Then shrink claude.md to current project state only, with no rules, and make CLAUDE.md a pointer to AGENTS.md.

Do not create skills or the atlas/ folder in this phase.
```
**Done when** AGENTS.md covers all eight areas, no rule is duplicated in claude.md, and nothing else changed.

---

## Phase 2C — Parity: the code half
Run only after the Figma side of a component is done. One component per session.
```
Read the resolution table in docs/audits/FIGMA-CODE-PARITY.md, then align the <Component> code to Figma.

Update: packages/ui-web/src/**/<Component>.tsx (exported types + CVA), packages/figma-sync/code-connect/<Component>.figma.tsx, packages/governance/contracts/<Component>.contract.ts if present, tests, and every call site under app/.

Constraints: Figma's names win. Do not rename anything not in the table, do not add variants, do not refactor neighbouring components.

Finish with: npm run token-lint, npx tsc --noEmit, npm test — and a list of every file you changed.
```
**Done when** the three checks pass and the diff touches only that component plus its call sites.

---

## Phase 4 — Snapshot + state layer
```
Read docs/ATLAS-AI-UPGRADE-PLAN.md (phase 4), then create the generated-context layer under atlas/.

Structure: atlas/index.md (one line per component: purpose, import path, variants), atlas/metadata/<Name>.json (variants, sizes, props, tokens used, figma node id, syncedAt, figmaVersion), atlas/<Name>.md (when to use, when not to, do/don't), atlas/tokens.json + atlas/tokens.md (semantic tokens only), atlas/state/{status,discrepancies,decisions,candidates}.json.

For now, populate from the repo — the exported types, the Code Connect files and the audit doc — and mark every file syncedAt: null, source: "repo-derived", so phase 5 can replace it from Figma. Seed state/discrepancies.json from the audit's resolution table and state/status.json with per-component parity, metadata, code and verified-at fields.

Every generated file starts with a "GENERATED — do not hand-edit" line. Add atlas/README.md explaining the layer in under 20 lines. Keep each component file under 2.5 KB.
```
**Done when** the tree exists, files are within budget, and nothing outside `atlas/` changed.

---

## Phase 5 — Sync skill
```
Create the atlas-figma-sync skill at .agents/skills/atlas-figma-sync/ (SKILL.md + references/), and symlink .claude/skills → .agents/skills.

It pulls the Atlas Figma file (key cKYhfaHLCoyMHi9nKr63Ig) through the Figma MCP, regenerates atlas/metadata/*.json, atlas/<Name>.md and atlas/tokens.*, stamps syncedAt and the Figma file version, diffs Figma against the exported types in packages/ui-web/src, and writes any drift to atlas/state/discrepancies.json. It never writes to Figma.

The SKILL.md body stays under 100 lines; put the field mapping and the JSON shape in references/.
```
**Done when** a run regenerates `atlas/` with real `syncedAt` values and reports drift.

---

## Phase 6 — Verify skill + script
```
Create scripts/atlas-verify.mjs and the atlas-verify skill.

Three groups of checks. Design: variants, sizes and tokens used in the changed files against atlas/metadata/<Name>.json, flagging stale snapshots. Code: token-lint, tsc, tests, Atlas component usage, no raw HTML controls, basic a11y attributes. Scope: git diff touches only intended paths, no new tokens or components.

Reuse the check logic already in benchmarks/analyze.mjs rather than rewriting it. Output a pass/fail line per check plus the mismatches, and exit non-zero on failure.
```
**Done when** it passes on a clean tree and fails on a deliberately broken prototype.

---

## Phase 7 — Task skills
```
Create two skills under .agents/skills/: atlas-prototype and atlas-component.

atlas-prototype builds a flow in app/prototypes/<slug> using FlowShell and Atlas components. Disclosure order: atlas/index.md → only the atlas/<Name>.md files for the components used → atlas/tokens.md only if custom layout is needed. It never reads docs/ and never calls Figma. Gaps are composed locally from primitives and logged in atlas/state/candidates.json. It ends with atlas-verify.

atlas-component changes a component: Figma first, then docs, then code, Code Connect and state, ending with atlas-verify.

Descriptions must be specific enough to trigger on their own task and not on each other. Bodies under 100 lines; details go in references/.
```
**Done when** both trigger correctly and a prototype build reads only the files listed above.

---

## Phase 8 — Diet and re-benchmark
```
Archive stale planning docs into docs/_archive (keep the plan, the audits and this handoff). Remove the packages/ai-workflows/atlas-ui-skill and atlas-context.skill leftovers now that repo skills exist. Do not touch packages/ui-web, app/ or atlas/.
```
Then re-run: `benchmarks/run.sh after T1 3 <model>` and `after T2`, score the rubric, and compare in `SUMMARY.md`.
**Success:** fewer tokens, tool calls, reads, turns and rework edits, with quality equal or better. If quality dropped, the phase failed regardless of the token numbers.

---

## Rules for every session
- One phase per session. Don't work ahead.
- Read the plan and the audit; don't re-derive decisions.
- Figma and code disagree → Figma wins, flag it, fix Figma first.
- Finish by listing what changed, what was verified, and anything unresolved.
