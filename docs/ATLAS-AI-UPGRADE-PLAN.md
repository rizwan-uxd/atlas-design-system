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

### Phase 8 — Context diet, retire old skills, re-benchmark — ✅ done (2026-09-13)
Archive stale `docs/` plans, retire `atlas-context` + `atlas-ui-system`, re-run T1/T2 and compare against Phase 0.
- **Re-benchmark:** harness-v2 (`d7967d7`), T1/T2 × 3 (`816ff1c`, manual scores `235ef87`). Correctness equal or better:
  T1 7/7 ×3, T2 5/6 ×3, final verify 3/3 both, manual T1 16/20 (phase 0: 15), T2 16/20 (14).
  Effort below phase 0: cost T1 $0.95 → $0.78, T2 $0.70 → $0.51; cache read T1 2.18M → 1.50M, T2 1.59M → 0.88M.
- **Diet:** stale plans moved to `docs/_archive/` (root `ROADMAP.md`, `ATLAS-REPO-ANALYSIS.md`, `implementation/`, `sessions/`);
  `packages/ai-workflows/atlas-ui-skill` removed (no `atlas-context` leftovers remained). No re-run needed: all 6 harness-v2 runs read 0 off-task files.

### Phase 9 — Benchmark and tighten the component workflow — ✅ CLOSED (2026-09-22)
Approved 2026-09-13. Plan, pins, fixture gate, rubric, budget and causal acceptance: `docs/PHASE-9-PROPOSAL.md`.
v3 proposals: `docs/PHASE-9-V3-PROPOSALS.md`. **Full evidence trail and the closure record: `docs/PHASE-9-RESULTS.md`**
(the closure record is its last section; everything above it is chronological and preserved, HOLD states included).
Per-run metrics: `benchmarks/results/SUMMARY.md`. Rubric: `benchmarks/rubric-component.md` (unchanged).

**Outcome**
- **H3 (revised): ACCEPTED.** One full-output sync after code/companions; no re-sync after a state-only edit.
- **H6: FAILED / DEFERRED.** Not revised, not retried.
- **H3 and H6 cannot ship together.** They interact in both directions: v4 (`1fd95aa`) H3 fails 3/3 while H6 holds 0/3;
  v6 (`56170dc`) H3 holds 0/3 while H6 fails 1/3. The no-overlap rule blocks accepting both from a combined arm, so H3
  ships alone on `44eacba` (H6 reverted).
- **H5: rejected** (source signal never reproduced in fixture-2 v2: template opens 0/3).
- **H1: deferred** (overlaps H3). **H2 / H4: not reproduced.**
- **`f10119c` / `8a5189b` remain dependencies of H3** — H3 has only ever been measured on top of the sync change that
  derives `## Variants` / `## Sizes`. They ship together or not at all.

**Evidence**
- **v6 T3 ×3** (`harness-v6-t3f2`, source `56170dc`): H3 source signal **0/3**, all gates **3/3**, redundant confirmation
  sync **0/3**, mean syncs **2.33 → 1.00**, `snapshotCurrent` and final verify 3/3.
- **Rubric, v6 median run 1: A5 B5 C5 D5 = 20/20**, equal to `harness-v2-t3f2` r1 (A5 B5 C5 D5 = 20/20) — no criterion
  lower, satisfying §8.3 step 3 on the accepting arm.
- **H3-only regression** (`harness-v7`, source `44eacba`): T4, T1 and T2 ×3 each passed their stated automated gates —
  T4 gates 3/3, T1 coverage 7/7 ×3, T2 6/6 · 5/6 · 5/6, with tsc, token-lint, raw elements and primitive token refs all 0
  across the nine runs.
- **Caveat, preserved explicitly: T3 was never re-run on the H3-only source `44eacba`.** The accepting T3 runs were on
  `56170dc`, which still contained H6. This is a residual evidence caveat, **not an H3 failure** — H3's own criterion held
  3/3 on T3 under `56170dc` and 3/3 on T4 under `44eacba`, and the H6 revert touches a rule that only adds a state-edit
  step, not the sync rule H3 changes.

**Decisions and learning**
- **Rubric D resolved by choice D-3, not by rescoring.** The `harness-v3-t3f2` D 4 was measured against `53f31f3`
  (`f10119c` + pre-revision H3 + H5) — a **rejected** source. §8.3 step 3 asks whether the arm being accepted regresses,
  so it is evaluated on `harness-v6-t3f2`. **The old D 4 stays unchanged** as evidence against its rejected source: its
  stale-`DISC-004` finding was real, and reversing a score to clear a gate would corrupt the record. Nothing in
  `benchmarks/rubric-component.md` was edited.
- **A–D for v6 were scored from preserved artifacts at zero spend** — the run-1 workspace diff, `run-1.jsonl` tool order
  and final `result` event, and `T3/stale-row/run-1/stale-row.json`. A closure question that the existing artifacts can
  answer never justifies a new run.
- **The `claude.ai Claude Docs` MCP connector was accepted as a documented confound, not re-baselined.** It could not be
  disconnected (account-level), so it was absorbed into the v6 runtime pin. v6/v7 differ from the four fixture-2 baselines
  by one extra server *name* in the init list, with no extra tools offered. Re-baselining the four arms would have cost
  ~$10 of the remaining budget to remove a confound that changes nothing an agent can call.
- **Account-synced skills contaminate benchmark arms and must be removed and verified per run.** A
  `~/.claude/skills/synced/` bucket carrying `atlas-context` and `atlas-ui-system` — the two skills Phase 8 retired —
  regenerated four times during the v7 chain, twice mid-batch. Every occurrence was caught by `pins.mjs check` before the
  affected run started; the bucket was removed and the run re-issued with `BENCH_ONLY`. All 12 runs verified clean
  (128 skills per init snapshot, neither skill present). Left in place they supply Atlas tokens and variant rules directly
  and would void the `no-skill` comparison. **Check this before any future benchmark run.**
- **No further Phase 9 spend is justified.** Every acceptance bar is met or explicitly caveated, and the one open question
  (T3 on `44eacba`) is a narrow residual that the T4 evidence already makes plausible.

**Budget:** **$37.32 of the $42 cap; $4.68 remaining, intentionally preserved and not spent.** Cap history: $40 from
2026-09-13, raised to $42 on 2026-09-15 by user approval as the stated maximum.

**Source state at closure**
- `main` @ `21101c9` — all Phase 9 evidence and docs.
- H3-only source **`44eacba`** on `bench/phase-9-h3only` = `56170dc` with H6 (`1fd95aa`) reverted.
- v6 freeze source **`56170dc`**, tag **`phase-9-v6-freeze`** (tree `6c28995fc2`); `harness-v7` is pinned by label only
  (tree `d456c6b32f`) — **no v7 tag exists**.
- H3's own commits: `4e968cd` (original, superseded) and `56170dc` (revised, accepted).
  Sync dependency: `f10119c` / `8a5189b`. Switch parity `d0df523` is already on `main`.
- **Nothing has been pushed as part of the shipping step, and nothing will be without explicit approval.**

**Status**
```
PHASE 9:      CLOSED
H3:           ACCEPTED — READY FOR INTEGRATION
H6:           FAILED / DEFERRED
BENCHMARKING: STOPPED
BUDGET:       CLOSED / NO FURTHER SPEND PLANNED
NEXT STEP:    INTEGRATE H3 INTO MAIN
```

**Do not merge `bench/phase-9-h3only` wholesale.** It predates the benchmark evidence: a merge would revert ~32,000 lines
of Phase 9 results and docs, un-archive `docs/_archive/`, and **resurrect `packages/ai-workflows/atlas-ui-skill/`, the
skill Phase 8 retired**. Integrate by cherry-picking the H3 source changes only (see the closure record's shipping
recommendation).

**Still open, inherited from Phase 9 (none blocks H3):** the unexplained fixture-1 T1 6/7 signal; the Badge/DISC-006
fixture conflict (Phase 2, Badge); H6 itself.

## Execution
Run in Claude Code via `docs/HANDOFF-CLAUDE-CODE.md` — one ready-to-paste prompt per phase (scope, files to read, constraints, done criteria). Figma MCP is configured in `.mcp.json`; only phases 2F, 3 and 5 need it.

## Open items
- Phase 0 not yet run (needs Claude Code on the Mac; pick the model and keep it fixed for the "after" runs).
- Tabs restyle (`enclosed` → `segmented`) and NavBar `elevated` ≈ `floating` need a visual decision.
