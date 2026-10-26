# Handoff: Phase 7 built (gates, trend baseline, bounded repair); half a session left (Atlas roadmap)

Written 2026-10-22, updated 2026-10-25 after D1 option B, M4 (#108), Phase 4 (#109), M5.1 radius (#110), M5.2 spacing (#112), M5.3 type (#113), M5.4 motion (#115), M5.5 shadow (#117) and M5.6 brand axis (#118, #119 with baselines #120) and Phase 6 PR-0. **Read in this order: `AGENTS.md` → `docs/ATLAS-DELIVERY-ROADMAP.md` → this file.**
The roadmap is normative now (referenced from `AGENTS.md` §2) and owns the phase order; this file is
only current state plus the gotchas that will bite again. **This is the only handoff doc** — earlier
ones were deleted and live in git history.

## Progress (update at the end of every session, and report it at the start and end of each)
Counted in sessions, using the roadmap's own estimates (midpoint where it gives a range). Change N
and say so when an estimate changes. **Roadmap: 27 of ~28 sessions done (~96%). Session 27 (2026-10-25) built Phase 7: hard/trend/report gates (DEC-094), the Tier 3 trend baseline, markup-only agentCompliance and the bounded model-agent repair loop. Earlier: 26 of ~28 (~93%). Session 26 (2026-10-25) built Phase 6 PR-1 (model agent, protocol bench over `claude -p` on the subscription, DEC-093); next is Phase 7. Earlier: 25 of ~28 (~89%). N changed from ~27 to ~28: Phase 6 needs 3 sessions against an estimate of 2.5 (plan, PR-0 enforcement, PR-1 model agent). Sessions 24 and 25 ran in one conversation on 2026-10-25: the Phase 6 plan (A1 + B1, DEC-092) and PR-0. PR-0 makes every agent request carry a filtered catalog: `packages/registry/lib/filter.ts` (`filter`, `fullCatalog`, `catalogFor`, `restrict`), `openSession()` in `packages/runtime/src/session.ts` pairs the agent request with a registry restricted to the catalog, and the validator reports a withheld type as `out-of-catalog` and falls back (plan `docs/superpowers/plans/2026-10-25-phase-6-filtered-catalog.md`). Next: session 26 of ~28 = decide D-C, then plan and build Phase 6 PR-1 (model agent, `protocol` bench type).**

| Phase | Sessions (est.) | Done | Status | PR |
|---|---|---|---|---|
| Phase 1 — docs + metrics generator | 1 | 1 | ✅ | #98 |
| M1 — Figma↔code comparison | 1.5 | 1.5 | ✅ | #99 |
| D1 — token-table spike | 1 | 1 | ✅ C built, A/B spiked | #100 |
| D1 — option B, the full variable table | 1 | 1 | ✅ user chose B (DEC-081) | #107 |
| M2 — verifier can fail | 1 | 1 | ✅ | #101 |
| M3 — registry | 4 | 4 | ✅ exit met, 6/6 types (Text registered in #128) | #102, #103, #104, #105 |
| 2d — token work, zero new tokens | 1.5 | 1 | ✅ in 1 session (est. 1.5) | #106 |
| **M4 — runtime vertical slice** | 3.5 | 3.5 | ✅ all 12 M4 rows measured: 11 pass, size fails (report-only, DEC-085) | #108 |
| Phase 4 — enforcement hardened | 2.5 | 3 | ✅ in 3 sessions (est. range 2–3) | #109 |
| **M5 — semantic tokens + brands** | 6 | 6 | ✅ in 6 sessions (est. 7): M5.1 radius (DEC-086), M5.2 spacing (DEC-087), M5.3 type (DEC-088), M5.4 motion (DEC-089), M5.5 shadow (DEC-090), M5.6 brand axis (DEC-091) | #110, #112, #113 (+#114), #115, #117, #118, #119 (+#120) |
| Phase 6 — filtered agent catalog | 3 | 3 | ✅ plan + PR-0 (DEC-092) + PR-1 (DEC-093); bench readings: reduction passing, first op and compliance failing | #121, PR-1 |
| Phase 7 — metrics as release gates | 1.5 | 1 | 🟡 gates, trend baseline, markup-only compliance, bounded repair (DEC-094); 0.5 left | session-27 PR |
| **Total** | **~28** | **27** | **~96%** | |

Phase 6 PR-0 (#121) moved the three vitest Context Containment rows to passing: **27 passing · 3 failing · 6 not measurable** of 36, refreshed from the #121 CI run.
Metric table (the roadmap's scoreboard, CI result-derived since Phase 4): **24 passing · 3 failing · 9 not measurable** of 36 (refreshed from the #118 CI run, carried in #119). M5.6 moved `design.brand-modes` from not measurable to passing. The 3 failing rows are real findings, not regressions: missing code tokens (2, DISC-106), missing Figma tokens (9, DISC-107) and the report-only protocol size (0.308, DEC-085).
M3 exit: **6/6 types `registryComplete`** (Text built in #125, registered in #128), **48/48 generated
contracts** (the 44 hand-written ones deleted), **2/2 target metrics passing** (plus registry-states),
each over the registered subset (5/48 components registered).

## Roadmap closure plan (DEC-098 to DEC-102, decided 2026-10-25; nothing below is closed)
Owner and dates are placeholders: owner = the design-system owner role (no name given), dates are proposals. Each row ends as passed, fixed or explicitly decided with evidence; no metric is marked green to finish.

| End state | Status | Reason and next step | Follow-up |
|---|---|---|---|
| `registryProductionReady` 6/6 | OPEN, 5/6 | Alert (#134) and Input (#135, 2026-10-26) are spec-complete; TextField is stable. Only **Form** is held: it is structural, so it stays provisional with an empty `waitingOn` (the schema allows that for a structural entry only; `registry-promotion` fails it on a component). Closing it needs the DEC-100 rule built: a structural entry is production-ready when its element facts exist, its events and validation are covered by runtime tests, and its rendered demo has an axe check and a runtime-demo visual snapshot. | 2026-11-08 |
| Contrast resolved or formally waived | OPEN | 14 allowances (DISC-108), each fixed by an existing primitive (DEC-099); Kind B, Figma first, baselines. Open sub-decision: subtle in dark equals muted at neutral-400. | 2026-11-22 |
| Token drift measured or blocked | OPEN, measured, not blocked | DISC-106 and DISC-107 are measured through the plugin API (DEC-098); fix or accept each. | 2026-11-22 |
| Accessibility rows measurable | OPEN | axe-coverage, keyboard and focus-visible are specified (DEC-102); axe-coverage fails today on Checkbox (no test file). Rows stay `not measurable` until built. | 2026-11-15 |
| Benchmark against a justified target | OPEN | Reclassified in two rows (DEC-101): Atlas first op at 250 ms (0.015 ms p95 measured in Node, baseline run needed) and end-to-end through `claude -p` as a trend row (warm P95 2649 ms, cold 2256 ms). | 2026-11-15 |
| Owner backlog, no undecided rows | DECIDED, not built | Add 7 role stages, leave 8 primitive, do the sandbox cascade and the Switch and Select Figma gaps (DEC-102); implementation issues not opened. | 2026-11-22 |

**Remaining after Alert (#134) and Input (#135):**
1. Build the DEC-100 structural rule for Form (owner-decided 2026-10-25, not built): extend `scripts/lib/registry-promotion.mjs` and the production-ready metric so a structural entry can be stable on the three evidence items above, then drop Form's `provisional`. One session; update `filter.test.ts` (it hard-codes which entries are provisional) and run `npm run test:scripts`.
2. Input's filled corners and unstyled focus ring changed on purpose (#135). If Visual Regression flagged the sandbox baselines, regenerate them from CI, not locally (local baselines are darwin, CI's are not).
3. Alert's Figma description stores `&#39;` and `&quot;` where quotes belong; find whether the sync or Figma wrote them and fix at the source.
4. Worktrees have no `node_modules`; run `npm ci` before `atlas:verify`. `--stamp` alone stamps nothing for a registry-only change: use `--stamp-components <Name>`. The roadmap metric region goes stale on every change to `registryProductionReady`: refresh it from the PR's `metrics` artifact before merging, or the "Metric manifest" check fails after auto-merge.

Latest ids: **DEC-102**, CAND-071, DISC-109.

## Start here (session 29, what session 28 left)
0. **Report progress first**: doing / done / % / session X of N. Session 28 did the benchmark half of the closing work (DEC-095); the roadmap stays at 27 of ~28 until the two items below are decided.
1. **Waiting on the owner (both are blast-radius calls, not built):**
   - **Exclude scaffolded registry entries.** Alert is now `spec-complete` (#134); TextField and Form still compose a scaffolded part (Input). Removing them drops `registryComplete` from 5 to 2 (the ratchet and `### Breaking` CHANGELOG rule apply), and breaks the runtime demo, the request-access, notice and text-entry eval tasks, the fuzz fixtures and the protocol bench readings. Confirm which entries go before touching them.
   - **Text as the 6th type: done.** Built in #125 and registered in #128 (DEC-096): root-level, capability `display`, which the interactive test ignores. Nesting Text inside Form, Field or Alert is a separate decision: it edits those entries and the request-access and notice eval catalogs.
2. **Readings (protocol-v2a, committed as `protocol-latest`):** cold start 2256 ms, warm `firstOpP95` 2649 ms (target 250, failing), promptReduction min 0.676, markup 0 of 20, repair loop max 1 attempt and never triggered. Spend 0.33 of 3.00 USD in `protocol-spend.json`.
3. **Waived, not resolved:** the 14 contrast allowances (DISC-108 open). Token drift (DISC-106, DISC-107) is untouched and waits for the token-sync gate.
4. **Gates:** 28 hard rows (`sandbox sections` promoted). axe-coverage, keyboard and code.focus-visible stay not measurable: no check of those names exists, so building them is new work.
5. **Metric refresh, race-proof:** refresh from the PR's own CI artifact (`gh run download <run> -n metrics -D <scratch>`, then `node scripts/metrics-report.mjs --results <scratch>/metrics-input`) before the required checks finish.
6. **Labels:** `atlas-approved-new` for new tokens, plus `atlas-native-thaw` whenever `tokens:build` changes the native file.

## State
- **Text is built (#125, 2026-10-25), outside the roadmap's session count.** Figma page `Text` (set `1120:31`), 7 roles x 2 tones (default, muted), `packages/ui-web/src/primitives/Text/`, tests, Code Connect and a generated contract. Registered in #128 (DEC-096), so the registry has 6 entries, 5 of 48 components registered, and the full catalog is 49 agent-visible names (48 components plus Form). The CI `atlas-approved-new` label was needed for the new component. Latest ids: **DEC-096, CAND-071, DISC-109**.
- **Phase 7 is built (2026-10-25, DEC-094).** `metrics.manifest.json` `gate` per row (27 hard, 3 trend, 7 report); `scripts/metrics-gate.mjs` + `scripts/lib/metrics-gate.mjs` (+ `scripts/tests/metrics-gate.test.mjs`); CI step "Metric gates"; `benchmarks/results/protocol-baseline.json`; `agentCompliance` is markup only (`nonOpReps` reported separately); `packages/runtime/src/model-agent.ts` repair loop with `diagnostics[]`. Latest ids: **DEC-095, CAND-069, DISC-109**.
- **Phase 6 PR-1 is done (2026-10-25, DEC-093).** `packages/runtime/src/{op-stream,agent-prompt,model-agent}.ts`; `benchmarks/protocol/` (bench, `claude-cli-stream.ts`, stats, full-catalog baseline); `run.sh` type `protocol`; manifest row `protocol.agentCompliance`; CI copies `protocol-latest/bench.json` into `.metrics/`. Latest ids: **DEC-093, CAND-069, DISC-109**.
- **Phase 6 PR-0 is done (2026-10-25, DEC-092: A1 + B1).**
  - Registry: `lib/filter.ts`; `lib/registry.ts` holds the value and types (split from `index.ts` to avoid an import cycle); `Registry.components` (47 facts names, generated into `runtimeRegistry.ts`) and `Registry.withheld` (set only by `restrict`). The full catalog is 48 agent-visible names. `filter()` walks nesting both ways and adds fallback targets, so press → `["Alert", "Button"]`.
  - Evaluation set `packages/registry/tests/eval-tasks.json` (schema `registry.schema.json#/$defs/evalTasks`): request-access, confirm, notice, text-entry.
  - Runtime: `AgentRequest` in `protocol.ts`; `openSession` and `catalogPrompt` in `session.ts`; `createStubAgent(fixture, request, delayMs?)`; issue code `out-of-catalog`. The runtime demo runs inside a submit session (its catalog is all 5 registered types, so the tree is unchanged).
  - Manifest: check renamed to `registry/filter > no request exposes the full catalog`; the three rows carry a `why` that says 43 of the 48 names are unregistered.
  - Latest ids: **DEC-092, CAND-069, DISC-109**.
- **M5.6 brand axis is done (2026-10-25): PR-0 #118 (`9452f31`), PR-1 #119, baselines #120.**
  - Figma: `Atlas/Brand` (`VariableCollectionId:1115:2`, modes Atlas and Warm), `light/*` and `dark/*` for primary, primary-hover, primary-active, primary-subtle, focus-ring and primary-foreground (`VariableID:1115:3-14`, Figma-only). `Atlas/Semantic`'s six colours alias them. `coral/50, 200–900` have WEB syntax; `coral/100` and `350` stay Figma-only.
  - Code: 9 `--atlas-color-coral-*` primitives; `[data-brand="warm"]` and a (0,2,0) warm dark block after the Atlas dark block; the component-token block also on `[data-brand]`. `parseTokens` returns `brands`; `contrastCheck` measures `<brand>-light|dark` only for pairs the brand changes; `design.brand-modes` in `atlas-verify`.
  - Sandbox: a Warm/Atlas toggle; `tests/visual/sandbox.spec.ts` loops brands, and Atlas keeps its file names.
  - Proof: `.atlas-pull/dump-color.mjs` (gitignored) dumps 12 colour properties per element with transitions disabled, in light, dark, dark subtree and three warm modes. Atlas showed 0 differences, `main` CSS vs branch CSS.
  - Latest ids: **DEC-091, CAND-069, DISC-109**. The variable table holds 530 variables (checksum `3aa6ec5c`). Drift 0 / 2 / 9.
- **M5.5 shadow is merged (#117, `df92e22`, 2026-10-24; PR-0 and PR-1 squashed).**
  - Figma: `shadow/color-1..5` in `Atlas/Semantic` (`VariableID:1111:2-6`, scope `EFFECT_COLOR`, no WEB syntax). Effect styles: `shadow/sm|md|lg|xl` (pre-existing, updated in place, now 0 direct consumers), `shadow/raised|surface|popover|floating|modal` and `card/elevated-shadow(-hover)`. Every component shadow sits on a role style except Card elevated focus-visible (`109:120|135|150`), which keeps its focus ring plus copies of the card layers.
  - Code: `--atlas-shadow-<role>` on `:root, [data-theme="dark"], .dark`; token-lint `semantic-shadow` with no allowlist entries; `tableCoverage` returns `styleCoverage` (lowercase style name, `/` → `-`).
  - Latest ids: **DEC-090, CAND-069, DISC-108**. The variable table holds 518 variables (checksum `5d2ff410`) and 11 effect styles. Drift 0 / 2 / 9.
- **M5.4 motion is merged (#115, `cc49be1`, 2026-10-24).** All 15 checks were green: Visual Regression showed no baseline change, and Metric manifest passed because the region was refreshed before pushing.
  - Figma: `motion-<role>-duration|easing` in `Atlas/Semantic` (`VariableID:1106:2-13`).
  - JS: `MotionTokens.roles`; `ROLE_VARS` spells out the CSS names, because `atlas-verify` flags template-built `--atlas-motion-${x}` names as undefined tokens.
  - token-lint `semantic-motion`. The allowlist holds radius 36 + spacing 106 + type 35 + motion 17 entries.
  - Latest ids: **DEC-089, CAND-069, DISC-108**. The variable table holds 513 variables (checksum `c1047803`).
- **M5.3 type is merged (#113, `aa83736`, 2026-10-24), with its baseline PR #114.**
  - #114's 26 images were the 4 listed changes plus a sub-pixel cascade below Switch.
  - Figma: `type-<role>-size` lives in `Atlas/Responsive Type`; `-weight|-line-height` and `type-overline-letter-spacing` live in `Atlas/Semantic` (`VariableID:1099:2-26`).
  - Styles `Type/Heading|Title|Body|Body-sm|Label|Caption|Overline|Stat` bind size and weight, with line-height and letter-spacing as static percents.
  - token-lint `semantic-type` reads `font-size` only. The allowlist holds 36 radius + 106 spacing + 35 type entries.
  - Latest ids: **DEC-088, CAND-068, DISC-108**. The variable table holds 501 variables (checksum `3fc6c393`).
  - **Figma gaps to record at the next sync:** Switch has no text layers, and Select's label and content are not drawn.
- **M5.2 spacing is merged (#112, `10a5cf4`, 2026-10-24).** It merged with "Metric manifest" red because of the stale variable count, and `f9b4e47` on the M5.3 branch fixes that.
  - Figma `Atlas/Semantic` `spacing-focus-offset|item-gap|text-gap|overlay-offset|control-gap|item-padding|section-gap|surface-padding|surface-padding-lg` (`VariableID:1094:2-10`, `GAP` scope) alias `spacing/0_5|1|1|1|2|2|3|4|6`. CSS `--atlas-spacing-<role>`.
  - token-lint `semantic-spacing` reads spacing properties only. Dimensions are out of scope (DEC-087).
  - The allowlist now holds 36 radius entries plus 106 spacing entries (188 uses).
  - Latest ids: **DEC-087, CAND-065, DISC-108**. The variable table holds 476 variables (checksum `11077350`).
- **M5.1 radius is merged (#110, `c44fe16`, 2026-10-23).** Figma `Atlas/Semantic` `radius-item|control|surface|pill` (`VariableID:1088:2-5`) alias `radius/sm|md|lg|full`. CSS `--atlas-radius-item|control|surface|pill`. token-lint `semantic-radius` and `packages/governance/token-primitives.allow.json` (36 entries, 70 uses). CI was green with both owner labels; Visual Regression showed no baseline change. Latest ids **DEC-086, CAND-060, DISC-108**.
- **`main` has Phase 1 (#98), M1 (#99), D1 (#100) and M2 (#101).** The post-merge check passed on
  `dd039b1`: `node scripts/atlas-verify.mjs --only design.schemas` → `PASS schemas (58/58 files valid ·
  5 schemas)`, and the roadmap kept both the M2 and D1 sections.
- **Phase 2d is on this branch** (token rules, derived native tokens; details under "Phase 2d is done").
- **M3 session 4 is merged (#105).**
  Three-way `design/figma-registry-code`; `design/registry-events|fallback|states` (shared with
  metrics-report's `registry` source); Button, TextField, Alert, Form and new Field entries
  `registryComplete: true` (DEC-080); contracts generated for every export straight into
  `packages/governance/contracts/`, the 44 hand ones deleted after a 524/524 audit; authored
  `packages/registry/contract-props.json`. `registry:check` → 5 entries, 47 facts, 47 contracts,
  5 schemas, 144 rules. Details: M3 plan, "Session 4".
- **M3 session 3 is merged (#104).** Protocol schemas per
  entry, `componentMap.ts`, `no-new-components` covers registry entries; `registry:check` → 4 entries,
  47 facts, 47 contracts, 4 schemas, 115 rules.
- **M3 session 2 is merged (#103)**, with the progress-table commit. Facts and generated contracts for all 47; `registry:check` → 4 entries, 47 facts, 47
  contracts, 115 rules. Audit result and the 10-component sub-part gap are in the M3 plan, "Session 2".
- **M3 session 1 is merged (#102, `3993837`).** It adds `packages/registry/{aliases.json,src/,generated/}`, `registry.schema.json`,
  `scripts/lib/registry.mjs`, `scripts/registry-build.mjs`, `npm run registry:build|registry:check`
  and the CI step "Registry invariant". `registry:check` → PASS, 4 entries, 3 facts, 115 rules.
- **D1 is decided: option B (DEC-081), built on this branch.** `atlas/tokens.json` `figmaTable` holds
  the whole Figma variable table (463 variables, 5 collections, synced 2026-10-23) against all 432
  CSS tokens: 0 name drift, 2 missing in code (DISC-106), 15 missing in Figma (DISC-107), 53
  unpublished colour ramps, 9 mode expansions. `figmaBound` (option C) stays as a cross-check. Refresh
  recipe: "Variable table" in `.agents/skills/atlas-figma-sync/references/pull-file.md`.
- 47 web components (35 spec-complete, 12 scaffolded), 17 native (**ports paused by the user**),
  15 patterns. Latest ids: see the M5.4 bullet above. Snapshot pulled from Figma 2026-10-21.
- Benchmarks: waves 1–3 complete (T1–T19), written up in `docs/HARNESS.md` §6–§7. M1 and M2 changed
  `scripts/` and the atlas-verify skill, so `benchmarks/phase-9/pins.json` no longer matches; re-pin
  before the next benchmark run.

## What M1 and M2 left you (the M3 starting point)
- **Every JSON input is schema-validated before any check reads it.** `packages/governance/schemas/`
  (draft 2020-12, plain data so M4 can ship them to a browser) · `scripts/lib/schemas.mjs` (`INPUTS`,
  `validate`, `loadInputs`) · `design/schemas`, the first check. Coverage is a ratchet: a `*.json` under
  `atlas/`, `packages/governance/` or `packages/registry/` with no `INPUTS` rule FAILS. **M3's registry
  files need a schema and an `INPUTS` rule from their first commit.**
- **Every check reports `inspected`/`scope`, enforced in `check()`**: no count → FAIL;
  `scope > 0 && inspected === 0` → FAIL. A new check gets this for free and cannot opt out.
- `scripts/lib/compare-axes.mjs` exports `compareAxes`, `codeConnectEnums`. Two-way, with a
  `registry: null` slot that **M3** fills; do not call it three-way before then. It now trusts its
  input shape: callers pass only schema-valid metadata.
- `jsxTags(src, local, file)` / `literalProp(tag, prop)` / `UNKNOWN` in `scripts/lib/quality-checks.mjs`,
  on the TypeScript parser. A tag has `props`, `spreads`, `value(name)`, `has(name)`.
- `packages/registry/figma-axis-map.json` — **authored, never generated**, now schema-checked.
- `--max-figma-age <days>` (CI passes **90**) and `--only <ids>` on `atlas-verify`.
- All 15 checks have a PASS and a FAIL fixture test (`scripts/tests/atlas-verify.test.mjs`).

## M3 is done — what it left you (roadmap §2c; plan `docs/superpowers/plans/2026-10-23-m3-registry.md`)
- **Registry:** `packages/registry/src/<Type>.registry.json` (authored; 5 complete), `aliases.json`,
  `contract-props.json` (authored: absent / kept props for contracts), `figma-axis-map.json`; generated
  `generated/<Name>.facts.json` (now with `exact` per prop, `codeConnect.figmaContent` and a `module`
  section), `generated/elements.json`, `generated/schemas/`, `generated/componentMap.ts`.
- **Contracts are generated, never hand-written**, into `packages/governance/contracts/<Name>.contract.ts`;
  any other `.ts` there fails `registry:check`. Change props → `npm run registry:build` → commit.
- **Checks:** `design/figma-registry-code` (three-way, fails on the registry side for registry
  disagreements), `design/registry-events|fallback|states` (one function in
  `scripts/lib/registry-metrics.mjs`, also read by `metrics-report`'s committed-state `registry` source).
- **Gotcha:** a registry slot needs a Figma counterpart in Code Connect (`figmaContent`); an undrawn
  ReactNode prop goes to `hiddenProps` with a reason, or gets drawn in Figma first.

## Phase 2d is done — what it left you (roadmap §2d; plan `docs/superpowers/plans/2026-10-23-phase-2d-tokens.md`)
- **Four token-lint rules** in `scripts/lib/token-rules.mjs` (pure, `scripts/tests/token-rules.test.mjs`):
  `no-private-var-escape`, `no-raw-length`, `breakpoint-literal-consistency`, `reduced-motion-required`.
  `token-lint --json` prints violations plus per-rule `inspected` counts.
- **A `--_` private var that is not one semantic alias** needs an entry with a reason in
  `packages/governance/private-vars.allow.json` (schema `governance.schema.json#/$defs/privateVarsAllow`).
  Entries match by value, so editing an allowed value fails until the entry is updated; a stale entry fails.
- **Checks:** `code.raw-design-values` and `code.reduced-motion-required` (atlas-verify, one token-lint
  run); metrics-report's committed-state `token-lint` source uses the same `METRIC_RULES`.
- **Native tokens are fully derived** from `atlas.tokens.css`: change a token, run
  `npm run tokens:build`, commit the native file, or CI's Tokens Build fails. A value in a new unit
  throws instead of being written.
- **M4 is done on `claude/m4-runtime-slice`** (plan `docs/superpowers/plans/2026-10-23-m4-runtime-slice.md`;
  roadmap §M4 "As built"). Session 4 added the stub agent, `app/runtime-demo`, `tests/runtime/runtime-demo.spec.ts`
  (six metrics plus page-level axe, on one Playwright server with two projects), the `runtime` CI job, both
  Playwright projects in the visual job, the nightly random-seed fuzz workflow, the `atlas-runtime` skill, CAND-056
  (the Form gap) and dropped `ui-web`'s false `main`. All 12 M4 rows are measured: 11 pass, size fails (0.308,
  report-only). Measured p95 (production build): ack 0.4 ms, fallback 0.5 ms. The committed metrics region stays the
  no-results state (see the gotcha below); the M4 readings are in the roadmap prose. **Next is Phase 4.** Earlier: Done: `TextField.name` required
  (DEC-083); `registry-build` writes `generated/runtimeRegistry.ts`, which `packages/registry/lib` wraps as
  `registry`, `resolve`, `filter` and `without`; `packages/runtime` has the protocol types, the
  `protocol.schema.json` envelope, the request-access fixture (an `INPUTS` rule, `packages/runtime` watched),
  `findMarkup`, `validateTree` and `fallbackFor`. Session 3 added `store.ts` (sequenced reducer, structural-sharing
  patches), `Runtime.tsx` (`<AtlasRuntime>`, per-node boundaries, the Field handoff, DEC-084) and the seeded fuzz.
  Five vitest M4 rows read passing (three `runtime/validator`, two `runtime/fuzz`) and `runtime/protocol` reads
  failing (report-only); the six Playwright rows wait on Task 11.
- **The size metric is report-only and reads failing (DEC-085).** The render op is 513 B against 1663 B of
  rendered markup: ratio **0.308**, over the 0.30 gate (521 B of the markup is the runtime's own `data-atlas-*`
  tagging; against component markup alone it is about 0.45). `packages/runtime/tests/size.metric.tsx` runs from
  `vitest.metrics.config.ts` (`npm run test:metrics`) in CI's metrics job with `continue-on-error`, and
  `metrics-report` reads its `.metrics/vitest-metrics.json`. A more compact protocol is a separate, later decision.

## Phase 4 session 1 is done — what it left you (roadmap §Phase 4; plan `docs/superpowers/plans/2026-10-23-phase-4-enforcement.md`)
- **Four new atlas-verify checks, each with PASS and FAIL fixture tests**: `design/deprecation-expiry`
  (removeIn shipped or malformed fails), `code/contrast` (the manifest row's check id), `scope/registry-complete`
  (authored-entry count may only increase), `scope/breaking-change` (token/variant/size/component removals need a
  `### Breaking` CHANGELOG addition in the same diff). All static, all local; CI runs them through the existing
  atlas-verify job with no workflow change.
- **`code.contrast` measures 25 token pairs in both themes** (5 scale, 11 component, 9 surface; Checkbox/Radio
  glyphs pair with their CHECKED fills) and found 14 sub-4.5:1 pairs → five root values, all logged as **DISC-108**
  and seeded in `packages/governance/contrast-allow.json` (schema `contrastAllow`, an `INPUTS` rule, WATCHED).
  The check PASSES today: the allow entries carry each finding's measured `ratio`, and fail when a pair recovers
  (stale) or drops >0.15 below its allowance (new violation). Fixing a value Figma-first deletes the entry.
- **A glyph pairing rule was discovered, not invented**: `checkbox-foreground`/`radio-foreground` render only on the
  checked fill; pairing them with the unchecked box measures 1.00:1 nonsense. `derivePairs` prefers
  `-checked-background`; the unit test pins it.
- The metric row stays `not measurable` until session 2's CI collection (the committed region is still the
  deterministic no-results state; `metrics:check` unchanged).
- **Sessions 2–3 also done, on the same branch:**
  - **CI metrics collection is live and blocking.** The metrics job collects atlas-verify/vitest/test:metrics/Playwright
    JSON into `.metrics/` in-job (collection steps continue-on-error: a red check is a reading), writes `atlas-report.json`,
    uploads the `metrics` artifact, comments the totals on the PR, and `metrics:check` BLOCKS on a stale region. Refresh
    protocol: download the `metrics` artifact, drop the files into `.metrics/`, `npm run metrics:report`, commit. Locally
    (no result sources) `--check` tolerates a result-derived region and says so — CI verifies it strictly.
  - **`Native freeze` job:** any diff under `packages/ui-native/**` fails without the `atlas-native-thaw` label
    (merged-PR lookup on pushes, the atlas-approved-new mechanism).
  - **Manifest +32nd→36 rows:** the registryComplete ratchet ("Registered types removed between releases" →
    `scope.registry-complete`) and the D1 coverage fraction rendered on all three token-drift rows.
  - **Overflow check** (`visual > no horizontal scroll at each breakpoint`, tests/runtime/overflow.spec.ts): sandbox +
    runtime-demo at sm–2xl, all clean. **Known gap (not a library regression): the sandbox overflows 86px at 375px**
    (Tooltip demo 437px wide; Tabs row, NavBar search, Bar Chart stats also overshoot) — below-sm is not a supported
    breakpoint; fix the sandbox demo layout if phone-width demos matter.
  - **runtime-demo visual sections** (tests/visual/runtime-demo.spec.ts, light+dark; linux baselines via the
    Visual baseline workflow) and **@theme inline reduced to the five breakpoint mirrors** (R4 closed for M5: ~90
    build-time-flattened mirrors deleted; nothing consumed them).
  - **componentOwners populated** for all 47 (one handle); `atlas-sync` now carries `owner` into every metadata file
    (the atlas-sync test asserts it).

## Open owner decisions (ask; do not decide these yourself)
- **M5.5 shadow in Figma (ask first in session 22).** Shadows are not in Figma (DISC-107). Choose between Figma effect styles bound to variables, variables only, or a recorded code-only allowance. The roles come after that.
- **Nine candidate roles from M5.2–M5.4** (leave each primitive for good, or add it as its own stage; the four radius ones follow):
  - spacing: CAND-061 control padding scale, 062 stack gap at 8, 063 selection-control label gap, 064 compact-control gap, 065 page/bar inline padding
  - type: CAND-066 control text scale, 067 inline title, 068 nav label
  - motion: CAND-069 mark draw-in
- **Sandbox screenshot cascade.** One section's fractional height change re-shoots every section below it, which turned M5.3's 4 expected images into 26. A follow-up session is proposed (card "Isolate sandbox visual shots from sub-pixel drift"); the owner starts it or not.
- **Repo setting "Allow GitHub Actions to create and approve pull requests"** is off, so `visual-baseline.yml` pushes its branch but cannot open its PR. Turn it on, or keep opening the PR by hand.
- **Figma gaps found by M5.3:** Switch has no text layers, and Select's label and content are not drawn. Draw them, then record them as DISCs at the next `--pull` sync.
- **Four candidate radius roles (CAND-057 to CAND-060, M5.1).** 37 radius uses match a role's value but not its meaning, so they stay primitive: overlay or inline surface at md, compact control or mark at sm, focus-ring corner at sm, and large control at lg. Add any of them (value-identical, Kind A), or leave them primitive for good.
- **Text (the 6th M3 exit type): built (#125) and registered (#128, DEC-096).** The M3 exit reads 6/6.
  Its v1 tones are default and muted only: subtle, danger, success and info miss 4.5:1 on some surfaces and wait for the colour tokens
  (DISC-108, CAND-071); CAND-070 logs the missing page-title role.
- **Which of the five named states (loading, empty, error, active, disabled) apply to which
  component** — not decided. `design/registry-states` checks declared ⇔ drawn only, and the manifest
  `why` says so; requiring the five needs a per-component applicability decision.
- **More registry entries.** 5/48 components are registered, so the passing registry rows cover a
  small subset (each row prints it). Every new entry needs the same owner fields (fallback, nesting,
  a11y, responsive, capabilities).
- **Token drift found by D1-B (DISC-106, DISC-107).** Two Figma Card hover variables have no code
  token (add them to code, or remove them from Figma). 15 code tokens have no Figma variable: shadows
  (effect styles in Figma, not variables) and safe-area insets (`env()`) may be declared code-only, but
  that allowance is a new design-system rule and is the owner's; the 4 dialog widths and `neutral-50`
  look like Figma gaps. Until decided, "missing code tokens" and "missing Figma tokens" read failing.
- **Contrast findings (DISC-108, found by Phase 4's `code.contrast`).** Five root values measure under
  WCAG AA 4.5:1: `success-foreground` light (4.42), `info-foreground` (3.98 light / 2.98 dark),
  `primary-foreground` dark (3.71, inherited by Button primary and Checkbox/Radio checked fills),
  `danger-foreground` dark (3.90, inherited by Button destructive and the invalid-checked fills) and
  `foreground-subtle` dark (4.16/3.74/3.07 on background/surface/surface-raised). Fix each Figma-first
  (then delete its `contrast-allow.json` entry — a recovered pair fails as stale), or record a
  pairing/AA-large decision in the entry's reason.
- **DISC-095** (Button `link` ignores size in code, Figma draws it), **DISC-096/097** (Card header
  slots and footer `justify` are code features Figma does not draw).
- **7 of the 11 open DISCs are one class** — DISC-027, 098–104, "Figma description is a spec summary,
  not usage guidance." One batched Figma pass clears them, and those descriptions generate
  `atlas/<Name>.md` usage guidance, so it directly helps M3.
- 12 scaffolded components each need a binary call at M5: finish, or mark `status: "scaffold"` and
  **exclude from the registry** (excluded = the agent can never emit it, the correct safe default).
  **`Checkbox` has no test file at all** and cannot enter the registry until it does.

## Commands
```bash
npm ci
npm run test:scripts        # 336 tests: comparator, ci-workflow, convert-tokens, metrics-report, registry, registry-metrics, schemas, sync, token-coverage, token-rules, verify
npm run registry:check      # facts, contracts, schemas current + authored registry ⊆ generated facts (M3)
npm test                    # 1479 vitest (blocking; *.metric.tsx excluded)
npm run test:metrics        # report-only metrics (exit 1 while the size metric reads failing, DEC-085)
npm run test:runtime        # Playwright runtime-demo project (PW_CHROMIUM may point at an installed Chromium)
npm run token-lint
npx tsc --noEmit
npm run metrics:check       # the committed metric region matches a fresh run
npm run atlas:verify -- --scope "<globs>" --max-figma-age 90
```
House verification order, every time:
**token build → token-lint → typecheck → vitest → ESLint → `atlas:verify` → visual regression.**


## Batch-2 pattern Figma frames (drawn 2026-10-16, live in Figma, not in git)
The Detail view, Chat, Notifications center and Payment and billing docs were first merged without Figma frames (#82), then drawn and the docs corrected to match (#83). Members and permissions was drawn first (#84). Pages in the Atlas file, each a clone of the Settings pattern layout built from existing instances only: `Pattern / Detail view` `1026:2` (frame `1026:3`), `Pattern / Chat` `1030:2` (`1030:3`), `Pattern / Notifications center` `1031:118`, `Pattern / Payment and billing` `1032:338`, `Pattern / Members and permissions` `1035:2` (`1035:3`).
- **Rule going forward: patterns are Figma-first too** (the user corrected an earlier assumption that they were docs-only). Draw the frames, then write the doc from them.
- **The Figma recipe and its component gotchas now live in the `atlas-pattern` skill** (`.agents/skills/atlas-pattern/references/figma-frames.md`); read it there, not here.
- **Gap seen, not logged as a candidate:** Dialog has no body slot, so the Update payment method (Billing) and Invite member (Members) frames are detached Dialogs with Field instances (same gap as Sheet, CAND-049).
- **Not drawn or done:** the example `.tsx` files are unrendered in a browser; Notifications day grouping, Undo and focus-next, the Detail view error-with-Retry state, a Members empty state and the Billing Download column have no Figma frame. The docs mark these "not drawn" where they mention them.

## Native components (17 on `main`; ports PAUSED by the user)
All three: no new dependency, one `Animated.Value`, `useReducedMotion`, native driver, no tests (`ui-native` has no test setup), **none run on a device**. Figma is live (not in git), page `Atlas/Mobile-Native` (`1:2`).
- **Stepper (CAND-053, DEC-075, #73):** ring only; the arc is two clipped half-circle Views. Props `steps: { label }[]`, `current` (1-based, clamped), `accessibilityLabel`; one `progressbar` with an `accessibilityValue`. Figma set `1012:296`, frames `1013:191` (Light) and `1013:218` (Dark). The donut ring's inner radius is a fraction of the radius (0.833 for a 4 px band), not of the diameter.
- **Spinner (CAND-013, DEC-076, #79):** variant `default | custom` x size `xs | sm | md | lg`, `label`. The arc reuses the Stepper technique (288 degree sweep, dots at both ends for round caps, clips overlap by `StyleSheet.hairlineWidth`); `custom` is eight rounded tick Views. Stroke drawn = `iconStroke x size / 24`. One turn per `duration.spin`, `Easing.linear`; still under Reduce Motion. Figma set `1020:237` (a copy of the web set `527:63`), frames `1020:15627` and `1020:15710`. No colour prop yet.
- **Skeleton (CAND-015, DEC-077, #80):** `shape` `rect | circle`, `style` overrides; rect full width x `spacing[4]`, circle `spacing[10]`; fill `backgroundMuted`; opacity 1 to `opacity.pulse` to 1 over `duration.pulse`, `easing.standard` per half; hidden from assistive tech. Figma set `1022:385` (a copy of web `531:5`), frames `1022:388` and `1022:404` (y 11550, so the next free y on the page is about 11800).
- **OtpInput (CAND-052, DEC-078, #86):** one hidden `TextInput` (number pad, `oneTimeCode`, `sms-otp`) over aria-hidden slot Views; length 4 to 8, `size` sm | md | lg (slots 36 / 44 / 52, flex up to the cap), props like native Input (`state` default | error | disabled, `label`, `helperText`, `errorText`, `value`, `onChangeText`, `onComplete`). Figma `Atlas/Mobile-Native`: OTP Slot `1037:391`, OTP Input `1037:452`, frames `1037:17923` (Light) and `1037:17999` (Dark). `ui-native` `tsc` 0 errors, `atlas:verify` 13 pass; **not run on a device** and the Gate 3 visual check is owed.
- **Progress (CAND-017, DEC-079, #88):** props `value`, `max`, `indeterminate`, `label`, `valueLabel`, `helperText` (strings), `accessibilityLabel`, `accessibilityValueText`. Fill width animates with `duration.base` (not native-driven); the indeterminate segment (40 percent of the track) slides with `duration.pulse`, linear, looping; both stop under Reduce Motion (segment rests at 30 percent). `progressbar` role with `accessibilityValue` (omitted when indeterminate). Figma `Atlas/Mobile-Native`: Progress `1038:867`, .Progress / Bar `1038:842`, frames `1038:964` (Light) and `1038:1008` (Dark); the bar-only example shows a gap because hidden rows keep the instance height. `ui-native` `tsc` 0 errors, `atlas:verify` 13 pass; **not run on a device**.
- **Native tokens (`packages/ui-native/tokens/atlas.tokens.ts`, generated):** the non-colour tokens are hardcoded in the template inside `scripts/convert-tokens.mjs`, not parsed from the CSS. To expose a CSS token natively, add it to that template and to the default-export object, run `node scripts/convert-tokens.mjs` and commit both files (the CI "Tokens Build" job diffs the output). Exposed so far: `duration.spin` and `.pulse`, `easing.standard`, `opacity.pulse`, `iconSize`, `iconStroke`, `textRole`, `letterSpacing` (CSS em x 16, in points). Component code uses named imports.
- **Checks:** `cd packages/ui-native && npx tsc --noEmit` (run `npm ci` there once) and the CI job `Typecheck (native)`; the root `tsc` excludes `packages/ui-native`.

## Done in earlier sessions (PRs #56 to #84; details are in git history and `atlas/state/decisions.json`)
Search and filter frames (#57); disabled opacity bound (#58); StatCard icon, clickable and sparkline variants (#59, #60, #66); Sparkline primitive (#61); Card hover shadow, closes DISC-093 (#63); Sheet and Drawer Content and Footer slots (#64, #65); OtpInput and Stepper components, Auth and Onboarding patterns using them (#68); CommandMenu (#69); Button `asChild` and Link as a composition (#70); Stepper viewport variant and mobile ring, Navigation shell pattern, `verifiedAt` stamps (#71); native Stepper, tokens, types, CI native typecheck, letterSpacing, Spinner, Skeleton (#73 to #80); batch-2 patterns (#82, #83, #84).

## Do next (the user decides)
0. **M5.5 shadow** (roadmap order), or first the candidate-role decisions. See "Start here". Everything below is pre-roadmap work the user has not scheduled; none of it blocks M5.
1. **The user's Gate 3 visual check** of the native Stepper, Spinner and Skeleton against their Figma frames (nothing has been run on a device or simulator), then check CI on `main`.
2. **Next native port** (all logged, none built; each needs plan, Figma on `Atlas/Mobile-Native`, then code): suggested **Progress (CAND-017)**, whose indeterminate slide reuses `duration.pulse` and linear easing, or **Avatar (CAND-005)**. The rest: CAND-007, 009, 010, 016, 018, 019, 028, 029, 052, 054. **Button loading (CAND-014)** needs a colour prop on Spinner and a Figma design of the loading state.
3. **Other candidates:** DataTable (CAND-024, needs its own Figma design), Button loading with a Spinner (CAND-014, needs a Figma design of the loading state), Load more and infinite scroll (CAND-048, deferred), AppShell (CAND-055, composed locally; not a component until designed and requested).
4. **Pattern follow-ups (optional):** render the batch-2 examples in a browser; draw the missing frames listed above; log the Dialog body-slot gap as a candidate if the user wants it recorded; a header bell menu is not covered (the library has no popover). Pattern recipe if another is wanted: Figma frames first, then copy the section layout of a sibling in `packages/governance/patterns/` (required sections are `REQUIRED_SECTIONS` in `scripts/atlas-sync.mjs`), name only real components under "Components and variants" (sub-parts such as `BubbleGroup` are not components and fail validation), run `npm run atlas:sync`, `npx tsc --noEmit` (the example is compiled) and `npm run atlas:verify -- --scope "packages/governance/**,atlas/patterns/**,atlas/index.md"`, and add the slug to the README pattern list.
5. **Known gaps (none blocks anything):**
   - The Stepper ring labels in Figma are plain text layers per variant, so a new instance shows Account, Profile, Team, Review, Launch and swapping `Current` on an instance resets the two label overrides. Code derives them from `steps`. The `Show label` boolean on Step is no longer used on mobile.
   - The ring CSS was rendered in Chromium with stand-in token values, not in the running app. CommandMenu hiding a group heading when all its items are filtered out, and a `Button asChild` link with a loading spinner, have not been seen in a browser.
   - Figma Dialog and Command Menu are 500 and 600 wide, code Dialog uses `dialog-md` 560 and `dialog-lg` 720 (an old Dialog gap, noted in DEC-072).
   - `search-filter.example.tsx` does not implement recent searches or the filter Sheet; a clickable StatCard's value and delta are not in its accessible name; the StatCard sparkline art in Figma is one fixed rising path for every tone; no Dark screenshot was taken for the Sparkline, CommandMenu, Stepper ring or Auth OTP frames.
   - The Auth page (`836:2`) has a stray password input at its top-left corner (0, 0), from earlier work. Left alone.
   - The 18 components stamped on 2026-10-15 were compared with live Figma variant properties on 2026-10-19: 0 differences from the snapshot (Stepper's `Viewport` is intentionally not a code prop or Code Connect mapping). Not compared: booleans, text and instance-swap properties, visuals, tokens.

## Gotchas learned (they will bite again)
- **Audit Figma before trusting a handoff claim about it (M5.5).** The handoff said shadows were "not in Figma at all"; the read-only audit found four `shadow/*` effect styles with 70 consumers plus seven groups of hand-drawn shadows that differed from code. Run the audit first and stop on any mismatch (Figma wins until the owner decides).
- **An effect style replaces every effect on a node.** Applying a shadow style to a node that also carries a focus ring (a spread-only drop shadow) deletes the ring. Keep the ring and copy the style's bound layers instead, as Card elevated focus-visible does.
- **Moving a style's consumers:** `style.getStyleConsumersAsync()` lists direct nodes and `I…` ids nested in instances; rebind the direct ones only, nested ones follow their main component.
- **Sync, then rebuild the registry.** After a CSS migration, `atlas:sync` refreshes `atlas/metadata/*.json` `tokensUsed`, and then `registry:build` must refresh `packages/registry/generated/*.facts.json`, or the registry `--check` test fails.
- **`atlas-verify` `tokens` flags any `--atlas-<name>-` string that is not a declared token,** including template literals and doc comments in `.ts` (`--atlas-motion-${name}-duration`). Spell out the full names.
- **`visual-baseline.yml` cannot open its PR:** the repo setting "Allow GitHub Actions to create and approve pull requests" is off. The run still pushes `visual-baseline/<run id>`, so open the PR by hand with base = the stage branch. The owner decides on the setting.
- **A stage's own component tests may assert token names** (`Progress.test.tsx` lists the CSS variables it expects). Search `packages/ui-web/tests` for the old names before migrating.
- **Figma reads a bound line-height or letter-spacing FLOAT as pixels.** Line-height/normal (1.5) bound to a text style became 1.5px. Text styles bind `fontSize` and `fontWeight` only and carry line-height and letter-spacing as static percents (DEC-088). Probe with a temporary style before binding a new kind of variable.
- **Text inside nested instances is styled at its source component.** Chart Stat, Chart Legend Item, BreadcrumbItem, Dropdown Menu Item, Step, Radio Group Item and Password strength each own their text. Styling only the outer set's instance children leaves the source unstyled.
- **A Kind B dump only sees what the sandbox renders.** Closed overlays (Dialog, Toast, Tooltip, menus, Select) and blocks not on `/` never appear in the computed-style diff, so the visual stories are their only check. Say so in the PR.
- **The merged PR's Metric manifest can stay red** when a stage changes the variable count. Refresh the region on the next branch: `gh run download <run> -n metrics`, then `metrics-report --results`.
- **A fresh worktree has an empty `node_modules`.** Scripts then resolve the main checkout's older install (ajv 6, with no `ajv/dist/2020.js`), and `atlas-sync` throws ERR_MODULE_NOT_FOUND. Run `npm ci` in the worktree first (about 10 s).
- **`packages/tokens/atlas.tokens.json` and `atlas.figma.tokens.json` are hand-maintained.** `tokens:build` writes only the native file, so add new roles to both JSON files by hand. The DTCG file keys the half steps as `"0.5"` and `"1.5"`, not `0_5`.
- **Registry entries can name tokens** (`Alert.registry.json` `tokenRoles`). `registry:check` fails when a component stops using a named token, so a token migration must update them too.
- **Vitest only includes `packages/*/tests`.** A test under the root `tests/` is silently not found ("No test files found").
- **A computed-style dump needs its own Playwright script.** Run it from `.atlas-pull/` (gitignored) so `import "playwright"` resolves to the repo install, and take two "before" dumps to show it is deterministic before trusting a 0.
- **A CI re-run cannot see labels added after its trigger.** `gh run rerun` reuses the original event payload, so the label-gated jobs (Atlas Verify `--allow-new-*`, Native freeze) fail again. Adding the label fires a fresh `labeled` run, because ci.yml listens for `labeled`; use that run. Two labels make two runs, and either one is enough.
- **`sync_with_base_branch` may refuse** with "pinned Git origin" when `main` changes `.claude/launch.json`. The owner confirms the origin in the app (Help → Troubleshooting → Review Pinned Git Origins). If the worktree branch has no commits of its own, `git merge --ff-only origin/main` works instead.
- **The metric region goes stale whenever counts in its detail text change** (M5.1: 463→467 variables). Fix: `gh run download <run> -n metrics -D <scratch>`, then `node scripts/metrics-report.mjs --results <scratch>/metrics-input`, commit and push. Auto-fix does this when CI's Metric manifest fails.
- **A small variable-table refresh does not need the 460-entry copy.** Rebuild `.atlas-pull/variables.json` from the committed `atlas/tokens.json` `figmaTable.variables` plus the variables you just created, then recompute the FNV-1a checksum. If it equals the checksum the Figma read-only pull returned (M5.1: 467 variables, `8d191245`), the file is exact; if not, copy the pull.
- **Count token uses, not lines.** M5.1 planned 59 migrations and made 62, because some lines hold two uses (`border-radius: var(a) var(a) 0 0`). Allowlist counts are per use.
- **Plain `npm run atlas:sync` (no `--variables`) keeps `figmaTable`.** Run it after a component CSS change: `atlas/metadata` records each component's `tokensUsed`, so `design.snapshot-current` fails until it is regenerated. `npm run registry:build` is needed for the same reason (`generated/*.facts.json`).
- **Donut ring in Figma, inner radius is a fraction of the RADIUS, not the diameter.** For a 48 px ring with a 4 px band, `innerRadius = (24 - 4) / 24 = 0.833` (what the web ring uses). Using `44 / 48 = 0.917` gives a 2 px band: that happened on the native Stepper and was fixed on all 24 arcs.
- **Auto-layout glitch after `setExplicitVariableModeForCollection` on a frame:** one instance stayed at (0, 0) in a vertical auto-layout frame. `frame.appendChild(child)` on that child, then reading the geometry in a **later** call, fixed it; geometry read in the same call as an edit is stale.
- **Native components are checked differently:** native components are not in the sync snapshot and have no Code Connect, contract or test (`atlas-verify` only recognises `packages/ui-native/components/<Name>` for scope and new-component checks), so a native task's checks are tsc, `atlas:verify` and a manual or harness check.
- **Ring in Figma without a stroke arc:** an ellipse with `arcData.innerRadius` 0 strokes a pie wedge. Draw the ring as a filled donut sector instead: `arcData = { startingAngle: -PI/2, endingAngle: -PI/2 + 2*PI*fraction, innerRadius: (r - thickness) / r }`, a full-circle track under it, both absolutely positioned (`layoutPositioning = 'ABSOLUTE'`) in a centred auto-layout frame whose in-flow text sits on top.
- **Radix `Slot` and extra children:** `Slot` needs exactly one element child. A component that renders icons around `{children}` must wrap the child in `Slottable` (Button `asChild`, DEC-073).
- **Fragments change `container.firstElementChild`:** Stepper now returns a summary and the `<ol>`, so tests select `container.querySelector("ol")`.
- **Sync restamps every file unless `pulledAt` is the old stamp.** A pull file with a fresh `pulledAt` rewrote 110 files. Set `pulledAt` to the existing `syncedAt` (all metadata share one; it was `2026-10-10T17:05:52.269Z`) and the sync writes only what changed (3 files for CommandMenu), then 0 on the second run. A brand-new component needs its description in the pull file, or the sync refuses with "component doc is missing" even under `--check`.
- **Radix Dialog mounts its portal one pass late.** State that reads the rows by DOM (the CommandMenu highlighted row) must live in a component rendered *inside* `DialogContent`, not in the one that renders it, or its first layout effect sees no rows.
- **A new component needs `--allow-new-component`** on `atlas:verify`, and `atlas:verify` fails a `<div onClick>` without `role` and `tabIndex` (CommandMenu rows use `tabIndex={-1}` plus `onMouseDown` preventDefault so focus stays in the search field).
- **Promoting a candidate can break a sync test.** `scripts/tests/atlas-sync.test.mjs:182` uses an unbuilt candidate (it was `Stepper`) as its "component that does not exist". Run `npm run test:scripts` (or `node --test scripts/tests/*.test.mjs`) before pushing a promotion; `atlas:verify` and vitest do not cover it, only the CI step `Script tests` does.
- **The session can restart or run in parallel.** After a worker restart or a long gap, re-read `git log origin/<branch>` and the open PR list before assuming your last state; a commit or decision (DEC id) may exist that you do not remember. Pick the next DEC, CAND and DISC ids from `atlas/state/*.json` on the fetched branch, not from memory.
- **Slots on a component (Sheet pattern):** `component.createSlot()` makes a SLOT layer and a set-level SLOT property; `figma.createSlot` does not exist. Renaming the slot layer renames its property (`Slot#id` becomes `Content slot#id`). For the other variants, create the slot, then set `componentPropertyReferences = { visible, slotContentId }` to the first variant's keys: the property each `createSlot` made is left orphaned under its renamed key, so delete every SLOT property you do not keep (`set.deleteComponentProperty`). Naming the layer is enough to name the property: read the keys from `slot.componentPropertyReferences.slotContentId` (done for Sheet and again for Drawer, DEC-068). An instance keeps the component's fixed height; `resize` it to fit its slot content.
- **No property bindings inside a nested instance's slot.** `componentPropertyReferences` throws "instance sublayer" for a layer inside the Card slot of a Stat card. Use a **variant property** (Leading icon off|on, Interaction), not a boolean or instance swap. The icon is then swapped by hand on an instance.
- **Adding a variant property with a twin set (StatCard Sparkline, DEC-069):** rename the existing variants first (insert `Sparkline=off` before `Interaction=`), then clone the sources, change the children, `set.appendChild(clone)` and rename to `...Sparkline=on...`. Clones land below the set bounds and render blank in screenshots until `resizeWithoutConstraints` grows the set; lay them out in a grid, resize, move the Review frame down by the same delta, and check for overlaps. The set description is edited in Figma, then the same text is applied to the StatCard entry in `.atlas-pull/pull.json` before `atlas:sync`.
- **`atlas:verify --stamp` fails the scope check on unrelated dirty files** (it did for the handoff files). List them in `--scope` for the stamp run, then commit only the component's files with a pathspec.
- **Cloning variants:** `variant.clone()` lands on the page, not in the set. Change its children first, then `set.appendChild(clone)` and rename; a `findOne(SLOT)` right after moving into the set returned null, so reach the slot by path (`clone.children[0].children`). Renaming existing variants to add a property keeps existing instances on the original (off/static) variant.
- **Component set bounds do not grow** when variants are added: `resizeWithoutConstraints` to fit, then move neighbouring frames (the Review frame) down so they do not overlap.
- **Nested Card `State` swap** (`card.setProperties({ State })`) keeps the slot content.
- **`mcp__figma__get_screenshot` URLs are blocked by the sandbox proxy**: pass `enableBase64Response: true`. A node screenshot also clips effects outside the node (the focus ring).
- **Dark-mode `*-muted` tokens are slabs** (success-muted `#007033`, danger-muted `#ad0016`); use `*-subtle` for soft washes.
- **Sync recipe in a fresh session** (no `.atlas-pull/`): build `pull.json` from `atlas/metadata/*.json` (`nodeId` from `figmaNodeId`, `properties` from `figmaProperties`, `componentProperties` from `figmaComponentProperties`) plus the patched component's `description`, taken from the body of `atlas/<Name>.md` between `# <Name>` and `<!-- BEGIN:generated-structure -->` with the Figma edit applied. First run `--check` with the unchanged description: it must list only that component. Then run the real sync twice; the second must write 0 files. Add `Sparkline`-style new components the same way, plus the `status.json` row with `verifiedAt: null`.
- **New component PR:** `atlas:verify --allow-new-component`, final run adds `--stamp`. CI needs the `atlas-approved-new` label; `create_pull_request` cannot set labels, add it with `issue_write` (`method: update`, `labels`) right after opening. CI re-runs on `labeled`; the run from before the label fails `no-new-components`.
- **Code Connect parse:** an unsupported expression (a conditional such as `clickable ? () => {} : undefined`) makes the file print a `❌`. `main` has 8 such files and the job still exits 0, but do not add a ninth: map with `figma.enum` to the value instead (e.g. `onClick` from `Interaction`).
- **SVG props:** `React.SVGAttributes` already has a `values: string`, so a `values: number[]` prop needs `Omit<..., "values">`.
- **Hand-written discrepancies** (no `detectedBy`) in `atlas/state/discrepancies.json` survive sync; append a row by text edit, do not rewrite the file with `json.dump`. Same for `candidates.json` and `decisions.json`.
- **Slot-swapped icons in Button instances are wrong-sized** (24 px box, 16 px glyph off-centre, not overridable). Use a free-standing 16 px icon instance.
- **Auto layout:** `resize()` resets sizing to FIXED; set `primaryAxisSizingMode = 'AUTO'` after it. A hug frame reports stale sizes right after edits; read in a later call.
- **Description escaping:** reading `description` returns HTML entities; write plain text and read back to confirm single escaping. Never read it, edit it and write it straight back: that double-escapes (`&amp;#39;`). Decode first, then write plain text (it happened to the Stepper description and was fixed).
- **Tests:** `@testing-library/user-event` is not installed; use `fireEvent`. CI lint is `npx eslint packages/ui-web/src/ --ext .ts,.tsx --max-warnings=7`.
- **Commits:** end messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and the `Claude-Session` line; PR bodies end with the "Generated with Claude Code" line and the session link.

- **A new component folder fails Atlas Verify `no-new-components` until the PR carries the `atlas-approved-new` label** (`.github/workflows/ci.yml`). The label is the owner's gate: ask, and add it only when told ("add the label"). The `labeled` event starts a fresh CI run, so a PR shows two sets of checks: the first run's Atlas Verify stays red and is superseded by the second. Merge with the label on.
- **`atlas:verify` locally in the cloud container:** the root `tsc` and vitest fail on missing root dependencies (`next`, `lucide-react`, `vitest`; 20 `tsc` errors, none yours) and two `--stamp-components` script tests fail for the same reason; CI passes them. Run `npm run atlas:verify -- --scope "<globs>" --allow-new-component --skip tsc,tests` plus the native `tsc` above.
- **Figma native sets from web sets:** the fast, faithful way is `webSet.clone()`, `mobilePage.appendChild(clone)`, rename, position, write the description. Review frames: 384 wide vertical auto-layout, padding `spacing/8`, gap `spacing/6`, fill bound to `background` (`VariableID:3:3`), `setExplicitVariableModeForCollection("VariableCollectionId:3:2", "3:0")` for Light or `"3:1"` for Dark, font Nunito Sans, text bound to `foreground` or `foreground-muted`.
- **Browser mirror of React Native geometry:** Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (no playwright package). Render with `--headless=new --no-sandbox --force-device-scale-factor=3`: at 1x density fractional sizes (a 20 px Spinner ring is 16.46) show clip-snapping notches that a phone would not.
- **Editing `atlas/state/*.json`:** remove or insert the entry as text. A `json.dump` round trip reformats the whole file (it did for `candidates.json`: a 98-line diff, redone). New decision entries use 6-space keys inside a 4-space `{`.
- **The stop hook** ("uncommitted changes" or "unpushed commits") fires at the end of a turn. Commit to the feature branch and push it, with no PR; do not merge or open a PR without the user's yes. (This session also committed and pushed on a user "commit" instruction because the session brief says to commit and push to the designated branch; PRs and merges waited for the user's "open the PR" and "merge N".)

### From M4 session 2 (2026-10-23)
- **A worktree has no `node_modules` of its own**, so Node resolves the main checkout's, which can be on another
  branch with other versions (it had ajv 6, and `registry-build` needs ajv 8's `dist/2020`). Run
  `npm ci --legacy-peer-deps` in the worktree first.
- **A new watched input directory must also be copied by the verify tests' throwaway repo**
  (`INPUTS` in `scripts/tests/atlas-verify.test.mjs`), or the `min: 1` rule fails three `--stamp-components` and
  `design/schemas` tests.
- **The repo's ajv runs in strict mode**: a subschema with `properties` needs `"type": "object"`, even inside `allOf`.

### From M3 session 1 (2026-10-23)
- **A fresh worktree has no `node_modules`.** Run `npm ci` first; `atlas-verify` and `registry-build`
  import `ajv` and `typescript` and die with `ERR_MODULE_NOT_FOUND` otherwise.
- **`getNonNullableType` expands `React.ReactNode` into its nine members.** Own props keep their
  declared annotation text (`React.ReactNode`, `ButtonVariant`); only inherited and event types use
  `typeToString` (with `NoTruncation`, or long types end in `...`).
- **`Omit<>` props have no `parent` symbol** (`symbolToString(p.parent)` crashes). The declaring
  interface comes from the declaration node instead (`declaringName` in `scripts/lib/registry.mjs`).
- **The generated metric region sits in the wrong place in the roadmap.** `metrics-report` upserted it
  at the first `<!-- BEGIN:generated-metrics -->`, which is the marker quoted inside the prose blockquote
  at "Metric status", so the generated tables live inside that blockquote's backticks and the hand-written
  seed table further down is still there. `metrics:check` passes because it compares the region only.
  Not fixed here (Phase 1 scope); needs a tolerant marker match or the quoted marker removed.

### From M2 (2026-10-22)
- **Auto-fix wakes the session on every Vercel bot deployment comment.** On this machine, comment wake-ups and Auto-fix are one switch, so they cannot be split. The notice needs no action; say so in one line and move on.
- **`a11y`'s `role=` and `outline` rules are line regexes over the whole file**, so a doc comment counts. Three findings repo-wide fail today (NavBar.tsx:356, RadioGroup.tsx:14 and :102; at least RadioGroup:14 is a comment). They are invisible in CI because only changed files are checked, and they will surface the next time someone edits those files.
- **Script-test fixtures need `node_modules` now.** `atlas-verify` imports `ajv` and `typescript`, and `atlas-sync` imports `ajv`; both fixture helpers symlink the repo's `node_modules` and `atlas-sync`'s also copies `packages/governance/schemas`. A new fixture helper must do the same, or every test fails with `ERR_MODULE_NOT_FOUND`.
- **`process.exit()` after a large `console.log` truncates piped output** (it cut `--json` at 64 KB). Set `process.exitCode` instead.
- **ajv strict mode rejects `pattern` without `"type": "string"` and `required` in a `then` without a matching `properties` entry.** Those are schema bugs and throw out of `validate()`, deliberately not reported against the input.
- **Write schemas from the data, then tighten.** The first pass got `occurrences >= 1` wrong (two candidates have 0) and a required `_note` that the deprecation tests do not write. `loadInputs(REPO)` over the committed tree is the quick check.

### From the roadmap sessions (Phase 1 and M1, 2026-10-22)
- **`atlas-verify`'s own test fixtures copy a hardcoded `INPUTS` list** (`scripts/tests/atlas-verify.test.mjs`). A new *authored* directory that a check needs must be added there, or the fixture repo lacks it and your fail-closed check fails every fixture test. This broke the two `--stamp` tests until `packages/registry` was added to the list.
- **Two branches appending a job to the end of `ci.yml` merge cleanly into a DUPLICATE job key.** Git reports no conflict and nothing here validates YAML, so it ships silently. `scripts/tests/ci-workflow.test.mjs` now guards it — but read the post-merge `ci.yml` diff anyway.
- **After a squash-merge, a branch cut from the pre-merge commit keeps that commit.** `git log origin/main..HEAD` then shows it and the PR lists it, though it contributes **no diff**. Verify with `git diff origin/main..HEAD --stat` and say so in the PR body; do not try to rebase it away.
- **`sync_with_base_branch` conflicts in the docs both phases touch** (`ATLAS-DELIVERY-ROADMAP.md`, `HANDOFF-next-session.md`). The branch side is normally the superset, so resolve keeping **ours** — but diff the hunks first; strip only the conflict blocks so auto-merged regions survive.
- **`syncedAt` already IS the Figma pull time.** `atlas-sync` derives it from `pull.pulledAt` and `carriedForward()` reuses the snapshot's own value, so it never advances without a real `--pull`. **Do not add a `figmaPulledAt` field** — it would rewrite all 47 metadata files for nothing. The gate (`--max-figma-age`) was what was missing.
- **`ORDER` in `atlas-sync.mjs` is a display PRIORITY list, not an enumeration.** The v1 twelve lead `index.md` and everything else follows alphabetically (`indexOf` → `-1` → `99`). Adding a component does not require adding it there; "it only has 12 entries" is not a bug.
- **Only `Variant` and `Size` have value lists in metadata.** Every other axis is verified through Code Connect: its `figma.enum` **values** flow into the typechecked `example` closure, so `tsc` proves they are assignable to the real prop type. Figma → CC keys → props is the chain; that is why 130 axes are comparable, not ~70.
- **`figmaComponentProperties` is empty on all 47 components** — the last pull never captured boolean / instance-swap / text properties. So **Code Connect is the only artifact that names slots** (`figma.instance("Leading icon slot")`), which matters for M3's `slots`.
- **The component-token alias layer already IS `tokenRoles`** for 8 components (`--atlas-button-primary-background: var(--atlas-primary)`), already enforced by `token-lint`. M3 should map roles onto it, not invent a tier. It is also the brand seam for M5.
- **The same Figma axis can be mapped as an enum on one component and a boolean on another** (`Placeholder`: Select uses `figma.enum`, DatePicker uses `figma.boolean`). Both are correct. The axis map supports per-component overrides for exactly this.
- **`metrics-report`'s committed region is the deterministic no-results state** so it reproduces anywhere. Collecting results into `.metrics/` locally changes it, so do not commit a result-derived region until CI collects those files as artifacts (Phase 4). `npm run metrics:check` tells you.
- **Do not point a metric at a check that does not prove it.** Two mappings read `passing` off `token-lint` and the `a11y` heuristic before being corrected to *not measurable*; `code.token-lint` covers colour only, and spacing literals merely WARN. A green row on a weak check is worse than an honest `not measurable`.
- **Prefix-matching a check name needs a delimiter boundary.** `code.token-lint` otherwise matches `code.token-lint-v2`, so renaming a check keeps its metric green — the exact failure the report exists to catch. Its own test found this.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- Figma is the authority. Figma first, then docs through `atlas:sync`, then code. One component per task; four gates (Figma plan, Figma built, code checked, final approval), no restating. Scope and taste questions go in one `AskUserQuestion` before Gate 1. A finding that changes an approved choice goes back to the user before building.
- No new components or tokens on your own initiative (a new component needs the user's explicit request); compose gaps locally and log them in `atlas/state/candidates.json`.
- Do not commit, push, open a PR or merge without the user's yes. "Proceed with Gate N" approves the step just shown; "commit this and open the PR" approves Gate 4; "merge N" is needed for each merge. A question or pushback is not approval. The stop hook asking for a commit is not approval either.
- Do not poll CI; the user asks "check CI". Auto-fix is off, so ask before pushing even a tiny CI fix.
- **Finish and merge before moving on:** the user wants every commit through a PR and merged to `main` before new work starts. When a branch carries commits from more than one piece of work (another turn can push to it), update the PR title and description to cover all of them before merging.
- "merge N" with checks still running: say so and merge as told (PRs #82 and #83 were merged this way; CI had not finished), then check CI on `main` when asked. If a check fails, stop and report. A PR for a new component shows one expected red run (before the `atlas-approved-new` label) that is not a blocker.
- Skip pleasantries; lead with the answer.
