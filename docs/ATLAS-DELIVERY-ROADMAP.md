# Atlas Delivery Roadmap

> **Companion to `docs/architecture/ATLAS-TARGET-ARCHITECTURE.md`**, which holds the stable north
> star. This document is the churning half: it translates that target into repository changes, tests,
> ownership and measurable milestones, and records honestly which metrics are passing, failing or not
> measurable. Expect it to change as phases land.
>
> Rules live in `AGENTS.md`; current project state lives in `claude.md`. This file carries neither.

## Context

`docs/architecture/ATLAS-TARGET-ARCHITECTURE.md` describes an Atlas materially different from the
one that exists.
Today Atlas is a **code-authoring** system: an agent reads the generated `atlas/` snapshot and writes
React that uses the library; CI checks the result. The north star is a **runtime** system: an agent
emits a semantic UI tree (`{"type":"Button","variant":"primary"}`), a registry decides what is legal,
a validator normalises and repairs it, a renderer owns presentation — and CSS, HTML and JSX become
*impossible* through the protocol.

Both halves are wanted. This roadmap builds the runtime for real (`packages/registry`,
`packages/runtime`) while the code-authoring harness keeps working, with the registry as the source of
truth shared by both.

The original framing assumed Figma data and contract enforcement were already reliable enough to build
on. They are not: what CI enforces today is largely **code against itself**, and the Figma token side
has never synced. So this roadmap inserts a **make the truth measurable** stage before any runtime
construction, and the runtime slice becomes the first production milestone *after* those foundations.

**Deliverables (Phase 1, done):** the spec is kept verbatim at
`docs/architecture/ATLAS-TARGET-ARCHITECTURE.md`, this roadmap is `docs/ATLAS-DELIVERY-ROADMAP.md`,
and both are referenced from `AGENTS.md` §2.

### Decisions taken

| Decision | Choice |
|---|---|
| End state | Full runtime, staged behind enforcement; code-authoring harness continues in parallel |
| Naming | Registry **aliases** north-star names (`TextField`→`Input`, `Modal`→`Dialog`). Nothing renamed in Figma or `ui-web`. Alias table is CI-checked |
| `Form` | **Composed** from `Field`+`Input`/`Button`/`Alert`, logged in `candidates.json`. In the registry it is a *structural* contract (submit, validation, error association), not a Figma component |

### Milestones, in order

| # | Milestone | Gate |
|---|---|---|
| **M1** | **Independent Figma→code comparison — two-way comparator, registry-ready** | First blocking milestone. Needs no registry. **Fails closed** on missing or malformed Figma data |
| **M2** | Verifier cannot silently pass (schemas, parser tests, inspection counts) | Prerequisite for M3 |
| **M3** | Registry exists; the comparator gains its **third leg** — Figma↔registry↔code | Contracts become real |
| **D1** | **Figma token-table access: decision gate** | Branches the token roadmap |
| **M4** | **Vertical slice — first production milestone** | Runtime proven end to end |
| **M5** | Semantic token tier, one family per reviewable stage | Unlocks brands |

---

## Phase 0 — Baseline (this section *is* step 1; done)

### Enforcement is already ~70% built — do not rebuild it

10 blocking CI jobs: typecheck (web + native), eslint with a suppressions ratchet, `tokens-build`
output-diff, `token-lint`, vitest, `figma connect parse`, `atlas-verify` (+ script tests, with an
`atlas-approved-new` label gate), Playwright visual regression. Nothing is `continue-on-error`.

- **Visual regression is real**: every sandbox section in light and dark, 50 Linux baselines,
  threshold tightened to `0.01 / 0.0005` after the default `0.2` hid a dark-mode Card regression.
- **axe is automated** on all 48 component suites — but never over a composed page.
- **Deprecation lifecycle** is complete end-to-end and enforced; unused (`entries: []`).
- **Token discipline is excellent**: zero colour literals, zero Tailwind class literals in
  `ui-web/src`, uniform CSS Modules + `var(--atlas-*)`.
- 47 web components (35 spec-complete, 12 scaffolded), 17 native (paused), 15 patterns, benchmark
  harness with Waves 1–3.

### The four real gaps

**1. What is enforced is tautological — but the fix is cheap.** `atlas-verify`'s `variants-sizes`
check validates code against `atlas/metadata/*.json`, whose `variants`/`sizes` are scraped from the
code's own type unions. Code-vs-code: it can only catch a typo'd literal. **However**, the same
metadata file already carries `figmaProperties` straight from the Figma pull, one key away and never
compared. Verified across all 47: every one has `figmaProperties`, **zero axis-level drift today**, and
**23 carry a Figma `State` axis** — a Figma-authored state list for which code has no union at all.
The independent ground truth already exists; nothing reads it. **This is why M1 needs no registry.**

**2. The contracts are unreadable and unsound.** 44 `*.contract.ts` files are hand-rolled conditional
types whose only consumer is `tsc`. `extends` catches only *widening*, so **deleting a variant
passes**; and `Pick<XProps, keyof A & keyof XProps>` means **a deleted prop passes**. Three components
have no contract (Breadcrumb, DropdownMenu, ListItem) and nothing requires one.

**3. Verification that cannot fail.** No JSON Schema anywhere; `atlas-verify` and `atlas-sync` both
`JSON.parse` + optional-chain, so a renamed field silently *disables* a check **while printing PASS**.
Only 1 of 13 checks has a test, and the shared regex JSX parser behind three checks (`jsxTags`,
`blankNestedJsx`, `literalProp`) has none.

**4. Tokens: semantic layer is colour-only; no brand axis; Figma token sync has never run.** 41
semantic colour tokens over 49 OKLCH primitives — but spacing, radius, type, motion and shadow have
**no semantic tier**, so a brand differing in radius or type scale has nothing to override.
`atlas/tokens.json` sits at `syncedAt: null` because the Figma MCP exposes variables **per node, not as
a table** — while `atlas/tokens.md`'s header claims `figma-synced`, contradicting its own sibling.

### Harvest sources, better than expected

- **Code Connect** (47 files, 57 connections) is the **only** artifact naming slots
  (`figma.instance("Leading icon slot")`) and mapping Figma states to props
  (`loading: figma.enum("State",{loading:true})`). Confirmed necessary: `figmaComponentProperties` is
  **empty on all 47** — the last pull never captured boolean/instance-swap/text properties.
- **A component-token alias layer already exists** for 8 components
  (`--atlas-button-primary-background: var(--atlas-primary)`), already enforced by `token-lint` to
  resolve to exactly one semantic token. This *is* `tokenRoles`, already authored — and the brand seam.
- `Field` already owns the whole a11y contract: `useId`/`htmlFor` wiring, `aria-describedby` →
  error-or-help, error replaces help, `role="alert"` with a non-colour-only icon, `aria-required`.
- `docs/architecture/ATLAS-SPEC/` (13 components) covers nearly every north-star declaration except
  events and fallback.

---

## Metric status — passing / failing / not measurable

> **GENERATED REGION — do not hand-maintain.** The tables below are produced by
> `scripts/metrics-report.mjs` from CI results and upserted between
> `<!-- BEGIN:generated-metrics -->

Generated by `scripts/metrics-report.mjs` from CI results. **Do not hand-edit** — `metrics-report --check`
fails when this region is stale. Statuses are exactly three: **passing** (a declared check ran and passed),
**failing** (ran and failed), **not measurable** (no result for the declared check — reported as `n/a`,
never `0`). A metric with no check is *not measurable*, never passing: absence of a signal is not a pass.

**7 passing · 2 failing · 26 not measurable** of 35. 3 of the measured rows cover only part of their population; the row says how much.

Result sources read: `atlas-sync`, `registry`, `token-lint`. Sources not present leave their metrics not measurable.

### Catalog Over Code

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Agent outputs containing CSS, HTML, JSX, or arbitrary markup | 0 | not measurable | `runtime/validator > rejects markup in prop values` | M4 |
| Rendered nodes mapped to registered components | 100% | not measurable | `runtime-demo > every node carries a registered data-atlas-type` | M4 |
| Direct raw color or spacing values accepted by components | 0 | **passing** | `code.raw-design-values` | Phase 2d |

### Grammar Parsimony

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Protocol messages passing schema validation | 100% | not measurable | `design.schemas` | M2 (JSON inputs), M4 (protocol) |
| Full conversation replay required for UI interaction | 0% | not measurable | `runtime-demo > interaction sends a state delta, not a re-render` | M4 |
| Median protocol size versus equivalent markup | At least 70% smaller | not measurable | `runtime/protocol > payload is at most 30% of rendered markup bytes` | M4 |
| First valid streamed operation | Under 250 ms p95 | not measurable | `protocol.firstOpP95` | Phase 6 |

### State Synchronization

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Interactive components with typed event contracts | 100% | **passing** — 0 failing of 4 interactive registered types (4/47 components registered) | `design.registry-events` | M3 |
| User events lost or reordered | 0 | not measurable | `runtime-demo > 50 rapid submits keep strictly increasing sequence` | M4 |
| Interactions requiring full-screen regeneration | 0% | not measurable | `runtime-demo > patch updates only the addressed subtree` | M4 |
| State acknowledgment latency | Under 300 ms p95 client-side | not measurable | `runtime-demo > state ack p95` | M4 |

### Fallback

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Invalid payloads producing a safe render | 100% | not measurable | `runtime/fuzz > 1000 malformed payloads all render` | M4 |
| Unhandled render exceptions | 0 | not measurable | `runtime/fuzz > no payload throws` | M4 |
| Components with declared fallback behavior | 100% | **passing** — 0 failing of 5 registered types (4/47 components registered) | `design.registry-fallback` | M3 |
| Fallback render latency | Under 100 ms p95 | not measurable | `runtime-demo > fallback render p95` | M4 |

### Context Containment

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Requests using filtered catalog capabilities | 100% | not measurable | `registry/filter > every request carries a filtered catalog` | Phase 6 |
| Requests exposing the full catalog | 0 | not measurable | `registry/filter > no request exposes every registered type` | Phase 6 |
| Prompt reduction from dynamic filtering | At least 50% | not measurable | `protocol.promptReduction` | Phase 6 |
| Irrelevant components exposed to the agent | 0 in evaluation tests | not measurable | `registry/filter > catalog excludes out-of-task types` | Phase 6 |

### Accessibility

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Core components pass automated accessibility checks | 100% | not measurable | `axe-coverage > every registered component has a passing axe assertion` | M3 |
| Contrast meets WCAG AA | pass | not measurable | `code.contrast` | Phase 4 |
| Keyboard navigation works for every interactive component | pass | not measurable | `keyboard > every interactive component suite` | Phase 4 |
| Focus states are visible | pass | not measurable | `code.focus-visible` | Phase 4 |
| Form errors are associated with their fields | pass | not measurable | `Field — help and error` | now |
| Reduced-motion behavior is supported | pass | **passing** | `code.reduced-motion-required` | Phase 2d |

### Figma parity

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| Token-name drift | 0 | **passing** | `tokens.name-drift` | D1 option B (full variable table) |
| Missing code tokens | 0 | **failing** — 2 over all 463 Figma variables and 432 code tokens | `tokens.missing-in-code` | D1 option B (full variable table) |
| Missing Figma tokens | 0 | **failing** — 15 over all 463 Figma variables and 432 code tokens | `tokens.missing-in-figma` | D1 option B (full variable table) |
| All supported brand modes compile successfully | pass | not measurable | `design.brand-modes` | M5.6 |
| Critical visual regression tests pass for every brand mode | pass | not measurable | `visual > sandbox` | now (light/dark only), M5.6 (brands) |

### Runtime quality

| Metric | Target | Status | Check | Measurable at |
|---|---:|---|---|---|
| No raw design values in component implementations | pass | **passing** | `code.raw-design-values` | Phase 2d |
| No component renders without a valid schema | pass | not measurable | `runtime/validator > unregistered type never renders` | M4 |
| No unsupported component can reach the renderer | pass | not measurable | `runtime/validator > unknown type replaced by fallback` | M4 |
| Loading, empty, error, active and disabled states exist for all interactive components | pass | **passing** — 0 failing of 3 interactive registered components (4/47 components registered) | `design.registry-states` | M3 |
| No horizontal overflow at supported breakpoints | pass | not measurable | `visual > no horizontal scroll at each breakpoint` | Phase 4 |

**How to read this.** A row is only as good as its check. `not measurable` is the honest state for
most of this table today and it is what the roadmap's early phases exist to reduce — each phase is
judged by how many rows it moves out of that column, not by how many are green.

<!-- END:generated-metrics -->` markers, the same pattern
> `atlas-sync` already uses for generated regions in `atlas/<Name>.md` and `atlas/tokens.md`.
> `metrics-report --check` FAILs when the committed region differs from a fresh run, exactly like the
> existing `tokens-build` git-diff gate. **The snapshot below is the seed, hand-written once to define
> the shape; from Phase 1 it is regenerated and nobody edits it by hand.**
>
> Three statuses, and the generator may only emit these: **passing** (a check asserts it and is green),
> **failing** (a check asserts it and is red), **not measurable** (no check can produce an honest
> number — reported as `n/a`, never `0`). A metric with no corresponding check is emitted as
> *not measurable*, never as passing: absence of a signal is not a pass.

<!-- BEGIN:generated-metrics -->

Status **today**, before any work.

### Catalog over code

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Agent outputs containing CSS/HTML/JSX | 0 | **not measurable** — no protocol | M4 (validator-enforced), Phase 6 (agent-measured) |
| Rendered nodes mapped to registered components | 100% | **not measurable** — no renderer | M4 |
| Raw **colour** values accepted by components | 0 | **passing** — `token-lint` rejects hex/rgb/hsl/raw-oklch absolutely | now |
| Raw **spacing** values accepted by components | 0 | **failing** — length literals only WARN; 3 real violations (`Alert.module.css:244,249`, `CodeBlock.module.css:122`) | Phase 2d |

### Grammar parsimony

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Protocol messages passing schema validation | 100% | **failing** — no schemas exist at all | M2 (JSON inputs), M4 (protocol) |
| Full conversation replay required | 0% | **not measurable** | M4 |
| Median protocol size vs markup | ≥70% smaller | **not measurable** | M4 — measurable with no agent |
| First valid streamed op | <250ms p95 | **not measurable** — no transport | Phase 6 |

### State synchronisation

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Interactive components with typed event contracts | 100% | **failing** — `events` absent from all metadata; `onClick` not even captured (regex reads only own interface members) | M3 |
| User events lost or reordered | 0 | **not measurable** | M4 |
| Interactions requiring full-screen regeneration | 0% | **not measurable** | M4 |
| State acknowledgement latency | <300ms p95 | **not measurable** | M4 |

### Fallback

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Invalid payloads producing a safe render | 100% | **not measurable** — no validator | M4 |
| Unhandled render exceptions | 0 | **not measurable** | M4 |
| Components with declared fallback | 100% | **failing** — 0 of 47; the concept does not exist | M3 (declared), M4 (exercised) |
| Fallback render latency | <100ms p95 | **not measurable** | M4 |

### Context containment

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Requests using a filtered catalog | 100% | **failing** — agents read `atlas/index.md`, all 47 | Phase 6 |
| Requests exposing the full catalog | 0 | **failing** — this is the current design | Phase 6 |
| Prompt reduction from filtering | ≥50% | **not measurable** | Phase 6 |
| Irrelevant components exposed in eval tests | 0 | **not measurable** | Phase 6 |

### Supporting quality gates

| Metric | Target | Status today | Measurable at |
|---|---:|---|---|
| Core components pass automated a11y | 100% | **partial** — 48 suites run axe; **Checkbox has no test file**; no page-level axe | M4 (page-level) |
| Contrast meets WCAG AA | pass | **not measurable** — no contrast check anywhere | Phase 4 |
| Form errors associated with fields | pass | **passing** — `Field` owns it | now |
| Reduced-motion behaviour supported | pass | **partial** — 36 hand-written blocks; nothing fails if the 37th forgets | Phase 2d |
| Token-name drift | 0 | **not measurable** — see **D1** | D1-dependent |
| Missing code / missing Figma tokens | 0 | **not measurable** — see **D1** | D1-dependent |
| All brand modes compile | pass | **failing** — no brand axis exists | M5 |
| Visual regression per brand mode | pass | **partial** — light/dark, one page | M5 |
| No component renders without a valid schema | pass | **failing** | M4 |
| No unsupported component reaches the renderer | pass | **not measurable** | M4 |
| Loading/empty/error/active/disabled states exist | pass | **partial** — 23 of 47 carry a Figma `State` axis | M3 |
| No horizontal overflow at supported breakpoints | pass | **not measurable** | Phase 4 |

**Honest reading:** of 24 metrics, **2 pass**, **7 fail**, **15 are not measurable**. Nothing in the
north star's Definition of Done can be claimed today, and the first job is to move metrics out of
"not measurable" — not to improve the ones already green.

<!-- END:generated-metrics -->

**Generator contract** (`scripts/metrics-report.mjs`, built in Phase 1, extended each phase):

- Inputs: `atlas-verify --json`, the vitest JSON reporter, the Playwright JSON reporter, and the
  benchmark ledgers. One input per metric, declared in `metrics.manifest.json` as
  `{ metric, target, source, check }`.
- A metric whose `check` is absent from the run output → **not measurable**. A metric whose `check`
  ran and passed → *passing*. Ran and failed → *failing*. There is no fourth state and no manual
  override, so the table cannot drift from reality.
- `metrics.manifest.json` is CI-checked for **totality against the north star**: every metric in
  `docs/architecture/ATLAS-TARGET-ARCHITECTURE.md`'s tables must appear, or the generator FAILs. That
  is what stops a metric from being quietly dropped once it goes red.
- Outputs: `atlas-report.json` (machine), the PR comment (human), and this region (committed).

---

## Phase 1 — Stop the contradictions (1 session)

Ship the two docs, then fix the records a later gate would inherit:

- `claude.md`: 94→104 discrepancies, "none open"→11 open, the stale 34/13 count.
- `packages/figma-sync/README.md` and `scripts/atlas-sync.mjs:28` `ORDER`: still the original 12, not 47.
- `packages/tokens/README.md`: wrong about `convert-tokens.mjs` direction and target.
- `docs/HANDOFF-next-session.md`: T18/T18c/Wave-2 merged in #95–#97.
- `docs/audits/QA-PLAN.md:203,206`: delete references to two validator scripts that do not and should
  not exist — `token-lint.mjs` is the real thing.
- **Bug:** `atlas/tokens.md` inherits its `figma-synced` header from the *component* pull while
  `atlas/tokens.json` is `syncedAt: null`. Stamp tokens from the token pull so it reads
  `repo-derived`. It currently lies about the most important unsolved thing in the repo.

**Also:** 7 of the 11 open discrepancies (DISC-027, 098–104) are one class — "Figma description is a
spec summary, not usage guidance." One batched Figma pass clears them, and those descriptions generate
`atlas/<Name>.md` usage guidance, so it directly serves Phase 2.

**Also in Phase 1:** build `scripts/metrics-report.mjs` and `metrics.manifest.json` per the generator
contract above, seeded from `atlas-verify --json`. At this point almost every row reads *not
measurable* — which is the correct output and the reason to build it now: each later phase is judged by
how many rows it moves, and the generator must exist before there is anything to move.

**Exit:** both docs linked from `AGENTS.md`; zero doc-vs-reality contradictions; `ORDER` covers 47;
`metrics-report --check` passes and the metric region is generated, not hand-maintained.

---

## Phase 2 — Make the truth measurable

### 2a → M1. Independent Figma→code comparison — two-way comparator, registry-ready ✅ DONE 2026-10-22

> **Landed.** `scripts/lib/compare-axes.mjs` + the `design/figma-code` check in `atlas-verify`, the
> authored `packages/registry/figma-axis-map.json`, and 35 tests. Repo-wide result:
> **47/47 components · 130 axes compared · 23 State axes deferred to M3 · 4 unmapped (WARN) · 0 findings.**
>
> **Five things went differently from this plan. They are recorded here, not quietly absorbed.**
>
> 1. **`syncedAt` already *is* `figmaPulledAt`, so no new field was added.** `atlas-sync` derives it
>    from `pull.pulledAt`, and `carriedForward()` reuses the value already in the snapshot, so it never
>    advances without a real `--pull` — the date was honest all along. What was missing was the *gate*,
>    not another field. `--max-figma-age <days>` now FAILs on a stale Figma side and CI passes 90.
>    Adding a redundant field would have rewritten all 47 metadata files for nothing.
> 2. **Coverage went far beyond Variant and Size.** Metadata only carries value lists for those two,
>    but Code Connect maps **30 of the 34 axes** as `figma.enum`, and its enum *values* flow into the
>    typechecked `example` closure — so `tsc` already proves they are assignable to the real prop type.
>    Figma → Code Connect keys (this check) plus Code Connect values → props (`tsc`) is a complete
>    chain, which lifted the comparison from ~70 axes to **130**.
> 3. **M1 did not land green, and it found 3 real drifts** that nothing in the repo could detect:
>    **Dialog/Size** was missing `full` in Code Connect though both Figma and `DialogSize` have it
>    (fixed here; `tsc` verifies the fix); **DatePicker/Placeholder** exposed a bug in the first axis
>    map, since Figma models it as the two-valued axis `true|false` which Select maps as an enum and
>    DatePicker as a `figma.boolean` — both correct, so the comparator now accepts either; and
>    **Pagination/Position** is an **open owner decision** (below).
> 4. **The axis map needed per-component overrides.** The same Figma axis is legitimately treated
>    differently per component, so an axis-level disposition would either flag the correctly mapped
>    components or silently excuse the unmapped one.
> 5. **M1 moves zero rows in the metric table, by design.** No north-star metric is about component
>    axis parity — the spec's Figma-parity metrics are all token-level. M1's value is that it makes
>    M3's metrics trustworthy; claiming otherwise would be exactly the dishonesty the table forbids.
>
> **Open owner decision — Pagination/Position.** Figma draws `start|middle|end`; Pagination has no
> `position` prop and no position concept anywhere in its source. Either Figma's axis is layout-only
> presentation, or Pagination is missing an API. Left `unmapped` with that reason rather than inventing
> a prop, which §4 forbids. It wants a DISC entry and a decision. The other three unmapped axes are
> settled: Stepper/Viewport (deliberately CSS-driven), ScrollProgress/Progress (sample positions, the
> real value is computed at runtime), Table/Content (code composes a Checkbox instead of branching).

#### As planned (1–2 sessions)

**This is the first blocking milestone and it needs no registry.** Both inputs already exist in every
metadata file: `figmaProperties` (from the Figma pull) and `variants`/`sizes` (from the code unions).

- `scripts/lib/compare-axes.mjs` — a **two-way comparator, registry-ready**: its result shape carries a
  `registry` slot that is simply absent until M3 adds the third leg. Named for what it is, not for what
  it will become, so nothing in the codebase claims a three-way check before one exists.
- New `atlas-verify` check `design/figma-code`:

| Disagreement | Fails | Remediation |
|---|---|---|
| Figma axis has X, code union lacks X | **code** | Implement it |
| Code union has X, Figma axis lacks X | **code** | Add in Figma first, re-sync, then code — **the case nothing can catch today** |
| Code Connect `figma.enum` keys ≠ Figma axis members | **code** | Code Connect is code |
| `figmaProperties` missing, `null`, empty, or malformed | **FAIL** | See below — missing data is never zero drift |

**M1 fails closed. This is a condition of the milestone, not a later hardening.** The failure mode it
exists to prevent is the one already endemic in this repo: a check that reports PASS because it
inspected nothing. Concretely:

- `figmaProperties` absent, `null`, or `{}` for **any** component → **FAIL**, naming the component and
  telling the operator to re-pull. Not WARN. A component with no Figma data is unverifiable, and
  "unverifiable" must never render as "agrees".
- **Malformed → FAIL, and M1 cannot wait for M2's schemas.** M1 precedes the ajv layer, so it ships a
  narrow inline structural guard of its own: each axis value must be a non-empty array of non-empty
  strings; anything else (object, number, empty array, array containing a non-string) FAILs as
  malformed rather than being coerced or skipped. M2's schemas then generalise this to every JSON input
  and the inline guard is deleted in the same commit that adds the schema — recorded as a deliberate
  temporary duplication, not an oversight.
- **No optional chaining in the comparator.** `m.figmaProperties?.Variant ?? []` is the exact idiom
  that turns a renamed field into a vacuous PASS; the comparator reads fields explicitly and throws on
  absence, and the check converts that throw into a FAIL with the component name.
- The check reports its inspection count (`47 components, 34 axes compared`) and **FAILs on zero
  inspections**, so an empty `atlas/metadata/` directory is a failure, not a clean run.
- Pre-existing gaps get no grandfather clause: verified today, all 47 have `figmaProperties`, so
  fail-closed costs nothing to adopt. If that ever stops being true the build stops, which is the
  point.

- `figma-axis-map.json` (authored), CI-checked for **totality**: each of the **34 observed axes** must
  be mapped or explicitly classified `cssOnly`/`ignored` with a reason. (The long tail — `Percent`,
  `Progress`, `Steps`, `Sort`, `Visibility` — are text/number properties modelled as variant axes;
  most appear once.)
- **Staleness gate.** `carriedForward()` reconstructs the pull *from the snapshot* when `--pull` is
  absent and sets `carried: true`. Verified: it carries the **original** `syncedAt`
  (`pulledAt: m.syncedAt`), so the date stays honest — but `source` stays `"figma-synced"` forever and
  **nothing ever fails**. Add `figmaPulledAt` (written only by a real `--pull`), keep `syncedAt` as
  "last regeneration", add `--max-figma-age` → FAIL. Without it, "Figma wins" means "the 2026-10-21
  cache wins, undetectably."

**Why this can go first:** zero drift today **and** complete `figmaProperties` coverage, so a
fail-closed check lands green and gates future changes instead of opening with 47 failures to triage.

**Honest scope note for the doc:** this proves *axis* agreement, not *visual* agreement. A green
`primary` in Figma where code is blue is caught only by the human four-gates review.

**Exit (M1) — verified 2026-10-22.** Both criteria demonstrated against the real repo, then reverted:
deleting `"link"` from `ButtonVariant` and re-syncing makes `figma-code` FAIL with *"Figma
Button/Variant has \"link\" and the code union does not"* while `variants-sizes` stays PASS (it
compares code against metadata derived from that same code); and emptying `figmaProperties` on one
component FAILs as unverifiable while the note drops to `46/47 components`, so the gap is visible
rather than reported as zero drift. A malformed axis value (a string where an array belongs) also
FAILs rather than being coerced or skipped.

### 2b → M2. The verifier cannot silently pass ✅ DONE 2026-10-22 (one session)

> **Landed.** 7 schemas in `packages/governance/schemas/` (`common`, `metadata`, `index`, `tokens`,
> `state`, `governance`, `figma-pull`), compiled by `scripts/lib/schemas.mjs` with `ajv@8` (declared).
> `design/schemas` runs first and gates every other check's JSON. `guardFigmaProperties` is deleted in
> the same change. `--only` was added. Results, on this repo:
> **58/58 JSON inputs valid · 15/15 checks tested · every check reports `inspected`/`scope` · renaming
> `variants` in `atlas/metadata/Button.json` → `design/schemas` FAIL, exit 1 (the M2 exit, now a test).**
> Script tests: `npm run test:scripts` reports 184 passing; 175 top-level `test(` cases, up from 107.
>
> **What went differently from this plan:**
>
> 1. **The JSX scanner was replaced, not only tested.** Its first tests failed 8 of 26 cases on the
>    regex scanner: a tag inside a JS string or a comment was a real use, `useState<Button>()` in a
>    `.ts` file was a tag, `variant={v}` read as *absent*, and spreads were invisible. `jsxTags` now uses
>    the TypeScript parser (already a devDependency) and returns a string, `UNKNOWN` or `undefined`.
>    `blankNestedJsx` is gone: the AST gives each element its own attributes, the case it existed for.
>    Run over the whole repo, old and new report identical findings; the new one also surfaces 32
>    dynamic props the old one read as absent.
> 2. **The zero-inspection rule is enforced centrally**, in `check()`, not per check: a check with no
>    `inspected` count fails, and so does one with `scope > 0 && inspected === 0`. A future check cannot
>    forget it.
> 3. **Two silent passes found on the way and fixed:** `no-new-tokens` passed when `--base` could not be
>    read, and `--json` output was truncated at 64 KB when piped (`process.exit` before stdout drained).
> 4. **The pull file is validated in `atlas-sync`**, since `atlas-verify` never reads one; `variables`
>    is left an open object for D1.
> 5. **"13 checks" is 15 now** (M1 added `figma-code`, M2 `schemas`); all 15 have a PASS and a FAIL test.
>    `tsc` and `tests` are tested on a one-file fixture program so they stay fast and real.

- `packages/governance/schemas/*.schema.json` for `atlas/metadata/*`, `atlas/index.json`,
  `atlas/tokens.json`, `atlas/state/*`, `governance/{deprecations,ownership}.json`, and the Figma pull
  file. Declare **`ajv`** (over zod: schemas must ship to a browser as data for the runtime validator).
- New check `design/schemas`, validating every JSON input *before* any check reads it.
- `scripts/tests/quality-checks.test.mjs` — the missing parser tests: self-closing, nested, fragments,
  comments, strings containing `<`, multi-line attributes; `literalProp` on `variant="x"`,
  `variant={"x"}`, `variant={v}` (must report *unknown*, not *absent*), spreads.
- **Every check reports an inspection count and FAILs on zero when the diff says otherwise**:
  `PASS (14 files, 62 literal props)` vs `FAIL (0 inspected, 14 changed .tsx in scope)`.

**Milestones:** 13/13 checks tested (from 1/13); no check can PASS with 0 inspections; 100% of JSON
inputs schema-validated — the honest proxy for "100% protocol messages passing schema validation",
years before a protocol exists.
**Exit (M2):** corrupting one field in `atlas/metadata/Button.json` turns a PASS into a FAIL.

### 2c → M3. The registry, and three-way agreement (3–4 sessions) — ✅ DONE 2026-10-23 (4 sessions); exit met except Text

> **Session 4 landed; M3 is complete.** The comparator is three-way: `design/figma-registry-code`
> (renamed in the commit that filled the `registry` slot) fails on the registry side for an enum
> that differs from its Figma axis or the code union, an unclassified Figma `State` member, and a
> slot with no Figma counterpart — a Code Connect content mapping or drawn literal content, recorded
> as `figmaContent` in the facts (it found Alert's `children` and `icon` undrawn; both are now
> hidden). `design/registry-events`, `-fallback` and `-states` share one function with
> metrics-report's committed-state `registry` source, so the metric region stays deterministic.
> Owner decisions (DEC-080) set fallback (everything → Alert neutral; Alert terminal), nesting, a11y,
> responsive, capabilities and tokenRoles. **Exit, honestly:** 5 of the 6 named types are
> `registryComplete: true` — **Text is deferred** because Atlas has no Text component (it needs a
> Figma-first component session); all 47 have a generated contract; "typed event contracts" and
> "components with declared fallback" read **passing**, over the registered subset (4/47 components
> registered, printed in each row). Contracts now cover every export of each module, with exact prop
> types, discriminated branches, exported types and one authored input
> (`packages/registry/contract-props.json`). A script audit found 524/524 hand-contract assertions
> covered before the 44 were deleted in one commit; contracts generate straight into
> `packages/governance/contracts/`. `registry:check`: **5 entries, 47 facts, 47 contracts, 5
> schemas, 144 rules**. Metric table **5 passing · 0 failing · 30 not measurable**. Details: the M3
> plan, "Session 4".

> **Session 3 landed.** A protocol schema per registry entry (`generated/schemas/`, closed objects
> whose props are the entry's protocolProps typed from the code; exempt from `INPUTS` and compiled by
> ajv strict against the meta-schema), `generated/componentMap.ts` (deep imports, checked by `tsc`),
> and `scope/no-new-components` extended to added registry entries. `registry:check`: **4 entries,
> 47 facts, 47 contracts, 4 schemas, 115 rules**. Session 4 is the third leg, the metric checks, the
> owner decisions, and deleting the 44 hand-written contracts.

> **Session 2 landed.** Facts and a generated contract for **all 47** components
> (`packages/governance/contracts/generated/`, next to the 44 hand-written ones). `registry:check`:
> **4 entries, 47 facts, 47 contracts, 115 rules**. Deleting a variant, deleting a prop or making an
> optional prop required now fails `tsc` in the generated contract, while the hand-written one stays
> silent (shown on the real Button, kept as script tests). **The audit found no drift** between the
> hand contracts and the code; it found coverage gaps: 3 components with no contract, 26 own props
> guarded by nothing, both now covered. Two things differ from this section: facts read the **part
> Code Connect's example drives** (DrawerContent for Drawer, TableHead for Table), because 7
> components bind a sub-part or export no `<Name>Props`; and **10 hand contracts also guard
> sub-parts** (SelectProps, TableCellProps, …) that generation does not cover yet, so deleting the 44
> waits until it does (session 4). Details: the M3 plan, "Session 2".

> **Session 1 landed** (plan: `docs/superpowers/plans/2026-10-23-m3-registry.md`, which records the
> design decisions below as numbered choices). `packages/registry/aliases.json`, four authored entries
> (`Button`, `TextField`→`Input`, `Alert`, `Form` structural), `registry.schema.json` with three
> `INPUTS` rules, and `scripts/registry-build.mjs` generating `generated/<Name>.facts.json` for the
> three rendered components through the TypeScript compiler API. `npm run registry:check` runs in CI
> after the script tests: **PASS — 4 entries, 3 facts, 115 rules checked**. Negative test 6 (an
> authored enum member absent from the code union) FAILs, as a script test and once against the repo.
>
> **What went differently from this section:**
>
> 1. **Entries are keyed by the registered type**, not the component: `src/TextField.registry.json`
>    with `aliasOf: "Input"`. `aliases.json` stays the alias table and `--check` FAILs when an entry
>    disagrees with it, so the two cannot drift.
> 2. **Own props must be accounted for** in `protocolProps`, `slots`, an `events` handler or
>    `hiddenProps` (with a reason). That is the concrete form of "code gaining a prop with no authored
>    entry is WARN, FAIL at `registryComplete: true`". Inherited DOM props are visible to the invariant
>    (so `disabled` and `onClick` can be declared) but never required.
> 3. **`states` is authored now**, as a classification of every Figma `State` member (`interaction` or
>    `prop`), cross-checked with Code Connect's `figma.enum("State", …)` mappings. The comparator's
>    "23 State deferred to M3" note goes away only when session 4 fills its `registry` slot.
> 4. **No entry is `registryComplete: true` yet.** `fallback`, `nesting`, `a11y` and `responsive` need
>    owner decisions (`AGENTS.md` §6), so they are absent rather than guessed. `tokenRoles` is authored
>    for Button and TextField from the existing component-token layer; Alert's waits for Phase 2d.
> 5. **Generated per-component schemas will be exempt from `INPUTS`** like `packages/governance/schemas/`,
>    validated instead by ajv's strict compile against the 2020-12 meta-schema. Decided now, built in
>    session 3.

```
packages/registry/
  aliases.json                        authored   TextField→Input, Modal→Dialog, Form→structural
  figma-axis-map.json                 authored   (from M1)
  src/<Name>.registry.json            authored   the declarative half
  generated/<Name>.facts.json         generated  committed, git-diff-gated
  generated/componentMap.ts           generated  the name→component map
  generated/schemas/<Name>.schema.json generated  consumed by the runtime validator
scripts/registry-build.mjs            new        tsc program + Code Connect AST + atlas/metadata
```

**Authored** (editorial; exists nowhere in code or Figma): `type`, `aliasOf`, `kind`
(`component`|`structural`), `events`, `slots`, `nesting`, `fallback`, `tokenRoles`, `states` +
`stateProps`, `a11y`, `responsive`, `capabilities`, `protocolProps` (the agent-visible subset),
`registryComplete`, `platforms: ["web"]`.

**Generated** via the **TypeScript compiler API** (`ts.createProgram` + `getPropertiesOfType`) — real
prop types *including inherited DOM props and every event handler*. Exactly what regex extraction
cannot do, and why `onClick`/`disabled` are absent from Button's metadata and `events` has no source
today. Plus Code Connect slot names and state fan-out via AST; plus Figma axes from `atlas/metadata`.

**Why hybrid, not the alternatives.** Hand-authored alone drifts from code within two PRs — inverting
the tautology rather than removing it. Extending `atlas-sync.mjs` fails on three counts: the authored
half cannot live in `atlas/` (never hand-edited) and it is the entire value; `atlas-sync` must run
with no Figma access and no build (`carriedForward()`), so a `tsc` program over 47 components makes
snapshot refresh slow and failable for non-Figma reasons; and `atlas-figma-sync`'s skill contract
forbids touching `ui-web`. `registry-build` *reads* `atlas/`, never writes it.

**One invariant** — `registry-build --check`:

> The authored registry is always a **subset** of the generated facts, never a superset.

FAIL (authored side) on: a `protocolProps` entry with no generated prop; an enum member absent from the
code union; an `events` entry with no corresponding handler prop (this test only passes because
generation is AST-based); a slot with neither a `ReactNode`/render-prop nor a `figma.instance`; a
`fallback` target not registered; a `tokenRoles` value absent from `atlas.tokens.css` or that
component's `tokensUsed`. Code gaining a prop with no authored entry is **WARN**, escalating to **FAIL**
at `registryComplete: true` — a per-component ratchet modelled on the existing `eslint-suppressions.json`.
An authored enum *narrower* than the code union **passes** with `"narrowed": "<reason>"`: the agent
surface is legitimately smaller than the component surface.

**The third leg** — M1's two-way comparator becomes a genuine three-way check here, and only here, by
populating the `registry` slot its result shape already carries. Renamed to `design/figma-registry-code`
in the same commit: registry enum ≠ Figma axis → **registry** fails (it is derived, never a third
opinion); registry ⊋ code → **registry** (subset invariant); an unclassified Figma `State` member →
**registry**; a registry slot with no Figma instance-swap and no `figma.instance` → **registry**.
Fail-closed extends with it: a registered type whose `figmaProperties` is missing or malformed was
already a FAIL at M1 and stays one.

**Ground truth is partitioned by field.** Figma is authoritative for what Figma models: variant axes,
sizes, booleans, instance-swap slots, **states**. The registry is the only possible authority for what
Figma does not model: events, nesting, fallback, `tokenRoles`, responsive — checked registry↔code,
which is correct, because those are *contracts*, not design facts.

**Contracts: generate sound replacements into the same paths.** Keep
`packages/governance/contracts/<Name>.contract.ts` so the CHANGELOG policy ("the contract changes in
the same commit as a breaking change") keeps working unedited — and becomes *true*. Fix both
unsoundnesses:

```ts
// mutual extends in tuple form (defeats union distribution) — catches narrowing AND widening
type _VariantExact = [ButtonVariant] extends [Variants]
  ? ([Variants] extends [ButtonVariant] ? true : never) : never
// per-prop existence, which cannot collapse the way Pick<P, keyof A & keyof P> does
type _HasVariant = "variant" extends keyof ButtonProps ? true : never
```

**One source of truth, precisely:** the TSX owns prop *types*; the registry owns the *agent-visible
subset and its enums*; the generated contract is a one-way tripwire asserting the relationship —
derived from both, authoritative over neither, never hand-edited, never consulted as a definition. For
the same reason, do **not** generate prop types from the registry: that would create a genuine second
source.

**Migration order matters:** generate alongside the 44 hand-authored files → **diff generated vs
hand-authored**. That diff is a free audit of what the unsound checks have been missing, and is likely
to find real drift. Fix findings as `atlas-component` work (four gates). Only then delete the 44 in one
commit. Generation also closes coverage to all 47, and `registry-build --check` FAILs on a missing
contract.

**`no-new-component` interaction:** extend `scope/no-new-components` to scan added files under
`packages/registry/src/` and FAIL unless the alias target resolves to a real component, or the entry is
`kind: "structural"`, or the PR carries `atlas-approved-new`. `Form` is the one structural entry
(`aliasOf: null`, `composedOf: ["Field","Input","Button","Alert"]`) — precedent exists in CAND-006
(Link) and CAND-027 (TimePicker), both resolved as compositions, not components.

**Exit (M3):** ≥6 types with `registryComplete: true` (Form, TextField, Button, Alert, Field, Text);
all 47 have a generated contract; "typed event contracts" and "components with declared fallback" move
from *failing* to *passing* in the metric table.

### 2d. Token work that needs zero new tokens (1–2 sessions) — ✅ DONE 2026-10-23 (1 session)

> **Landed in one session, no new token, no Figma call** (plan
> `docs/superpowers/plans/2026-10-23-phase-2d-tokens.md`). The rules are pure functions in
> `scripts/lib/token-rules.mjs`; `token-lint` applies them and gains `--json`. **Private vars are a
> legal tier:** 88 of 98 `--_` declarations are one semantic alias; the other 10 (`calc()` of tokens,
> `100vw`, `0`, the Slider `±1` direction) are listed with a reason in
> `packages/governance/private-vars.allow.json`, matched by value, and a stale entry fails.
> **`no-raw-length`** is strict over `packages/ui-web/src`; `@media` widths (owned by the breakpoint
> rule), `em` units and the visually-hidden `1px` are not lengths. It found exactly the 3 named
> violations: Alert's exit collapse now starts from the alert's measured height (`--_exit-h`; the
> `200px` cap clipped tall alerts) and CodeBlock's cursor gap is `--atlas-spacing-px`.
> **`breakpoint-literal-consistency`** reads 10 `@media` widths, all on the scale;
> **`reduced-motion-required`** covers 30 animated component CSS files, none missing a block.
> `atlas-verify` reports `code.raw-design-values` and `code.reduced-motion-required` from one
> token-lint run, and metrics-report measures the committed tree through a new `token-lint` source with
> the same rule grouping (`METRIC_RULES`), so the region stays reproducible: **three rows moved from
> not measurable to passing (8 passing of 35).** **`convert-tokens` derives all 17 exports** from the
> CSS; the only literals left are pure white and black. The drift it surfaced was additive only
> (`spacing.9`, `radius.base`, `easing.linear|emphasized|exit`, `textRole.h1|h2`), no existing value
> changed, and a script test proves editing `--atlas-spacing-4` changes the native output, so the
> `tokens-build` gate is real. Alert's `tokenRoles` maps its private-var roles (`pad-*`, `accent-*`).
> Verification items 7 and 8 below are now tests.

**The slice needs no new token** — Button and Input have complete component-token layers, Alert uses
the private-var pattern, `Field` is layout. The most important scheduling fact in the plan: the slice
has **no Figma dependency, no `atlas-approved-new` label, no visual blast radius**.

1. **`tokenRoles` as role→existing-token** — satisfies the north star's declaration *without inventing
   a tier*. Purely additive.
2. **Three `token-lint` rules**, each closing a documented hole:
   - `no-private-var-escape` — Alert's `--_pad`/`--_accent` pattern is invisible to
     `component-token-alias` (which only inspects `--atlas-*`). Bless it as a legal tier with an
     allowlist and require the value to be a single `var(--atlas-<semantic>)`, or it spreads.
   - `breakpoint-literal-consistency` — the three triplicated sources (`--atlas-breakpoint-*`, literal
     `@media` since CSS cannot use `var()` there, `--breakpoint-*` in `@theme inline`) must agree.
   - `reduced-motion-required` — a component CSS using `--atlas-duration-*` must have a
     `prefers-reduced-motion` block. Moves that metric from *partial* to *passing*.
   - Fix the 3 real length violations, moving "raw spacing values" from *failing* to *passing*.
3. **Make `tokens-build` mean something.** `convert-tokens.mjs` hard-codes 14 of 17 exports as literals
   in a template string, so changing `--atlas-spacing-4` passes CI with native unchanged. Derive all
   from the CSS: decorative gate → real gate.

---

## D1 — Decision gate: Figma token-table access — ✅ DECIDED 2026-10-23: option B, built (DEC-081)

> **The owner chose B at the end of Phase 2, and it landed in one session.** One read-only `use_figma`
> call reads the whole table (`getLocalVariablesAsync`: 463 variables, 5 collections, every mode) as a
> compact list with an FNV-1a checksum, so the copy into `.atlas-pull/variables.json` is proven exact
> (`e11ec099` on both sides). `atlas-sync --variables` validates it against
> `figma-pull.schema.json#/$defs/variableTable` before writing anything, and `atlas/tokens.json`
> `figmaTable` carries it with its own `syncedAt`. The token values keep their repo-derived stamp, since
> the table carries names, not values; a sync without `--variables` carries the table forward.
> `tableCoverage` (`scripts/lib/token-coverage.mjs`) classifies every variable and every CSS token. A
> variable with no `codeSyntax.WEB` and no CSS token is **unpublished**: 53 colour ramps, Figma-only,
> not drift. A CSS token that spells out a mode of a multi-mode collection is covered by that variable
> (9: `columns|gutter|margin-mobile|tablet|desktop`). **Result over the full table:** 0 name drift;
> **2 missing in code** (`card/default-background-hover`, `card/outlined-background-hover`, DISC-106);
> **15 missing in Figma** (`color-neutral-50`, 4 dialog widths, 4 safe-area insets, 4 shadows, 2 card
> shadows, DISC-107); 417/432 code tokens covered. All three rows are now measured, with no fraction:
> name drift **passing**, missing code tokens **failing**, missing Figma tokens **failing**. "Missing
> code tokens" read passing over the bound subset and fails over the whole table, which is exactly why
> the subset was never coverage. `figmaBound` stays as a cross-check. **Not done:** token *values*
> (per-mode value drift) and the "regardless of outcome" `atlas.figma.tokens.json` promotion below;
> both now start from this table.

**This is a dependency decision, not an assumed capability.** Four metrics (token-name drift, missing
code tokens, missing Figma tokens, all-brand-modes-compile) are **blocked on it**, and the semantic
token tier and brand axis cannot be claimed complete without it. Open the spike **in parallel with
Phase 2**; the roadmap must not assume an outcome.

The constraint: the Figma MCP exposes variables **per node**, not as a table (`atlas-sync.mjs:806`
falls back to `"repo-derived"`), so `atlas/tokens.json` has never synced.

| Option | Cost | What it unlocks | Metric consequence |
|---|---|---|---|
| **A. REST `/v1/files/:key/variables/local`** | one spike; needs a token with the right scope | the full variable table, all modes | token drift metrics become **fully measurable**; M5 proceeds as designed |
| **B. A small Figma plugin dumping the variable table** | one spike; no API scope needed | same as A, manual trigger | same as A, but sync is **operator-initiated**, so pair it with the `figmaPulledAt` max-age gate |
| **C. Harvest `codeSyntax.WEB` from the per-node pull already running** | cheap; no new access | the Figma-name→CSS-name map **for the bound subset only** | drift measurable as a **fraction** (`0 drift over N/432 covered`) — partial but honest |
| **D. No access** | none | nothing | the four metrics stay **not measurable**; M5 ships the semantic tier **without** a Figma-side drift gate, and that limitation is stated in the doc |

**Recommendation:** implement **C now** (it needs nothing new and converts "not measurable" into a
measured fraction), and run the **A/B spike in parallel**. Decide at the end of Phase 2.

**Regardless of outcome:** promote `atlas.figma.tokens.json` to CI-validated declared truth. It is the
only file modelling modes properly (Primitives / Semantic Light|Dark / Layout / Responsive Type, with a
real alias graph) and it is read by nothing. Schema it, resolve the alias graph, check the slash→dash
convention, and encode DEC-058 (Figma opacity percent vs CSS fraction) as **code, not prose in
`notes`**. Add `attestedAt`/`figmaVersion` and FAIL when the attestation predates the last pulled
`figmaVersion` — converting an unmeasurable *correctness* metric into a measurable *staleness* one.

**Do not** generate `atlas/tokens.json` from the CSS and stamp it `figma-synced`. That is effectively
what the current fallback does, and it is why two generated siblings contradict each other today.

### D1 findings (spike, 2026-10-22)

**C is built.** A read-only `use_figma` harvest walks the 47 component sets, collects every bound
variable and its `codeSyntax.WEB`, and the pull carries it as `boundVariables`. `atlas-sync` compares
it with `atlas.tokens.css` (`scripts/lib/token-coverage.mjs`) and writes `atlas/tokens.json`
`figmaBound`; the token values keep their repo-derived stamp. Result: **0 drift over 193/432
covered**. All 193 bound variables have a WEB name that the CSS declares; the 2 that break the
slash→dash convention (`font-family/sans|mono` → `--atlas-font-sans|mono`) are listed as
`conventionExceptions`, not drift. The metric table now reads *passing on 193/432* for name drift
and missing code tokens. **Missing Figma tokens stays not measurable**: a bound subset cannot prove
a CSS token has no Figma variable.

**A is blocked by plan, not by setup.** `GET /v1/files/:key/variables/local` needs the
`file_variables:read` scope, which Figma issues only to full members of **Enterprise** orgs. The
file owner's account is on Pro and Starter teams. No token is configured anywhere (environment,
`.env*`, CI secrets), and an unauthenticated probe returns `403 Invalid token`. A personal access
token on a Pro plan cannot get this scope, so A is not reachable without an Enterprise upgrade.

**B needs no plugin: the Figma MCP already runs the Plugin API.** `use_figma` executes Plugin API
JavaScript in the file, and `figma.variables.getLocalVariablesAsync()` returned the **whole table**
in one read-only call: 463 variables in 5 collections (Primitives 197 · Semantic 47 Light|Dark ·
Layout 3 and Responsive Type 7 Mobile|Tablet|Desktop · Component 209), every mode populated,
aliases resolvable (`background` → `color/neutral/0` Light, `color/neutral/950` Dark), scopes and
`codeSyntax` present (410 of 463 carry a WEB name; the 53 without are primitive colour ramps such as
`color/charcoal/*`). It is operator- or agent-initiated, the same trigger as the component pull
today, so it pairs with the existing `--max-figma-age` gate. A standalone plugin (manifest +
`code.js` calling the same API, run as a development plugin and exporting JSON) is only needed if
`use_figma` access goes away; it is about one session of work and needs no publishing.

**Side finding for the "regardless of outcome" item (not done here):** `atlas.figma.tokens.json`
models 172 variables in 4 collections; Figma has 463 in 5 (no `Atlas/Component` collection, 78 fewer
primitives, 4 fewer semantic). Promoting it to declared truth must start by regenerating it from the
table, not by schema-checking the stale copy.

**Recommendation: B, through `use_figma`.** Extend the pull with the full `variables` table (all
modes, aliases, codeSyntax) using the same read-only call, generate `atlas/tokens.json` values from
it with a real `figma-synced` stamp, and keep C's bound subset as a cross-check. That makes all three
token-drift metrics fully measurable and keeps the brand axis on the quarter track. A stays off the
table unless the plan changes; D is not needed. The decision is the user's, at the end of Phase 2.

---

## M4 — Vertical slice: the first production milestone (3–4 sessions) — ✅ DONE 2026-10-23 (4 sessions)

**As built** (plan `docs/superpowers/plans/2026-10-23-m4-runtime-slice.md`; decisions DEC-082 to DEC-085):
`app/runtime-demo` renders the Request access form from the fixture's JSON tree through `packages/registry`
(`generated/runtimeRegistry.ts` plus `lib`: `resolve`, `filter`, `without`) and `packages/runtime` (protocol,
`validateTree`, `fallbackFor`, sequenced reducer, `<AtlasRuntime>`, stub agent). **All 12 M4 manifest rows are
measured** (the prose below says 11; the manifest has 12): 11 pass and 1 fails. Deviations from the text below:
- **Fallback copy is DEC-080's Alert** (neutral, "This content is unavailable"), not `Card + Text`: Text does not exist.
- **Deleting the Alert entry drops the node** and keeps the page (DEC-082, owner): Alert is itself the one terminal
  fallback, so there is no registered fallback left to render.
- **One Playwright server (3031) with two projects**, not a second port, 3032 (DEC-084 (7)); CI runs both in one
  invocation, so the production build runs once.
- **The size metric reads failing at 0.308** (513 B payload / 1663 B markup; 521 B of that markup is runtime
  tagging, so against component markup alone it is about 0.45). It is report-only on the owner's decision
  (DEC-085): `size.metric.tsx`, `npm run test:metrics`, non-blocking in CI. A more compact protocol is a later decision.
- **Measured p95 on the production build:** state ack 0.4 ms, fallback render 0.5 ms (gates 600 and 200 ms). The
  agent is an in-page stub, so this proves the client path only.

Begins only after M1–M3. This is the first thing that renders a real screen from a semantic tree.

**Path: `app/runtime-demo/`, a new route — not `app/prototypes/<slug>`.** Three structural reasons:
`app/prototypes` is `atlas-prototype`'s lane, and that skill never calls Figma and composes from
`atlas/<Name>.md` — the wrong contract; `atlas-verify prototype-registered` would force registration in
`flowRegistry`, where a runtime demo does not belong; and `FlowShell`/`useFlowState` are the wrong
primitives (presentational, two `useState`s, `patch()` shallow spread, no reducer, no event names, no
validation — and `FlowShell` uses inline `style={{}}`, against the repo's own convention).

**Real packages, stubbed agent.** It renders through the real `packages/registry` + `packages/runtime`
— a stub proves nothing. But M4 is driven by **fixture protocol messages**
(`packages/runtime/tests/fixtures/*.json`). M4 proves the runtime; Phase 6 proves the agent. That split
is what makes this finishable in 3–4 sessions.

**The `index.ts` blocker, solved without a barrel.** `ui-web/package.json` declares
`"main": "./src/index.ts"` and the file does not exist. Do **not** hand-author a 47-entry barrel.
Generate `packages/registry/generated/componentMap.ts` from the registry + aliases,
`git diff --exit-code`-gated: deep imports keep working and the map is provably complete. Separately
**drop the false `"main"`**.

**The flow:** a "Request access" form — email + organisation, submit, validation error, success Alert.
`Field` + `Input` (as `TextField`) + `Button` + `Alert`, with `Form` as the structural type owning
submit/validation/error-association. Log the `Form` gap in `candidates.json`.

| Stage | Runner | Assertion |
|---|---|---|
| Registry | vitest | `resolve("TextField")` is `Input`; `resolve("Modal")` is `Dialog`; `filter()` returns ⊆ 6 types, asserted by count **and** explicit absence of `Dialog` |
| Protocol | vitest | Fixture validates against the generated schema. **Size:** `JSON.stringify(op).length ≤ 0.30 × markupBytes` of the same rendered tree — the ≥70% metric, with no agent |
| Validator | vitest, table-driven | unknown `type` → fallback **and sibling still present**; unknown prop → stripped, asserted absent from DOM; missing `variant` → default applied; `Button` containing `Form` → child dropped, parent kept; missing required `name` → fallback, **not thrown**; a prop value containing `"<div>"` or `"color: red"` → rejected — this is how "0 outputs containing CSS/HTML/JSX" becomes enforceable before an agent exists |
| Fallback | vitest | `UnknownChart` → `Card` + `Text("This content is unavailable")`, exact copy, rest of tree intact; **every** entry has a `fallback` and every target is registered |
| Renderer | vitest + Playwright | 100% of rendered elements carry a `data-atlas-type` present in the registry; **zero raw `style` attributes**; `axe()` over the composed tree — the repo's first page-level axe; a throwing component renders its fallback, not a blank page |
| State delta | Playwright | Submit invalid → a `state` op with path `form.email`; `Alert` appears with `aria-live` and the field gets `aria-describedby` pointing at it (the `FieldControlProps` handoff); 50 rapid submits → sequence numbers strictly increasing, none dropped; `performance.mark` ack p95 <300ms; fallback p95 <100ms |
| Recovery | vitest, seeded fuzz | 1000 schema-derived malformed payloads → 0 thrown, 1000/1000 render |

**CI:** new blocking `runtime` job (vitest over `registry` + `runtime`); extend the `visual` job with a
second Playwright project on its own port (copy the 3031 pattern → 3032). Fuzz runs in `test` with a
**fixed seed**; a nightly workflow runs a random seed and opens an issue, not a block.

**Latency thresholds:** set the CI gate at **2× the north-star target** to absorb runner noise and
record the real p95 in the ledger. A 100ms gate on a shared runner will flake and get disabled, which
is worse than a 200ms gate that holds.

**Exit (M4):** `app/runtime-demo` renders the form entirely from a JSON tree through the real packages;
deleting the `Alert` registry entry renders the fallback and keeps the rest of the page. **11 metrics
move out of "not measurable".**

---

## Phase 4 — Enforcement hardened (2–3 sessions)

All extensions, no new scripts:

- `atlas-verify`: `registry-complete` (count-may-only-increase ratchet); `figma-age`;
  `deprecation-expiry` (the missing `removeIn` check); `breaking-change` (variant/size/token removal
  without a MAJOR CHANGELOG entry in the same commit — the policy exists as prose, make it a check);
  contrast and horizontal-overflow checks, moving two metrics out of "not measurable".
- Visual: add `app/runtime-demo` sections. Keep `0.01/0.0005` — correct and load-bearing for M5.
- **`ui-native` freeze**: FAIL on any diff under `packages/ui-native` without an `atlas-native-thaw`
  label. Do **not** add it to `SCAN_DIRS` — ports are paused; that surfaces a large debt with no owner.
- **`@theme inline` reduction** — build-time flattening of ~100 tokens cannot express runtime brand
  switching, so this is a **prerequisite for M5, not a consequence**. Cheap, because `ui-web/src` has
  zero Tailwind class literals: `@theme inline` only serves `app/`.
- Populate `ownership.json` `componentOwners` even if it is one handle — an empty map hides the gap.
- **CI reporting:** the `scripts/metrics-report.mjs` generator (built in Phase 1) now has every input
  wired, so one job writes `atlas-report.json`, renders the PR comment, and upserts the generated
  region in `docs/ATLAS-DELIVERY-ROADMAP.md`. `metrics-report --check` is **blocking**: a stale
  committed table fails CI the same way `tokens-build` fails on undiffed native output. Nobody
  hand-edits a status, and a metric with no check reports *not measurable* rather than passing. Plus
  the `registryComplete` ratchet and the D1 coverage fraction. This substitutes for a second reviewer.

---

## M5 — Semantic token tier, one family per reviewable stage (ongoing)

Begins after Phase 4 (the `@theme inline` reduction is a hard prerequisite). **Each token family is its
own stage with its own gate.** Order chosen so the riskiest comes last:

| Stage | Family | Kind | Why this order |
|---|---|---|---|
| M5.1 | `radius` | value-identical | smallest surface, 8 component-token consumers already |
| M5.2 | `spacing` | value-identical | largest surface; run only after radius has proven the method |
| M5.3 | `type` | **may change visuals** | interacts with the responsive `@media` uplift blocks; a semantic type role may not map 1:1 onto the existing scale |
| M5.4 | `motion` | **may change visuals** | interacts with the 36 reduced-motion blocks; `reduced-motion-required` must be live first |
| M5.5 | `shadow` | **may change visuals** | the only non-colour family with a dark override |
| M5.6 | **brand axis** | **changes visuals by design** | needs every family above, plus D1 for a drift gate |

**Every stage declares its kind up front, and the kind decides the visual-regression rule.** Each stage
opens with a `docs/superpowers/plans/` plan whose Global Constraints state the kind; a stage may not
change kind mid-flight — if a "value-identical" stage turns out to need a value change, it stops and
re-opens as a value-changing stage with its own review.

**Kind A — value-identical alias migration (M5.1, M5.2).** The zero-baseline rule applies here and
*only* here:

- **PR-0:** create the semantic variables in Figma → re-sync → add to `atlas.tokens.css` as
  **value-identical aliases** (`--atlas-radius-control: var(--atlas-radius-md)`). No component changes.
- **PR-1..N:** migrate **that one family across all 47 components** — never one component across all
  families. Because the alias is value-identical, the expected diff is **exactly zero changed
  baselines**, so the reviewer's question is "did any pixel move?", which the 0.0005 threshold answers
  mechanically. **A non-zero diff here is a bug, not a baseline to accept** — that is what keeps a
  47-file PR honest.
- Aliases must be value-identical, never "rounded to the nearest scale step" (R8).

**Kind B — value-changing migration (M5.3, M5.4, M5.5, M5.6).** These may legitimately change visuals,
and pretending otherwise would force either a dishonest alias or a blocked stage. The rule is explicit
review, not zero diff:

- The plan names, before any code, **which components and which baselines are expected to change and
  why**. An unexpected baseline change is still a bug; an unlisted one fails review.
- Baselines are regenerated through the existing `visual-baseline.yml` workflow, which opens a PR with
  the new images — so the diff is reviewed as images, in its own PR, never bundled with the CSS change.
- Scope per PR stays one family **and** small enough that the image diff is genuinely reviewable; split
  by component group where a family touches all 47 with visible change.
- Figma-first still applies: the visual change is approved in Figma, then code follows, so the accepted
  baseline matches an approved design rather than ratifying whatever the code produced.
- The accepted change is recorded as a decision in `atlas/state/decisions.json` with before/after
  values, so a later reviewer can tell an intended change from a regression.
- `prefers-reduced-motion` and dark mode are both re-checked for M5.4 and M5.5 specifically, since those
  are the families whose overrides the migration can silently drop.

**Do not** try to make Kind B stages produce zero diffs by introducing compatibility aliases that
preserve old values — that ships a semantic tier whose values nobody intended and defers the real
change forever.

**Component expansion runs in the same phase, gated separately:** a family enters the registry only
when every member has `registryComplete: true`, a generated contract, a test file, and page-level axe
coverage. **First casualty: `Checkbox` has no test file** and cannot enter until it does. Each of the
12 scaffolded components gets a binary call: finish, or mark `status: "scaffold"` and **exclude from the
registry** — excluded means the agent can never emit it, the correct safe default.

**M5.6 caveat:** if D1 lands on option D, the brand axis ships without a Figma-side drift gate and the
doc says so plainly.

---

## Phase 6 — Filtered agent composition (2–3 sessions)

`packages/registry/filter.ts`, enforced **outside** the agent: the agent receives a catalog subset,
**and** the validator independently rejects any `type` outside the subset that produced the request.
The filter is a prompt optimisation; the validator is the guarantee. Assertions: 100% of requests use a
filtered catalog, 0 expose the full 47, and the *validator* rejects an out-of-catalog type even when the
agent emits it.

Only now do the model-dependent metrics become real: first streamed op <250ms p95, ≥50% prompt
reduction, and agent-side CSS/HTML/JSX compliance measured against a model rather than the validator.

---

## Phase 7 — Metrics as release gates

`atlas-report.json` → CI. **Hard gates** for deterministic metrics; **trend gates** (>20% regression
opens a report) for model-dependent ones. Diagnostics: the validator already knows *why* it rejected a
node — emit structured `diagnostics[]` on every response and feed it into a **bounded** repair loop
(max 1 retry, then fallback; unbounded repair turns a 250ms budget into 3s).

**Metric tiering.** *Tier 1 — assertions, not benchmarks; blocking from M4; they live in
vitest/Playwright, not `benchmarks/`:* schema pass rate, size ratio, fallback coverage, mapped-node
rate, safe-render rate, unhandled exceptions, CSS/HTML/JSX in payload, typed event contracts, event
ordering. All deterministic and agent-free; putting them in the bench harness would make hard
guarantees look like trend lines. *Tier 2 — latency, Playwright, blocking from end of M4* at 2× target.
*Tier 3 — bench-only, never a hard gate, Phase 6:* streaming, prompt reduction, agent compliance.

Note the pairing on CSS/HTML/JSX: the vitest version measures *the validator's enforcement* (blocking,
100%); the bench version measures *the agent's compliance* (trend). Both are needed; only the first can
gate.

**Reuse:** `run.sh`'s rep loop/labelling/model pinning, `budget.mjs` + ledgers and caps, `pins.mjs`,
`BENCH_*`, `analyze.mjs` aggregation — all orthogonal to what is measured, and `run.sh` already
dispatches on `meta.json`'s `type`, so `protocol` is a new type, not a new harness. **Do not reuse:**
the three rubrics and the strict pattern-adherence regexes — they score authored code, a concern the
protocol deletes. Keep them for the code-authoring harness running in parallel.

---

## Risks, and the ordering they force

**R1 — Figma token-table access.** See **D1**. Start the spike in parallel with Phase 2; it decides
whether brands are a quarter or a year away.

**R2 — the 12 scaffolded components block any "contracts complete" claim.** Never make one:
`registryComplete` is per-component with a ratchet; M5 gates on completeness *for the family being
added*, never globally.

**R3 — `ui-native` is outside enforcement.** Freeze rather than absorb; registry stays
`platforms: ["web"]`. Residual risk is baking web assumptions into the registry shape — mitigate by
keeping `tokenRoles` and `events` platform-neutral and namespacing DOM-specific things under `web:`.

**R4 — `@theme inline` flattens at build time**, so runtime brand switching is impossible through it.
Forces Phase 4 before M5.

**R5 — one person owns every area** (all `@rizwan-uxd`; `componentOwners` empty). The dominant schedule
risk, interacting with "one component per session" and the four gates. Consequences: every phase
decomposes into single-session units, and enforcement precedes expansion.

**R6 — verification that cannot fail** (no schemas, 1/13 checks tested, untested shared parser).
Everything after it sits on top. **This is why M2 precedes M3.**

**R7 — two sources of truth for props** if the registry/contract boundary is sloppy. The subset
invariant and the one-way generated contract are the mitigations; review that boundary harder than
anything else, because it would not surface for months.

**R8 — the 0.0005 threshold cuts both ways in M5.** It makes Kind A alias-only PRs reviewable, but
cannot absorb a 1px rounding change: value-identical aliases must be exactly that, never "rounded to
the nearest scale step". For Kind B stages the threshold stops being a gate and becomes a *reporter* —
the risk there is the opposite one, accepting a baseline nobody looked at, which is why Kind B requires
the expected-change list and the separate image-diff PR.

**R9 — skill scope creep.** Exactly two new skills. **`atlas-registry`** owns `packages/registry/**`
authored files, `scripts/registry-build.mjs` and the schemas; must NOT touch `packages/ui-web/src`, must
NOT touch `atlas/`, must NOT add tokens or components, must NOT call Figma. **`atlas-runtime`** owns
`packages/runtime/**` and `app/runtime-demo/**`; must NOT author registry declarative fields, must NOT
change components, must NOT create routes under `app/prototypes`. **No `atlas-agent` skill** and no
skill per pipeline stage — that ends with six skills editing three files.

**Non-negotiable orderings:** M1 first (it needs nothing and gates everything downstream); **M2 before
M3** (a verifier that cannot fail will certify a broken registry); **Phase 4 before M5** (enforcement
substitutes for the reviewer who does not exist).

---

## Execution conventions (house style, reused per phase)

Each phase decomposes into a `docs/superpowers/plans/` plan following the proven component-token
template: **Global Constraints → File Structure table → numbered tasks → an explicit owner-approval gate
before any Figma write → final verification/snapshot/decision-record/PR → self-review** (spec coverage,
deviations with reasons, placeholder scan, name-consistency, named open risk).

Verification order, every time:
**token build → token-lint → typecheck → vitest → ESLint → `atlas:verify` → visual regression.**

Figma-first and the four gates apply unchanged to anything touching a component. Commit only when
complete and verified; ask before opening a PR.

---

## Verification of this roadmap end to end

```bash
npm ci
npm run test:scripts                       # 15/15 atlas-verify checks + parser + schemas (M2)
npm test                                   # vitest: components, registry, runtime
npm run token-lint
npx tsc --noEmit                           # generated contracts
node scripts/registry-build.mjs --check    # subset invariant + third leg (M3)
node scripts/metrics-report.mjs --check    # committed metric table matches a fresh CI run
npm run atlas:verify -- --scope "packages/registry/**,packages/runtime/**,app/runtime-demo/**"
npm run test:visual                        # Kind A: zero changed baselines
```

Negative tests that must FAIL — each silently passes today:

1. delete a variant from a code union (**M1**)
2. **set `figmaProperties` to `{}` on one component — must FAIL as unverifiable, not report zero
   drift** (**M1**, fail-closed)
3. **set `figmaProperties.Variant` to a string instead of an array — must FAIL as malformed, not be
   coerced or skipped** (**M1**, inline structural guard)
4. point `atlas-verify` at an empty `atlas/metadata/` — must FAIL on zero inspections (**M1/M2**)
5. corrupt a field in `atlas/metadata/Button.json` (**M2**)
6. author a registry enum member absent from the code union (**M3**)
7. change `--atlas-spacing-4` without regenerating native tokens (**2d**)
8. add a `--atlas-duration-*` transition with no `prefers-reduced-motion` block (**2d**)
9. **hand-edit a status in the generated metric region — `metrics-report --check` must FAIL**
   (**Phase 1/4**)
10. **remove a metric from `metrics.manifest.json` that the north star lists — totality check must
    FAIL** (**Phase 1/4**)
11. let a deprecation's `removeIn` pass (**Phase 4**)
12. delete the `Alert` registry entry — `app/runtime-demo` must render the fallback with the rest of
    the page intact (**M4**)
13. land a **Kind A** migration PR that changes a value — visual regression must show a non-zero diff
    and be rejected as a bug (**M5.1/M5.2**)
14. land a **Kind B** migration PR whose baseline changes were not listed in its plan — review must
    reject the unlisted change (**M5.3–M5.6**)
