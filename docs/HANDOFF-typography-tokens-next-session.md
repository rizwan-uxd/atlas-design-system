# Handoff: typography and token binding (Phases A to C done, Phase D next)

Written: 2026-10-12. Read this, `AGENTS.md` and the `atlas-component` skill first. Supersedes `HANDOFF-stat-card-next-session.md` and `HANDOFF-empty-state-next-session.md` (both stale).

## Open PRs (all merge only on "merge N")
| PR | Branch | State |
|---|---|---|
| **#40** | `feat/alert-lucide-icons` | Lucide icons in Alert and Dialog close, glyphs out of the sandbox. Baselines regenerated and pushed (`520523e`). CI re-run: Visual Regression **pass**; Tests and Atlas Verify were still pending, so check CI, then wait for "merge 40". |
| **#42** | `fix/checkbox-badge-textarea-typography` | Checkbox, Badge, Textarea, NavBar, Sidebar typography (CSS only) plus the `--atlas-duration-normal` to `base` fix in NavBar. Everything green except **Visual Regression** (expected). Needs its own baseline run **after #40 merges**, branch `fix/checkbox-badge-textarea-typography`. |
| #34, #19, #15, #14 | older | untouched, mergeable (see the stat-card handoff for context) |

#41 (auth and onboarding use Field, CAND-047) is **merged** (`6b1488f`).

### Visual baseline procedure
- Actions → Visual baseline → **Run workflow** (green button, a new run, never "Re-run" on an old run) → "Use workflow from" the PR branch. Re-run reuses the run id, so the branch `visual-baseline/<id>` already exists and the push is rejected.
- The final step (open a PR) fails unless the repo setting **Actions → General → "Allow GitHub Actions to create and approve pull requests"** is on. It is off. Without it the run still pushes `visual-baseline/<run id>`; fast-forward that commit onto the PR branch (`git push origin origin/visual-baseline/<id>:refs/heads/<pr-branch>`), then delete the `visual-baseline/*` branch.
- The Claude Code permission system **denied** `gh workflow run` and editing the permission rule, three times. The user has to start the workflow in the GitHub UI, or add `Bash(gh workflow run:*)` themselves.
- Order: run baselines for #40's branch first; after #40 merges, rebase or merge `main` into #42's branch and run baselines for it. Both PRs change the same PNGs under `tests/visual/sandbox.spec.ts-snapshots/`.

## Figma file `cKYhfaHLCoyMHi9nKr63Ig`: what changed this session
- **Alert set `127:24`** (all 15 variants): Ellipse placeholder replaced with Lucide instances (info, circle-check, triangle-alert, circle-x, neutral = info); sm icon 16 px; hidden dismiss lines replaced with a Lucide `x` instance (still tied to `Dismissible`).
- **Auth `836:2` and Onboarding `832:2` pattern pages:** 10 hand-built fields replaced with `Field` instances. Auth frame 6 (password, `836:203`) left as is: `Field` has no label-row action (CAND-047) and no PasswordInput (CAND-033).
- **Variables:** deleted unused `spacing/0-5` and `spacing/1-5` (the underscore versions are canonical).
- **Phase B (atoms, 21 pages) and Phase C (20 component pages):** Nunito Sans (`font-family/sans`), `font-weight/*` and font size bound on every text node; spacing and radius bound to `spacing/*` and `radius/*`; line height set as a percent from the code token; Sidebar fills bound to `surface`, Drawer headers to `surface-overlay`; Sidebar section label 11 to 12 px and 2% letter spacing; Switch `radius/full`; NavBar link radius 6 to `radius/sm`; Sidebar example wrappers and the NavBar "Dashboard NavBar" Dark and Light example wrappers bound to `background` (fixed the white strip and white breadcrumb bar in the Dark examples).
- Audits after Phase B and C: 0 non-Nunito text, 0 unbound spacing, radius, fills.

### Token facts learned (this decides how to bind)
- **Line height tokens (ratios) cannot be bound**: Figma reads a bound `line-height/*` as pixels (1.5 px). Set a percent instead (tight 120, snug 135, normal 150, relaxed 165) and leave it unbound.
- **Letter spacing tokens are em values**; Figma would read them as px. Leave letter spacing unbound. Sidebar uses 2% (`wide`); Badge 0.2 px in Figma is unbound.
- Font family, weight, size, spacing, radius and color bind fine. Per-corner radius: bind each non-zero corner; zero corners are intentional and exempt.
- A bound font size on a node that already uses a component variable (Button, Input, Select and so on) stays on the component variable.
- **Figma script gotchas:** a script that errors rolls back entirely. Changing the font on text with symbol glyphs (`›`, `»`) needs the fallback fonts loaded first (`Noto Sans Symbols2`, `Noto Sans Symbols`, `Noto Sans`), or `setBoundVariable` throws. Multi-page batched reads and writes work in one call (about 15 to 20 pages). `get_screenshot` returns a short-lived URL: curl it into the scratchpad and Read it.

## Phase D: patterns (Gate 1 plan delivered, waiting for approval)
Scope: the 9 pattern pages (Dashboard `817:226`, Empty state `819:2`, Error recovery `821:2`, Data table `824:2`, Settings `825:688`, Form `826:332`, Search and filter `828:650`, Onboarding `832:2`, Auth `836:2`). 384 own text nodes, all Inter, nothing bound.
- **Role map:** page title 32 to `text/h1` (28); description 14 to `font-size/sm`; Guidelines headings 12 to `xs`; **Guidelines bullets 13 to `sm` (14)**; frame labels 14 `sm`; phone screen titles 28 `text/h1`, Auth and Onboarding titles 24 `font-size/2xl`, desktop reference 22 `text/h2`, empty-state titles 18 `text/h3`, section titles 16 `base`; `Logo` 11 to 12; `or` 13 to 14. Family and weight bound everywhere; line height stays Auto.
- **Spacing and radius:** Settings 5 x `itemSpacing 2` to `spacing/0_5`; Form 5, Search 4, Auth 1 x 6 to `spacing/1_5`; Onboarding 2 x radius 24 to `radius/2xl`; `radius/base` (72 nodes, Dashboard, Data table, Settings) rebound to `radius/md`. Exempt device chrome: Onboarding `paddingTop 56`, Auth `paddingTop 72`, `paddingBottom 34`, the 307 px spacer.
- **Layout is safe:** each page root is a vertical auto-layout (gap 48), so taller Guidelines cards push frames down. Watch fixed-width text for re-wrap: 143 bullets, 9 descriptions, Empty state 4, Onboarding 16, Auth 16.
- **Repo stage (after Figma):** a Typography line in the Hierarchy section of all 9 `packages/governance/patterns/*.md` (only `empty-state.md` has one); 6 bare `<h1>` (auth 2, onboarding 4) and 18 bare `<p>` in the examples get token typography; extend `packages/governance/token-lint.mjs` to flag bare headings and paragraphs in `patterns/examples`; `atlas:sync` then stamped `atlas:verify`. #41 is merged, so there is no overlap now.
- **Five decisions still open (my recommendations):**
  1. Data table `Row` padding 10 (10 nodes): bind `spacing/3` (12), rows 37 to 41 px.
  2. Dashboard `Guidelines` frame `817:230`, raw white: bind `background`.
  3. Chrome paddings 56, 72, 34, 307: exempt and documented.
  4. Dashboard example raw lengths: `15rem` to `--atlas-content-width-xs`; keep `12rem` and `670px` as documented constants (no token).
  5. Repo stage order: after #41 merged (done).

## Pending code work and known gaps
- **Alert code** now uses Lucide (in #40). The native demo uses Ionicons (native has no Lucide package).
- Code vs Figma mismatches that remain: none known after #42. Dismiss icon in Figma Alert is a Lucide `x`, in code `X`.
- Sidebar Menu Row, Button, Input, Textarea keep Auto line height in Figma (code sets none, except Textarea which is 150% in both).
- Candidates: CAND-047 (Field label action), CAND-033 (PasswordInput), CAND-031 (Pagination), CAND-034, 035, 037 on hold. Dashboard to StatCard follow-up and the auth password row are still pending (see the stat-card handoff, items 1 to 3).

## State of the environment
- This worktree: `.claude/worktrees/vigilant-clarke-f5b61a` on `feat/auth-onboarding-field` (merged as #41); safe to delete the local branch. `main` is at `6b1488f`.
- Scratch worktrees in `/private/tmp/claude-501/`: `wt-alert` (branch `feat/alert-lucide-icons`, local copy is behind the pushed `520523e`: pull before touching), `wt-typo` (`fix/checkbox-badge-textarea-typography`, node_modules symlinked: **Turbopack dev server will not run from a worktree with a symlinked `node_modules`**). Remove with `git worktree remove --force <path>` when done.
- Remote has stale branches `visual-baseline/*` (4 older plus `38287420518`) that can be deleted.
- `git commit` attribution: end messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Rules that apply
- Figma is the authority; Figma first, then docs through `atlas:sync`, then code. Four gates (Figma plan, Figma built, code checked, final approval), no restating. Do not commit, push, open a PR or merge without the user's yes ("merge N" per merge).
- No new components or tokens; compose or snap to existing tokens and log gaps in `atlas/state/candidates.json`.
- Skip pleasantries; lead with the answer. Do not show graft token savings unless asked.
