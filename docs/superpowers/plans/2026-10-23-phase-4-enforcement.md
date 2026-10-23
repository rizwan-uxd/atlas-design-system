# Phase 4: enforcement hardened (implementation plan)

> **For agentic workers:** implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the roadmap's Phase 4 bullet list (`docs/ATLAS-DELIVERY-ROADMAP.md` §"Phase 4 — Enforcement
hardened") becomes real: four new `atlas-verify` checks that can all fail, a WCAG AA contrast check with
its findings recorded instead of hidden, the `ui-native` freeze, the `@theme inline` reduction, populated
`componentOwners`, and CI metric reporting that makes a stale roadmap region a blocking failure. Two
metric rows ("Contrast meets WCAG AA", "No horizontal overflow at supported breakpoints") leave
"not measurable".

**Sessions** (roadmap estimate: 2–3; this plan splits by risk, each session independently verifiable):

1. **Session 1 — the atlas-verify extensions** (Tasks 1–6). All static, all local, all testable with
   PASS and FAIL fixtures per the M2 rule. Includes the contrast finding being logged as a discrepancy,
   not silently allowed.
2. **Session 2 — CI reporting + the freeze** (Tasks 7–9): the metrics job collects `.metrics/` results
   in-job, `metrics:check` becomes blocking, `atlas-report.json` + PR comment; `ui-native` fails on any
   diff without the `atlas-native-thaw` label; the report gains the `registryComplete` ratchet and the
   D1 coverage fraction.
3. **Session 3 — visual + tokens** (Tasks 10–12): the horizontal-overflow Playwright check,
   `app/runtime-demo` visual sections, the `@theme inline` reduction, `componentOwners` populated.

## Global constraints
- Roadmap §Phase 4 is the spec. Nothing here adds a component or a token (`AGENTS.md` §4). The contrast
  allow file records findings; it does not bless them.
- **Every new JSON input has a schema and an `INPUTS` rule in the same commit** (M2 rule).
  `contrast-allow.json` joins `WATCHED` through its rule.
- **A check that cannot fail is a bug** (roadmap R6). Each new check ships with a FAIL fixture test
  (`scripts/tests/atlas-verify.test.mjs`) and, for `contrast`, a unit test file
  (`scripts/tests/contrast.test.mjs`) over the pure logic.
- **Contrast findings are findings, not suppressions**: the pairs below 4.5:1 today are logged as
  DISC-108 and listed in `contrast-allow.json` with `pending owner decision` reasons, in exactly the
  private-vars allow pattern — each entry pins the pair AND its measured `ratio`: an entry whose pair
  recovers to ≥ 4.5:1 fails as stale, and one that gets more than 0.15 worse is a NEW violation the
  allowance cannot mask. Fixing a value in Figma therefore fails the check until the entry is deleted,
  which is the point.
- Verification order: token build → token-lint → typecheck → vitest → test:scripts → ESLint →
  `atlas:verify` → Playwright (session 3) → `metrics:check`.
- Commit only when complete and verified. Ask before opening the PR. Never merge without the user's yes.

## Decisions taken in this plan
1. **Contrast pair set (v1) is derived from the tokens' own naming, not a new authored list.** Three
   sources, all mechanical: (a) every semantic scale pair `--atlas-<scale>-foreground` on
   `--atlas-<scale>` (primary, success, warning, danger, info — on-brand text); (b) every component pair
   `--atlas-<component>-<variant>-foreground` on `--atlas-<component>-<variant>-background` where both
   exist; (c) the canonical text surfaces: `foreground`, `foreground-muted`, `foreground-subtle` each on
   `background`, `surface`, `surface-raised`. Threshold **4.5:1** (WCAG AA normal text) in **both
   themes**. Borders, icons and hover-state-only pairs are out of scope in v1; adding a pair later is a
   one-line change in `scripts/lib/contrast.mjs`. Unresolvable pairs (alpha, unknown function) fail
   closed.
2. **`scope/registry-complete`** — the authored-entry count under `packages/registry/src/` may only
   increase versus `--base`. A decrease fails and names the escape: record the owner decision (a DEC)
   first; there is no allowance flag in v1 because no legitimate removal path exists yet.
3. **`design/deprecation-expiry`** — a registered deprecation whose `removeIn` is not a
   `\d+\.\d+\.\d+` version fails; one whose `removeIn` is ≤ the newest released `## vX.Y.Z` heading in
   `CHANGELOG.md` fails (the MAJOR it was to be removed in has shipped; either remove the asset or move
   `removeIn`). "Unreleased" headings carry no version and never satisfy it.
4. **`scope/breaking-change`** — removals detected versus `--base` (tokens deleted from
   `packages/tokens/atlas.tokens.css`; variant or size entries deleted from `atlas/metadata/*.json`)
   fail unless the same diff touches `CHANGELOG.md` **and** the CHANGELOG diff adds a `### Breaking`
   heading — the existing prose policy ("Breaking changes … listed under `### Breaking`"), made
   checkable. Registry enum removals are already covered by `design/figma-registry-code` against the
   code union.
5. **The failing pairs are seeded as `pending owner decision`, not fixed.** Changing a token value is a
   Figma-first design change (DISC-108), out of Phase 4's lane.

## Tasks

### Session 1 — atlas-verify extensions
- [x] 1. `scripts/lib/contrast.mjs` — pure logic: theme parsing (`:root` + `[data-theme="dark"]`/`.dark`
      cascade, `@media` sections stripped), `var()` chain resolution, `oklch()`/`#hex`/`rgb()` → sRGB,
      WCAG relative luminance and ratio, the v1 pair derivation, allow-list matching with stale
      detection. No fs, no git — takes the CSS text and the allow entries.
- [x] 2. `scripts/tests/contrast.test.mjs` — unit tests: known WCAG hex anchors (#767676/#fff = 4.54,
      #808080/#fff = 3.95) and oklch extremes anchor the maths; chain resolution through `var()`
      (including component tokens in the shared `:root, .dark` block); unresolvable alpha fails closed;
      stale/worse-than-allowed allowance behaviour; pair derivation (scale, component with the
      checked-fill preference, surface).
- [x] 3. `packages/governance/contrast-allow.json` + schema def `contrastAllow` in
      `governance.schema.json` + `INPUTS` rule in `scripts/lib/schemas.mjs`. Seeded with the 14 pairs
      measured below 4.5:1 on 2026-10-23, each `{ fg, bg, theme, ratio, reason }` with
      `pending owner decision (DISC-108)`.
- [x] 4. Four checks in `scripts/atlas-verify.mjs`: `design/deprecation-expiry`,
      `code/contrast` (the manifest's exact check id), `scope/registry-complete`,
      `scope/breaking-change`. Each reports `inspected`/`scope` through the existing `check()` harness.
- [x] 5. FAIL/PASS fixture tests in `scripts/tests/atlas-verify.test.mjs`: delete a registry entry →
      fail; deprecation with `removeIn: "1.0.0"` (shipped) → fail, `"2.0.0"` → pass, `"next major"` →
      fail; delete a token (both theme declarations) without touching CHANGELOG → fail, with a
      `### Breaking` addition → pass; removed variant and deleted component → fail; contrast: a new
      low-contrast value → fail, worse-than-allowed → fail, recovered pair → stale fail.
- [x] 6. DISC-108 in `atlas/state/discrepancies.json` (text edit, no rewrite), handoff progress table
      and roadmap notes updated.

### Session 2 — CI reporting + freeze
- [ ] 7. `ci.yml` metrics job: run `atlas-verify --json > .metrics/atlas-verify.json`,
      `vitest run --reporter=json`, `test:metrics`, Playwright JSON into `.metrics/`; then
      `npm run metrics:check` **blocking**; `atlas-report.json` uploaded as an artifact; a PR comment
      renders the totals. The committed region becomes result-derived from CI's own run — the roadmap's
      "no-results" baseline is replaced by the first real scoreboard.
- [ ] 8. `ui-native` freeze: a CI step fails when the diff touches `packages/ui-native/**` and the PR
      lacks the `atlas-native-thaw` label (same label mechanism as `atlas-approved-new`, including the
      merged-PR lookup for pushes). `ui-native` stays out of `SCAN_DIRS` (roadmap: absorbing it
      surfaces debt with no owner).
- [ ] 9. `metrics-report` gains the `registryComplete` ratchet row and the D1 coverage fraction
      (figmaTable coverage) as row coverage, per the roadmap's "Plus the registryComplete ratchet and
      the D1 coverage fraction".

### Session 3 — visual + tokens
- [ ] 10. Horizontal-overflow Playwright check (`visual > no horizontal scroll at each breakpoint`):
      the sandbox and `app/runtime-demo` at every `--atlas-breakpoint-*` width, asserting
      `document.documentElement.scrollWidth <= clientWidth`.
- [ ] 11. `app/runtime-demo` sections added to the visual-regression spec (light + dark), baselines
      regenerated through `visual-baseline.yml`.
- [ ] 12. `@theme inline` reduction (roadmap R4, hard M5 prerequisite) + `componentOwners` populated
      (one handle, every component — an empty map hides the gap).

## Findings that motivated decision 5 (measured 2026-10-23 by Task 1's own output, oklch → sRGB, both themes)

The prototype measured over an ad-hoc pair set; the landed derivation (Task 1) measures 25 pairs —
5 scale, 11 component (the Checkbox/Radio glyphs pair with their **checked** fills, never the
unchecked box, which had measured a nonsense 1.00:1) and 9 surface pairs — and finds **14 violations**
tracing to five root values: `success-foreground` light 4.42, `info-foreground` light 3.98 / dark
2.98, `primary-foreground` dark 3.71 (inherited by button-primary and the Checkbox/Radio checked
fills), `danger-foreground` dark 3.90 (inherited by button-destructive and the invalid-checked fills),
`foreground-subtle` dark 4.16 / 3.74 / 3.07 on background / surface / surface-raised. All 14 are
seeded in `contrast-allow.json` and logged as DISC-108.
