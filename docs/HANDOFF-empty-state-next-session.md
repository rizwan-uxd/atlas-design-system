# Handoff: EmptyState built, next promotions queued

Written: 2026-10-12. Read this, `AGENTS.md`, and the `atlas-component` skill before touching a component. Supersedes `HANDOFF-patterns-and-library-gaps-next-session.md` for what to do next.

## State
- **EmptyState is built and committed, not pushed:** branch `feat/empty-state`, commit `a780747`, cut from `main` at `8458332`. It went through all four gates (user approved Figma plan, Figma built, code checked). `atlas:verify --stamp` passed 13/0/0 and stamped `verifiedAt`. Needs: push, PR, user "merge".
- **PR #34 is open** (branch `docs/handoff-patterns-and-library-gaps`, 2 commits): the previous handoff doc, `Progress.Percent` in `atlas/metadata/Progress.json`, candidates CAND-038 to CAND-043 in `atlas/state/candidates.json`, and `docs/ATLAS-START-HERE.md`. No CI results yet when last checked. Auto-fix is off: ask before pushing any CI fix.
- Other open PRs from earlier sessions, untouched: **#19**, **#15**, **#14**. The user merges; `gh pr merge` only after they say "merge" in chat.
- **Conflict to expect:** `feat/empty-state` and #34 both edit `atlas/state/candidates.json` (EmptyState removes CAND-030; #34 appends CAND-038 to 043) and `atlas/state/status.json`. Whichever merges second may need a small resolution. Do not re-add CAND-030.
- Tests: 1145 vitest across 41 files, 52 script tests. Latest ids: DEC-059, CAND-043, DISC-092.
- This session's worktree: `.claude/worktrees/vigilant-clarke-f5b61a`, currently on `feat/empty-state`, clean.

## EmptyState facts (Figma file `cKYhfaHLCoyMHi9nKr63Ig`)
- Page `EmptyState` `858:2` (after Scroll Progress). Component set `858:60`: variants `Size=sm` `858:3`, `md` `858:22`, `lg` `858:41`. Review frame (Light and Dark instances) `858:9309`.
- Properties: `Icon` (swap, default search-x `322:10216`), `Title`, `Description`, `Action` (swap, Button primary md), `Secondary` (boolean, off), `Secondary action` (swap, Button ghost md). No case variant (DEC-003): first use, no results and cleared are content.
- Code: `packages/ui-web/src/compositions/EmptyState/`. Props `size`, `icon`, `title`, `description`, `action`, `secondaryAction`. `role="status"`, icon `aria-hidden`, no surface, fills the width (the user rejected any max width).
- **Deviations to know:** md and lg icons are an explicit 32 px in Figma (binding the glyph's width or height resets it to 24, so it cannot bind to `icon/size/lg`); stroke is bound to `icon/stroke/lg`. The Figma default variant is `sm` (first child) while the code default is `md`.
- Sample labels "Clear search" and "Learn more" are overrides on the nested Buttons (Button has no label text property).

## Do next (suggested order)
1. **Push `feat/empty-state` and open the PR** (the user has not asked yet; ask). Bind it with `bind_pr` (`url` parameter) after opening.
2. **Follow-up task, separate PR:** update `packages/governance/patterns/empty-state.md` and `examples/empty-state.example.tsx` (they still say "no EmptyState component, compose locally") and the Figma `Pattern / Empty state` page (`819:2`) to use the component. Skipped on purpose to keep the component commit to one component.
3. **Next promotion: Field (CAND-032)**, then Stat card (CAND-036), Pagination (CAND-031), PasswordInput (CAND-033). On hold: OTP (CAND-034), Stepper (CAND-035), CommandMenu (CAND-037). The user approved this order; each is its own task through the four gates, Figma first.
4. Batch-2 pattern list: proposal only, not chosen. Candidates in rank order: navigation shell, detail or record view, chat, notifications center, payment and billing, members and permissions, command menu. Needs the user to pick.
5. Optional: Code Connect publish (outward-facing, only if asked).

## Known gaps (also logged as CAND-038 to CAND-043 in #34)
- The snapshot records Figma variant axes only: Input `Leading icon` / `Trailing icon` booleans and slots, Badge `Removable` are not in `metadata.figmaProperties`. Fix needs a change to `scripts/atlas-sync.mjs`; not done.
- Input `prefix`/`suffix` exist in code only; Chart plot is fixed width in Figma; Progress `Value text` does not follow `Percent`; Search and filter lacks an empty-query state and filter Sheet; Dropdown, RadioGroup and Slider still hand-set the disabled opacity.
- Code Connect `figma connect parse` reports ParserError for Avatar, Breadcrumb, DatePicker, DropdownMenu, ListItem, Select, Slider, Toast (exit code 0, CI passes).
- Figma pages already use the new Input icons (done this session, Figma only): search icon on all six Search and filter inputs, eye icon on the Auth password field.

## Gotchas learned this session
- **`.atlas-pull/pull.json` (gitignored scratch):** it now holds `Progress` with `Percent` (belongs to #34) and an `EmptyState` entry with the full description. While `feat/empty-state` is the base, a `--pull` sync will write `Progress.json` with `Percent`; drop `Percent` from the scratch first, or wait until #34 merges. Keep `pulledAt` at `2026-10-10T17:05:52.269Z` to avoid re-stamping 90+ files.
- **Guidance validation:** the sync rejects a Figma description without `USE WHEN`, `DON'T USE WHEN` and `HOW TO USE` sections with `· ` bullets (copy Alert's shape). Figma stores `'`, `"` and `<` as HTML entities when read back (Alert too); the generated docs come out plain.
- **Figma icons in an instance:** resizing an Icon instance or its inner frame does not scale the glyph; `rescale(32/24)` on the instance does. Binding `width`/`height` to a variable then undoes it. `strokeWeight` on the inner vectors can bind to `icon/stroke/*`.
- **Figma component set build:** add component properties to the set after `combineAsVariants`, then set `componentPropertyReferences` on each variant's nodes (`mainComponent`, `characters`, `visible`). `setProperties` on instances needs the full key (`Secondary#858:16`).
- **Screenshots:** the Browser pane is hidden, so `computer screenshot` times out and dev HMR reloads cut off scripts. Playwright works: `chromium.launch({ executablePath: ~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell, args: ["--disable-gpu","--no-sandbox"] })`, no `fullPage`, `animations: "disabled"`. Use a temp route on `npx next dev -p 30NN`; delete the route and `.next/dev/types` afterwards.
- **Hand edits in `atlas/state`:** `candidates.json` is stamped "do not hand-edit" but is edited by hand for gaps; run `npm run atlas:sync` afterwards so `compactJson` reformats it. A new component needs a `status.json` row added by hand and `--allow-new-component` on `atlas:verify`.
- `git commit` attribution: end messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Older gotchas still apply (visual baselines via the "Visual baseline" workflow, `--stamp-components <Name>` when only companions change, macOS `sed -i ''`, opacity variables are percent in Figma and fractions in CSS, `removeLabel` on Badge). See the previous handoff.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- Figma is the authority. Figma first, then docs through `atlas:sync`, then code. One component per task; four gates (Figma plan, Figma built, code checked, final approval), no restating. Scope and taste questions go in one `AskUserQuestion` before Gate 1.
- No new components or tokens on your own initiative; compose gaps locally and log them in `atlas/state/candidates.json`.
- Do not commit, push, open a PR or merge without the user's yes. "Proceed", "Approve" and "Proceed with Gate N" approve the step just shown; a question or pushback is not approval.
- Skip pleasantries; lead with the answer. Prefer graft skeleton, ask and grep over reading whole files. Do not show graft token savings unless asked.
