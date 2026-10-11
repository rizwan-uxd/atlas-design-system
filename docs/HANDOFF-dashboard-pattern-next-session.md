# Handoff: Dashboard pattern pilot, next session

Written: 2026-10-11, after the Select, Alert and Card PRs merged. Read this, `AGENTS.md`, and `packages/governance/patterns/dashboard.md`. Start at **Phase 3** below; the Phase 2 readiness gate has already passed.

## State — read this before touching git
- `main` is at `5d765d6` (merge of #18). **#16 Select, #17 Alert and #18 Card are merged**, along with #13 (patterns batch 1).
- Open PRs, all green and `CLEAN`, none of them blocking the Dashboard work. Ask the user to merge (they merged these themselves; an agent `gh pr merge` was blocked by the auto-mode classifier three times, then worked once the user said "merge" explicitly):
  - #14 search-count layout fix on the search-filter example.
  - #15 `docs/atlas-dashboard-coverage.md` completed for the 7 listed rows (read it: it names the gaps and the next pattern per row).
  - #19 DISC-084 closed: `atlas-sync` `props()` now reads `export type XProps = (A | B) & {...}`, so DatePicker's root lists its props.
- Nothing has been written to Figma for the Dashboard page yet. No `Pattern / Dashboard` page exists.
- Working tree was clean on branch `chore/readiness-gate` (from `main`) when this was written; this handoff file is the only change on it.

## The plan being executed (user-approved)
Figma-first pattern workflow. Per pattern: reference and plan → **Figma page with guideline cards** → code md + example → sync, verify, browser render → PR. The user reviews the Figma page **before** any code.

| Phase | What | Status |
|---|---|---|
| 0 | Component readiness audit | Done |
| 1 | Missing components, separate PRs | Done: #16 Select, #17 Alert, #18 Card (Gate 1 to 4 each) |
| 2 | Readiness gate on merged `main` | **Passed** (details below) |
| 3 | Dashboard Figma page, then **stop for the user's Figma review** | **Next. Not started.** |
| 3b | After approval: update `dashboard.md` and the example to match; add and test the Figma-metadata validation in `atlas-sync`; sync, scoped verify, browser render, tests, CI; open the pattern PR. **Do not merge it yourself.** | After 3 |

### Phase 2 gate result (run on `main` `5d765d6`)
- 317 tests pass across Select, Alert, Card, DatePicker, Switch, Button, Chart, Skeleton, Table, Badge; all 10 have contracts; `tsc` clean; `atlas:sync --check` writes 0 files.
- Figma read live: Alert has `Actions` (boolean) and `Actions slot` with Retry + Dismiss pre-filled; Card has `Content` and `Footer` booleans with `Content slot` and `Footer slot`; Select, Button (288 variants), Switch, Chart (default/loading/empty), Skeleton, Badge, Table and the range calendar `688:391` are all there.

## Phase 3: build the `Pattern / Dashboard` Figma page
File key `cKYhfaHLCoyMHi9nKr63Ig` (Atlas Design System). Load the `figma-use` skill before any `use_figma`, and `figma-generate-design` for the page build. The components are **local to this file**, so use `getNodeByIdAsync` with the ids below (the skill's `search_design_system` flow is not needed).

**Page:** new page `Pattern / Dashboard`. No Patterns section exists in the file; the file has component pages, then dividers "———— Mobile · Icons ————" and "———— Work in progress ————". Proposed default: place it at the end of the Components group, just before "———— Mobile · Icons ————" (after "Animated components"). Confirm with the user if in doubt.

**Convention to mirror:** the Table page (`674:2`) has `Examples - Light`, `Examples - Dark` and a `Usage` frame (`675:268`): a plain text frame with a short intro, then USE WHEN / DON'T USE WHEN / DO / DON'T / CODE. The pattern page should carry the same four guideline cards (Use when, Don't use when, Best practices, Anti-patterns) with the **same wording as `dashboard.md`**.

**Six frames (the user said six; "In context" with Sidebar and NavBar was my optional seventh):**
1. Default, desktop: filter row (range Select presets + custom range DatePicker, Compare Switch, Export outline Button), 4 KPI Cards, one Chart, one table card.
2. Loading: Skeleton in the shape of the content, `Chart state="loading"`.
3. First-use empty: the whole dashboard empty, composed per the Empty state pattern (icon, heading, text, one primary Button).
4. One card failed: `Alert variant="danger"` with `Actions` on (Retry) in place of the Chart; the other cards unaffected.
5. Filtered: a non-default filter, Reset ghost Button visible.
6. Mobile 390 px: filters wrap, KPI cards stacked, table scrolls horizontally.

**Composition decisions already made (do not re-ask):**
- Range presets are a `Select` of presets plus a custom-range `DatePicker` (composed; no new component). Presets: Last 24 hours, Last 7 days, Last 30 days, Custom range.
- Compare to previous period: a `Switch` with a text label beside it (Figma's Switch draws only the track; code uses the `label` prop).
- Export: `Button variant="outline"`. Reset: `Button variant="ghost"`.
- KPI card: `Card` (outlined) with Content slot on; value as large text plus a `Badge` delta (`success`/`danger`/`neutral`, sm) with the words "Up/Down x% vs previous period".
- Out of scope for v1: Tabs, multi-select filters, KPI info icon, sparkline, per-chart range control.

### Figma node ids and facts found (read-only inventory)
| Part | Node | Notes |
|---|---|---|
| Alert set | `127:24` | props `Dismissible`, `Actions`, `Actions slot`, Variant, Size; 15 variants |
| Card set | `110:24` | 60 variants; `Content`/`Footer` booleans and slots; slots pre-filled ("Card content" text, Button outline sm "Action") |
| Select set | `630:75` | 24 variants; text layers `Value` / `Placeholder` (Inter 16 at md) |
| DatePicker trigger set | `680:56` | 12 variants; text layer `Value` (Inter 14); range calendar component `688:391` |
| Button set | `19:2` | outline sm default `18:104`, ghost sm default `18:155`; label text must be set on the text node (no TEXT property) |
| Badge set | `123:24` | Variant success/danger/neutral/info/primary/warning × sm/md/lg × State × Appearance; text layer `Badge` |
| Chart set | `660:247` | `Title`, `Description` TEXT props, `Stats`, `Legend` booleans, State default/loading/empty; **fonts are Nunito Sans, not Inter** (existing inconsistency, not part of this task) |
| Skeleton set | `531:5` | Shape rect / circle |
| Switch set | `95:114` | 30 variants incl. an `Invalid` boolean |
| Table | head set `674:68`, cell set `674:9`, row set `674:137` | the Table page's `Examples - Light` (`675:74`) shows the composed toolbar + table + caption; reuse that structure |
- Spacing variable `spacing/2` is `VariableID:2:57`, `spacing/3` is `VariableID:2:58`; colour variables include `foreground` (`VariableID:3:12`) and `foreground-muted` (`VariableID:3:13`). Atlas binds spacing, gap, radius, strokes and text fills to variables; do the same, no hardcoded values.
- Mobbin references used for the plan (screens): Mintlify `205aefea-2dfc-4668-9af7-bc4921da1762`, Calendly `1d417c2e-234a-4bf0-a87e-dc65703c2b64`, AirOps `ef4f113f-b98a-49b6-a028-4b43d9de78df`, Klaviyo `f6c1c1d1-fffc-49eb-a930-a48b4a5b3103` and its empty dashboard `391490e9-d138-410f-b871-a214fdd30901`, Sweatpals `23d13250-71ca-422c-a7e6-c35c4914c548`, Customer.io `94e68021-6e22-4d15-a104-f04b8b28517c`, Square `7741359d-bee6-4ffa-bc2e-fbebaddb4281` (all at `https://mobbin.com/screens/<id>`).

### Build approach
Create the wrapper first in its own call, then build each frame directly inside it. Work in retry-safe phases: (1) page, wrapper and the four guideline cards, (2) frame 1, (3) frames 2 to 5, (4) frame 6. Return node ids from every call. One composition screenshot at the end (and one more only after a fix), in light and dark. Finish with a read-back: no flattened screenshot of the whole UI anywhere, text in the product font (Inter), no leftover placeholder text such as "Card content". Stop and show the user the page and node ids for review before any code.

## Gotchas learned this session (they will bite again)
- **Figma slots:** `createSlot()` gives each slot a **white fill and clipping**. Always set `fills = []`, `strokes = []`, `clipsContent = false`. It also creates one property per slot, so unify all slots onto one shared property via `componentPropertyReferences` and delete the extras. Slots can sit nested inside a frame (move them with `appendChild`).
- **Figma description escaping:** reading `description` returns HTML-escaped text (`&#39;`, `&amp;`, `&lt;`); writing it back escapes again. Decode first, edit, then write the decoded text, and read back to confirm single escaping.
- **Property names** come from the slot node name; a boolean with the same name gets a numeric suffix. Name slots "Actions slot" and the boolean "Actions".
- **`atlas-figma-sync`:** a full `--pull` re-stamps `syncedAt` on all generated files. To refresh one component, edit its entry in `.atlas-pull/pull.json` (gitignored scratch) and keep the original `pulledAt` (`2026-10-10T17:05:52.269Z`); otherwise 90+ files change. Boolean and slot properties never appear in the pull (it only reads variant values), so they reach `atlas/<Name>.md` only through the Figma description text.
- **`atlas:verify --stamp`** does nothing when no file under the component's library folder changed; use `--stamp-components <Name>` for that case.
- **Visual Regression:** an intended visual change fails CI until the Linux baselines are regenerated. Run the `Visual baseline` workflow (`gh workflow run "Visual baseline" --ref <branch>`). It pushes a `visual-baseline/<run>` branch but cannot open its PR (repo setting "Allow GitHub Actions to create and approve pull requests" is off), so cherry-pick that commit onto the PR branch and push.
- **Parallel PRs touching `atlas/state/status.json`** conflict on adjacent rows; keep both `verifiedAt` stamps.
- Code Connect: `figma connect parse` reports `ParserError` for Avatar, Breadcrumb, DatePicker, DropdownMenu, ListItem, Select, Slider and Toast on `main`. Exit code is 0, and CI passes. Not caused by recent work.
- Card `parity` in `status.json` stays `open` on purpose: the header `leading` and `action` slots exist in code but Figma does not draw them, and the sync does not detect prop-level drift.
- Existing Alert drift between Figma and code (no accent bar in Figma, body gap 2 vs 4, title colour, radius by size) is unlogged and untouched.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- No new components or tokens on your own initiative; a gap is composed locally and logged in `atlas/state/candidates.json`. Latest ids: DEC-057, CAND-037, DISC-092.
- No Figma writes outside the approved plan; no benchmark spend; no unrelated cleanup; do not touch PRs #14, #15 or #19.
- Follow the four gates for any component change (Figma plan, Figma built, code checked, final approval). A pattern page uses the user's Phase 3 flow: build, then stop for Figma review.
- Do not merge the pattern PR yourself. Ask before pushing a CI fix if Auto-fix is off; the app's Auto-fix is currently on only for #17 (merged).
- Skip pleasantries; lead with the answer.

## Queue after the Dashboard pilot
1. Repeat the Figma-first workflow for the other 8 patterns (auth, onboarding, search-filter, data-table, empty-state, error-recovery, form, settings), one pattern per task.
2. The one-page entry doc (`atlas/README.md`-style: what Atlas is, what not to hardcode, how to verify, how agents change UI).
3. New patterns (batch 2): list not decided.
4. Optional, only with the user's approval: promote candidates CAND-030 to CAND-037; multi-select and search-in-menu for `Select`, and a KPI sparkline, have no candidate yet (see `docs/atlas-dashboard-coverage.md`).
