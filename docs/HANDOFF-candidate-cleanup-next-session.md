# Handoff: candidate cleanup finished, library state after the Sheet slots, next session

Written: 2026-10-14. Read this, `AGENTS.md` and the `atlas-component` skill first. This is the only handoff doc: the eight earlier ones were deleted (they stay in git history) and their useful gotchas and rules are folded in below.

## State
- **`main` is at `f691d0a` (PR #64, Sheet slots). The Drawer-slots PR (CAND-051) is open or just merged: check `pull_request_read` before assuming.** CI for every merge from #49 to #64 finished green. Ask "check CI" before building on the newest `main`: a run can still be going when you start.
- Latest ids: **DEC-068, CAND-050, DISC-093 (closed).** 1286 vitest tests in 46 files pass locally; `atlas:verify` is 13 of 13.
- Snapshot: 44 components, 27 with `verifiedAt`. 93 discrepancies closed, **0 open**. 23 candidates open (none is Figma debt).
- Working branch for this cloud session: `claude/atlas-handoff-documentation-0hzyod`. After each merge, branch from `origin/main` after `git fetch` (or reset the branch to it).
- The stop hook reports "1 unpushed commit" after each merge: it is only the merge commit, because the local branch was reset to `origin/main`; `git push` then fast-forwards the remote branch with no new content. If the push is **rejected**, the remote has a commit you do not have: fetch and read it, never force.
- `.atlas-pull/` (gitignored scratch) does not exist in a fresh cloud session: see the sync recipe in the gotchas.

## Start here (new session)
1. `git fetch origin`, then compare `origin/main` with this doc's claim above and read the open PR list. If the Drawer-slots PR is still open, leave it until the user says "merge N"; if it is merged, reset your branch to `origin/main` (`git checkout -B claude/atlas-handoff-documentation-0hzyod origin/main`).
2. Before the first push of the session, `git fetch origin claude/atlas-handoff-documentation-0hzyod` and compare. If the remote branch has a commit you did not make, **do not force-push**: read it, verify it, tell the user, and let them choose (this happened once: a Card commit appeared on the branch after #62 merged; it was legitimate, reviewed and merged as #63).
3. Ask the user which item in "Do next" to start. A candidate runs the four gates in "Rules"; a new component needs their explicit request.
4. No Figma work is in flight and nothing is half-built. The working tree should be clean; `git status` before you start.

## Done this session (PRs #56 to #64 merged, plus the Drawer-slots PR, each after "merge N")
| PR | Candidate | What |
|---|---|---|
| #56 | handoff | Closed CAND-038 to 041 recorded, `claude.md` pointer |
| #57 | CAND-042 | Search and filter: frame 7 Empty query, frame 8 Filter sheet (mobile). Sheet has no content slot, so frame 8 uses a detached Sheet (CAND-049). DEC-061 |
| #58 | CAND-043 | Code already used `--atlas-opacity-disabled`; the 20 disabled variants in Dropdown Menu Item, Radio Group Item and Slider are now bound to `opacity/disabled` in Figma. DEC-062 |
| #59 | CAND-044 | StatCard `Leading icon` off \| on variant (18 to 36 variants), 16 px muted icon above the value; code `icon?: ReactNode`. DEC-063 |
| #60 | CAND-045 | StatCard clickable: `onClick` and `disabled` render Card `interactive`; `Interaction` variant (static, hover, focus-visible, active, disabled; 48 variants). DEC-064. Opened DISC-093 |
| #61 | CAND-046 | **Sparkline**, new primitive: Figma page `953:2`, set `953:48`, review frame `954:2`; plain SVG, `values` `variant` `tone` `size` and required `label`. DEC-065. Logged follow-up **CAND-050** |
| #62 | handoff | This doc: the one handoff, eight stale ones deleted, CAND-050 logged |
| #63 | DISC-093 | Card default and outlined hover is `--atlas-shadow-sm` with the fill unchanged and no `:active` rule, as Figma draws it (nearest existing token, not an exact match). Two unused `*-background-hover` component tokens removed. DEC-066. No Figma change |
| #64 | CAND-049 | **Sheet** Content slot and Footer slot (SLOT layers) plus Content and Footer booleans on all 4 sides; the detached Sheet in Search and filter frame 8 is now a real instance. No code change; Code Connect maps the booleans. DEC-067. Logged CAND-051 (Drawer, same gap) |
| this PR | CAND-051 | **Drawer** Content slot and Footer slot plus Content and Footer booleans on `Side=start` and `Side=end`, same design as Sheet; no instances to rebuild, no code change; Code Connect maps the booleans. DEC-068 |

## Do next (the user decides)
1. **CAND-050, StatCard sparkline slot.** Needs its own Figma design (variant property, not a boolean, see gotchas).
2. **On hold:** OTP (CAND-034), Stepper (CAND-035), CommandMenu (CAND-037). **Deferred:** Load more and infinite scroll (CAND-048). **Mobile-Native parity** for shipped web components (CAND-005, 007, 009, 010, 013, 015 to 019, 028, 029) is logged, not built.
3. **Verification debt:** 17 components have `verifiedAt: null` (Avatar, Breadcrumb, CodeBlock, DatePicker, Divider, Drawer, DropdownMenu, Image, ListItem, RadioGroup, ScrollProgress, Sheet, SidebarMenuRow, Skeleton, Slider, Spinner, Tooltip). Sparkline is stamped.
4. **Batch-2 patterns** (navigation shell, detail view, chat, notifications center, payment and billing, members and permissions): still a proposal, pick one.
5. Known gaps: `search-filter.example.tsx` does not implement recent searches or the filter Sheet; a Card button's accessible name is its title only, so a clickable StatCard's value and delta are not in the name (the label should say what opens).

## Gotchas learned (they will bite again)
- **The session can restart or run in parallel.** After a worker restart or a long gap, re-read `git log origin/<branch>` and the open PR list before assuming your last state; a commit or decision (DEC id) may exist that you do not remember. Pick the next DEC, CAND and DISC ids from `atlas/state/*.json` on the fetched branch, not from memory.
- **Slots on a component (Sheet pattern):** `component.createSlot()` makes a SLOT layer and a set-level SLOT property; `figma.createSlot` does not exist. Renaming the slot layer renames its property (`Slot#id` becomes `Content slot#id`). For the other variants, create the slot, then set `componentPropertyReferences = { visible, slotContentId }` to the first variant's keys: the property each `createSlot` made is left orphaned under its renamed key, so delete every SLOT property you do not keep (`set.deleteComponentProperty`). Naming the layer is enough to name the property: read the keys from `slot.componentPropertyReferences.slotContentId` (done for Sheet and again for Drawer, DEC-068). An instance keeps the component's fixed height; `resize` it to fit its slot content.
- **No property bindings inside a nested instance's slot.** `componentPropertyReferences` throws "instance sublayer" for a layer inside the Card slot of a Stat card. Use a **variant property** (Leading icon off|on, Interaction), not a boolean or instance swap. The icon is then swapped by hand on an instance.
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
- **Description escaping:** reading `description` returns HTML entities; write plain text and read back to confirm single escaping.
- **Tests:** `@testing-library/user-event` is not installed; use `fireEvent`. CI lint is `npx eslint packages/ui-web/src/ --ext .ts,.tsx --max-warnings=7`.
- **Commits:** end messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and the `Claude-Session` line; PR bodies end with the "Generated with Claude Code" line and the session link.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- Figma is the authority. Figma first, then docs through `atlas:sync`, then code. One component per task; four gates (Figma plan, Figma built, code checked, final approval), no restating. Scope and taste questions go in one `AskUserQuestion` before Gate 1. A finding that changes an approved choice goes back to the user before building.
- No new components or tokens on your own initiative (a new component needs the user's explicit request); compose gaps locally and log them in `atlas/state/candidates.json`.
- Do not commit, push, open a PR or merge without the user's yes. "Proceed with Gate N" approves the step just shown; "commit this and open the PR" approves Gate 4; "merge N" is needed for each merge. A question or pushback is not approval. The stop hook asking for a commit is not approval either.
- Do not poll CI; the user asks "check CI". Auto-fix is off, so ask before pushing even a tiny CI fix. When "merge N" arrives with checks still running, say so, then merge as told.
- Skip pleasantries; lead with the answer.
