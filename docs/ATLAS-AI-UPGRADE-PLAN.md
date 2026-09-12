# Atlas AI Upgrade Plan — v2 (harness-aligned)

_Rev 2026-09-12 · web only · Figma leads, code follows · supersedes v1_

Goal: **maximum useful output per token, tool call, file read and agent turn — without losing quality.**

## Core principle (protect this)
**Figma is the design-system authority; the generated `atlas/` snapshot is the agent's optimized read layer — a cache, never a replacement.**

```
Figma → sync → atlas/metadata + atlas/state → progressive disclosure → agent → verify against Figma → report
```

## Decisions
| Topic | Decision |
|---|---|
| Source of truth | Figma = components, tokens, usage docs. Repo = agent instructions + generated snapshot + implementation. Disagreement → **Figma wins, flag it, change Figma first, then code**. |
| Figma metadata authoring | Agent drafts via Figma MCP, Riz reviews per component. |
| Prototype output | Coded flows in `app/prototypes/<slug>` (FlowShell + Atlas components). Gaps → local composition from primitives, logged as candidates. Prototypes never change the library. |
| Skill format | Portable `SKILL.md` + `references/`, routed from `AGENTS.md`; usable by Claude Code and other agents. |
| Sync | On-demand sync skill (MCP → regenerate snapshot + state). |
| Old skills | Retire `atlas-context` + `atlas-ui-system` (they load everything on every turn). |
| Figma plan | Professional → no Code Connect in Dev Mode; `.figma.tsx` files remain the prop-mapping source the sync reads. |
| Success | Fewer tokens, tool calls, file reads, turns and correction cycles **at equal or better quality**, with verification that actually runs. |

### Architecture decisions (from the harness spec review)
1. **Generated vs authored stay separate.** `atlas/` = generated only (never hand-edited). Skills and references are authored and live in `.agents/skills/` (symlinked to `.claude/skills/`). The spec's single `atlas/` tree would make "never hand-edit" unenforceable.
2. **Snapshot = JSON facts + Markdown guidance.** `atlas/metadata/<Name>.json` (variants, sizes, props, tokens, node ids) for machine use; `atlas/<Name>.md` (when to use, do/don't, examples) for reasoning. Index lists one line per component.
3. **No repo restructure.** Keep `packages/ui-web`; the spec's `src/components` is conceptual, and moving it would be exactly the unrelated refactoring the spec forbids.
4. **Freshness + escalation.** Every snapshot file carries `syncedAt` and the Figma file version. Agents may call Figma MCP **only** when the snapshot lacks the field, is marked stale, or verification finds a mismatch — and must say so in the report.

## Phases

### Phase 0 — Baseline (measure before changing)
`benchmarks/` kit: T1 send-money flow, T2 settings screen (gap component) × 3 runs on an isolated copy.
Records tokens, cost, turns, wall time, files read by category, **tool calls, Figma MCP calls, verify runs, rework edits**, plus automated quality (token-lint, tsc, Atlas usage, raw elements) and a manual /20 score.
_Status: kit built, runs not yet executed._

### Phase 1 — Harness rules (`AGENTS.md`)  ← promoted from "cleanup" to the harness itself
One short, stable file, no duplication with skills. Defines:
- source of truth + escalation rule
- context priority order (request → instructions → metadata → references → code → prototype)
- tool-selection rule: *understand → identify context → minimum tools → execute → verify*
- task boundaries: no working ahead, no unrelated refactors, no new components/tokens
- the execution loop: parse · scope · retrieve · plan · execute · verify · correct · report
- uncertainty rule: resolve via state → references → code → Figma MCP; otherwise stop and name the missing decision. Never invent a design-system rule.
- token rules: "does this materially affect the task?" before every read and tool call
- a routing table: task type → skill
`claude.md` shrinks to project state only; `CLAUDE.md` points at `AGENTS.md`.

### Phase 2 — Figma parity + structure (per component)
Per `docs/audits/FIGMA-CODE-PARITY.md`. Figma first, then code, same change: Code Connect file, contract, tests, call sites (37 affected).
_Done: file restructure (README page, one page per component, sandbox page)._ Next: Checkbox pilot.

### Phase 3 — Figma metadata (per component, straight after its parity fix)
Description (what it is · when to use · when not to use · do/don't), documentation link, variable **code syntax** (`var(--atlas-…)`) on all 217 variables, descriptions on semantic variables, remaining unbound colours/spacing/type fixed (Input, Label, Textarea worst).

### Phase 4 — Snapshot + state layer
```
atlas/                      # GENERATED — never hand-edit
  index.md                  # 1 line per component
  metadata/<Name>.json      # variants, sizes, props, tokens, node ids, syncedAt, figmaVersion
  <Name>.md                 # usage guidance from the Figma description
  tokens.json / tokens.md   # semantic tokens only
  state/
    status.json             # per component: parity, metadata, code, verified-at
    discrepancies.json      # known Figma↔code mismatches, open/closed
    decisions.json          # approved design decisions (why Tabs is line/pill/segmented…)
    candidates.json         # gap components logged by prototypes
```
State answers "has this been decided already?" without rediscovery.

### Phase 5 — Sync skill
`atlas-figma-sync`: pull via MCP → regenerate `atlas/` → stamp `syncedAt` + file version → diff against code enums → write drift into `discrepancies.json` → report. Never edits Figma.

### Phase 6 — Verify skill + script
`atlas-verify` + `scripts/atlas-verify.mjs` (reuses the benchmark's quality checks):
- **Design:** variants, sizes, states, tokens used vs `atlas/metadata/<Name>.json`; escalate to Figma when stale.
- **Code:** Atlas patterns, component API, token-lint, tsc, tests, basic a11y.
- **Scope:** git diff touches only intended files; no new tokens or components.
Output: pass/fail per check + mismatches. "It compiles" is not done.

### Phase 7 — Task skills
`atlas-prototype` (build a flow; index → only the components used → tokens; gap policy; ends in verify) and `atlas-component` (build/change a component: Figma first → docs → code → Code Connect → verify). Both progressively disclosed: description → SKILL.md → references.

### Phase 8 — Context diet, retire old skills, re-benchmark
Archive stale `docs/` plans, retire `atlas-context` + `atlas-ui-system`, re-run T1/T2 and compare against Phase 0.

## Execution
Run in Claude Code via `docs/HANDOFF-CLAUDE-CODE.md` — one ready-to-paste prompt per phase (scope, files to read, constraints, done criteria). Figma MCP is configured in `.mcp.json`; only phases 2F, 3 and 5 need it.

## Open items
- Phase 0 not yet run (needs Claude Code on the Mac; pick the model and keep it fixed for the "after" runs).
- Tabs restyle (`enclosed` → `segmented`) and NavBar `elevated` ≈ `floating` need a visual decision.
