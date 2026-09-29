# Handoff: Atlas component batch 3, next session

Written: 2026-09-28 (updated after B5). Read this, `AGENTS.md`, and `docs/componentlist plan _dashboard-gaps_2026-09-27.md`.

## State — read this before touching git
- `main` is at `ace326c` (Merge feat/tooltip), **pushed to origin**. B1–B5 are all merged to `main`. No open feature branches for batch 3.
- The working tree still carries **pre-existing unrelated uncommitted files** from before batch 3 — the user is handling these separately. **Do not stage, commit, stash, revert, or widen scope to include any of these unless the user asks.** This includes `docs/HANDOFF-batch3-next-session.md`, `docs/HARNESS.md`, `docs/atlas-dashboard-coverage.md` (untracked), the modified prototype skill references, `flowRegistry.ts`, `claude.md`, and the deleted `docs/` archive and `app/prototypes/tabby|wise-home` files.
- `atlas-verify` on B5 scope: **11 pass · 1 fail**. The one failure is `scope.paths` — 9 of those unrelated uncommitted files sit outside `--scope`. Because verify failed, **Tooltip's `verifiedAt` is still `null`** (`--stamp` only records on a pass). It stamps once those files are committed or cleared and verify passes.
- The two failures noted after B3 (`--atlas-duration-normal` undefined at NavBar.module.css:317, and `NavBarTabBar` `role="tablist"` without `onKeyDown` at NavBar.tsx:356) did **not** fail in B5's run. Re-check them at the next NavBar-scoped verify rather than assuming they're fixed.
- Tests: Tooltip 19/19. Full suite last run inside `atlas-verify` (passing).

## Progress (Track B)
| Phase | Component | Status |
|---|---|---|
| B1 | SidebarMenuRow | Done, merged. |
| B2 | Sidebar shell | Done, merged. |
| B3 | Top App Bar upgrade (NavBar breadcrumb + search slots) | Done, merged. |
| B4 | Select | Done, merged (`391291e`). DEC-034. |
| B5 | Tooltip | **Done, merged and pushed (`ace326c`).** DEC-035, CAND-023 (promoted). |
| B6 | KPI Stat Card | Not started. Depends on Card `filled` (done) and Tooltip (done). |
| B7 | Chart Container | Not started. Depends on Tooltip (done), Skeleton/Spinner (existing). |

Latest decision: **DEC-035**. Next new one is **DEC-036**. (The previous handoff said DEC-034 was next; Select had already taken it.)

## What B5 changed
- **Figma:** new "Tooltip" page after Select. Component set `645:397`, `Side` = bottom | top | start | end (each 101×28) plus a `Text` property. Light/Dark examples (`645:398`, `645:408`) pinned to the Semantic Light/Dark modes, a Usage panel (`645:418`), and a full USE WHEN / DON'T / DO / PROPERTIES / TOKENS / CODE description on the set. Reference: ReUI/shadcn Tooltip (`42851:21668` in file `BOJ49F6rceAmcCC70lSiav`).
- **Code:** `packages/ui-web/src/primitives/Tooltip/Tooltip.tsx` + `.module.css`. Compound API `TooltipProvider` (default `delayDuration` 300ms), `Tooltip`, `TooltipTrigger`, `TooltipContent` (`side`: top | bottom | start | end, start/end flip in RTL; `sideOffset` default 8). Uses **`@radix-ui/react-tooltip`** (new dependency, user-approved) — Select was built without Radix (DEC-016 precedent), Tooltip deliberately is not.
- **Companions:** `Tooltip.figma.tsx` (connects `TooltipContent`, node `645-397`), `Tooltip.contract.ts`, `Tooltip.test.tsx` (19 tests; axe runs with the page-level `region` rule off because the portalled content sits outside a landmark in an isolated fragment), sandbox "Tooltip" section in `app/page.tsx`.
- **State:** `CAND-023` (promoted), `DEC-035`, `status.json` Tooltip row. The sync also closed `DISC-034` (Sidebar) as a side effect of the pull.

## Tooltip decisions worth remembering (in DEC-035)
- `Side` names the side of the **trigger** the tooltip appears on (Radix semantics; arrow on the opposite edge). ReUI's `Side` names the **arrow edge** — Atlas deliberately differs.
- Arrow radius is `radius-sm` (4px) because Atlas has no 2px radius. ReUI's Kbd chip is out of v1 (needs a translucent-fill token Atlas lacks). No new tokens.
- Fill `foreground`, text `background`, so it inverts in dark mode.

## Open items from B5
1. **Figma library not republished.** `search_design_system` doesn't return the Atlas Tooltip, so the description in `atlas/Tooltip.md` was read from the live Figma node and put into `.atlas-pull/pull.json` by hand. Republish the Atlas library in Figma, then the next real sync can pull it the normal way (same situation as DISC-027, Checkbox).
2. **Not checked in a browser.** The sandbox section (`npm run dev` → http://localhost:3030, "Tooltip") has not been looked at visually. Worth a quick check of the four sides and the disabled-trigger wrapper example.
3. **Tooltip `verifiedAt`** is `null` until `atlas-verify --stamp` passes (see State).

## Rules the user set (locked, carried from prior sessions)
1. **Reference-first for anything without a Figma anchor.** Before drawing a from-scratch component, get a concrete named reference and build the anatomy from what's actually visible. For B5 the user supplied the ReUI Tooltip link; the first two links pointed at an empty "Components" section, so ask for the frame itself if a link returns height 0.
2. **Never invent a new token to make a check pass without saying so and doing it properly.** Propose → Figma first → all three token files → code.
3. **A checker false-positive is a real bug to fix, once confirmed** — not a rationalization to silence a real finding.
4. **Component/child naming**: dot-prefix hidden Figma sub-parts (`.Name Child`).
5. **Usage/example content lives on the component's own Figma page**, never a separate page.
6. **Commit scope stays exact.** `git add` by explicit path, never `-A`.
7. **Each phase needs an explicit "approved" at Gate 1 (Figma) before code, and at Gate 2 before commit/merge.** New dependencies are flagged at audit and approved first.

## Session note
The auto-mode permission classifier returned "no verdict" on Bash, Write and Figma MCP calls repeatedly this session. Leaving auto mode (Shift+Tab) or retrying resolved it. Not a repo issue.

## Next session start
1. Read this file, `AGENTS.md`, and the plan doc.
2. Start **B6 (KPI Stat Card)** per the plan's phase table. Audit first: does it compose from Card (`filled`) + Badge + Skeleton via slots, or is it a standalone `compositions/KpiCard/`? Reference-first — get a named reference (Mobbin or similar) and screenshot it before drawing. The info icon uses the new Tooltip.
3. B7 (Chart Container) follows; wrapper only (title, legend slot, range-control slot, empty and loading states), no plot primitives.
