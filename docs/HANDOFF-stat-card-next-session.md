# Handoff: Field, EmptyState and StatCard are on `main`; follow-ups queued

Written: 2026-10-12. Read this, `AGENTS.md`, and the `atlas-component` skill before touching a component. Supersedes `HANDOFF-empty-state-next-session.md` (stale: it still says EmptyState is unpushed).

## State
- **`main` is at `379117c`, CI green** (run 38254991823, all 9 jobs). Merged this session, all with a merge commit: #35 EmptyState (`88283b5`), #36 Field (`f712592`), #37 CI fix (`8fdbbb2`), #38 form pattern uses Field (`c6b3cc9`), #39 StatCard (`379117c`).
- **Open PRs, untouched, all mergeable and clean:** #34 (handoff docs, Progress.Percent sync, CAND-038 to 043), #19 (sync extracts props from an intersected union type, closes DISC-084), #15 (dashboard coverage audit), #14 (search result count on one line). Each is 35+ commits behind `main` but merges without conflicts; a throwaway merge of #19 onto `main` kept `snapshot-current` passing. #34 also merges cleanly.
- The user merges; run `gh pr merge --merge` only after they say "merge N". `--admin` was used twice (#36, #37) and only because the user said "merge N as admin". Never use it unprompted.
- Latest ids: DEC-059, CAND-046, DISC-092 (DISC-093 was a stale-pull artifact, not in state).
- This session's worktree `.claude/worktrees/vigilant-clarke-f5b61a` is on local branch `feat/stat-card` (merged). A scratch worktree `wt-es` sits in the session scratchpad; remove with `git worktree remove --force <path>` if it still exists. Old local branches (`feat/field`, `feat/empty-state`, `docs/form-pattern-field`, `ci/allow-approved-new-on-push`) can be deleted.

## CI facts that cost time this session
- **`atlas-approved-new` label is required** on any PR that adds a component or token, or Atlas Verify fails `no-new-components`. On a push to `main` the workflow now looks up the merged PR's labels (`ci.yml`, #37), so merging a labelled component PR keeps `main` green. Proven by #35 and #39.
- **CI reads labels from the PR event payload.** A label added after the PR opens is not seen, and "Re-run failed jobs" reuses the old payload. `gh pr create --label` still adds the label just after the opened event. Fix that worked: `gh pr close N && gh pr reopen N` (a `reopened` event carries the labels). A pushed commit also works.
- **Open gap, needs user approval:** add `labeled` to `pull_request.types` in `ci.yml` so the label is picked up without reopening (it would fire a full CI run per label).
- Auto-fix is on for #35 to #39 in the session that ran them. Auto-fix wakes the session on failure, conflict or comment only, not on success. Do not poll CI; the user asks "check CI".
- A failed script test in `scripts/tests/atlas-sync.test.mjs` (pattern validation, test 6) anchors on the `- \`Label\` variant:` line of `packages/governance/patterns/form.md`. Keep that line in the Components list.

## What was built (Figma file `cKYhfaHLCoyMHi9nKr63Ig`)
- **Field** (compositions): page `863:199`, set `863:254`, review frame `863:10076`. Props `size`, `label`, `required`, `optional`, `helpText`, `error`, `disabled`, `id`, children as a render prop `(control) => <Input {...control} />` with `id, invalid, disabled, aria-describedby, aria-required`. Figma properties: `Size`, `Help`, `Help text`, `Invalid`, `Error text`. Label and Control are nested instances (no `Control` swap property: a set-level default cannot vary by Size). Error icon is `icon/size/xs`.
- **EmptyState** (compositions): page `858:2`, set `858:60`, review `858:9309`. Details in the old handoff. md and lg icons are an explicit 32 px.
- **StatCard** (compositions): page `867:80`, set `867:351` (18 variants: Size × State × Sentiment), review `867:9896` (Light, Dark, Mobile). Props `size`, `label`, `period`, `value`, `delta = { text, trend, sentiment?, trendLabel? }`, `loading`. It prepends Up, Down or Flat to `delta.text`. Wraps `Card variant="outlined"`; `aria-busy` is on an inner wrapper because Card forwards no extra props. Figma properties are `Size`, `State`, `Sentiment` only (see gotchas).
- **Figma `Pattern / Form`** (`826:332`): all 15 hand-built field frames replaced with Field instances (done, Figma only).
- CAND-032 and CAND-036 promoted. New deferred candidates: **CAND-044** StatCard leading icon, **CAND-045** StatCard clickable, **CAND-046** Sparkline.

## Do next (suggested order)
1. **Dashboard follow-up, separate PR:** `packages/governance/patterns/dashboard.md` and `examples/dashboard.example.tsx` still hand-wire KPI cards (Card + paragraph + Badge). Move them to `StatCard`. Figma shows the value at 30 px (`font-size/3xl`); the example uses `font-size-2xl` (24 px). Figma wins. Then update the Figma `Pattern / Dashboard` page (`817:226`, KPI row frames named `KPI row` / `KPI value`) to StatCard instances, which needs the user's approval for the Figma write. Keep it isolated from other work.
2. **Auth and onboarding patterns** (`packages/governance/patterns/auth.md`, `onboarding.md` and their examples) still hand-wire Label + Input + error text. Move them to `Field`, one PR, plus their Figma pages (`836:2`, `832:2`).
3. **Next promotions** (the user approved this order; each is its own task through the four gates): **Pagination (CAND-031)**, **PasswordInput (CAND-033)**. On hold: OTP (CAND-034), Stepper (CAND-035), CommandMenu (CAND-037). Candidates 038 to 043 are in #34.
4. Decide with the user: merge the open PRs #34, #19, #15, #14, and whether to add `labeled` to `ci.yml`.
5. Batch-2 pattern list is still a proposal: navigation shell, detail or record view, chat, notifications center, payment and billing, members and permissions, command menu.
6. Optional: Code Connect publish (outward-facing, only if asked).

## Gotchas learned this session
- **Figma nested instances:** `componentPropertyReferences` cannot be set on a node inside a nested instance, including content inside a SLOT ("Cannot set component property references on instance sublayer"). So Field and StatCard cannot expose Label, Value or Delta as properties; the guidance text says to edit them in the nested instance.
- **Instance-swap property cannot vary per variant.** It forces one default into every Size. Swap the nested instance instead.
- **Auto layout:** a hug frame whose only child is hidden keeps a stale height; put help and error rows directly in the root instead of a wrapper. Wrapped component sets (`layoutWrap`) report a stale height of 100; set `counterAxisSizingMode='FIXED'` and resize from the children's bottom edge.
- **Fonts in Figma:** Atlas text is Nunito Sans (Label, Input), not Inter. Load `Nunito Sans` SemiBold and Regular before editing text; `use_figma` rolls the whole script back on an error, so a failed run leaves nothing behind.
- **Sync, entities and the pull file:** `.atlas-pull/pull.json` (gitignored scratch) must be patched by hand each time: it holds Field, StatCard and EmptyState entries now, and it predates other components' newer descriptions (a full `--pull` would rewrite `atlas/Alert.md` and `atlas/Card.md` from older text, which is unrelated churn; revert them). Descriptions read back from Figma carry HTML entities (`&#39;`); decode with `html.unescape` before putting them in the pull file, or the sync's guidance check fails on `DON'T USE WHEN`. If a component is missing from the pull, the sync files a bogus "not found in Figma" discrepancy.
- **`status.json` row** for a new component needs `"verifiedAt": null` before `--stamp` will stamp it. `atlas:verify` fails `paths` if an untracked doc sits in the worktree; move it aside for the stamped run (or keep `docs/HANDOFF-*.md` out of the worktree).
- **Local `main` goes stale.** Branch from `origin/main` after `git fetch`; Field's first PR conflicted because its branch was cut from an old local `main`.
- Use the `sync_with_base_branch` tool to merge `origin/main` into a branch. Merge conflicts in `atlas/index.md` and `candidates.json` are resolved by taking `origin/main`, re-applying your edit, and re-running `node scripts/atlas-sync.mjs` (index.md is generated).
- Screenshots: `get_screenshot` returns a short-lived URL; `curl` it into the scratchpad and `Read` the PNG.
- `git commit` attribution: end messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- Figma is the authority. Figma first, then docs through `atlas:sync`, then code. One component per task; four gates (Figma plan, Figma built, code checked, final approval), no restating. Scope and taste questions go in one `AskUserQuestion` before Gate 1.
- No new components or tokens on your own initiative; compose gaps locally and log them in `atlas/state/candidates.json`.
- Do not commit, push, open a PR or merge without the user's yes. "Proceed with Gate N" approves the step just shown; "merge N" is needed for each merge; a question or pushback is not approval.
- Skip pleasantries; lead with the answer. Prefer graft skeleton, ask and grep over reading whole files. Do not show graft token savings unless asked.
