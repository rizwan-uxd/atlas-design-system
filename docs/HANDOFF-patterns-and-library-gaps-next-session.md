# Handoff: patterns done, library gaps fixed, what is next

Written: 2026-10-11, after PRs #21 to #33 merged. Read this, `AGENTS.md`, and the `atlas-component` skill if you touch a component. `main` is at the merge of #33 (Progress).

## State
- **All nine patterns have a Figma page and aligned docs.** Each was built Figma first (guideline cards plus state frames), reviewed by the user, then the doc and example were updated. Merged: Dashboard #21, Empty state #22, Error recovery #23, Data table #24, Settings #25, Form #26, Search and filter #27, Onboarding #28, Auth #29.
- **Four library gaps fixed**, each Figma first then code:
  - #30 Figma opacity variables are percent (50/90/60/50). The disabled Button was rendering at 0.5%. DEC-058. CSS stays fractions.
  - #31 Badge `Removable` boolean plus trailing x icon on all 72 variants; code uses the lucide X; also fixed the search-filter example `removeLabel` (Badge prepends "Remove ").
  - #32 Input `Leading icon` / `Trailing icon` booleans plus swap slots on 45 variants; Code Connect mapping; contract gained `prefix` and `suffix`; new `Input.test.tsx` (20 tests).
  - #33 `Progress` and `.Progress / Bar` gain a `Percent` variant (0 to 100 by 10). DEC-059 records it as an exception to DEC-003. Named Percent because Progress already has a boolean `Value`.
- Latest ids: DEC-059, CAND-037, DISC-092. Tests: 1132 vitest, 52 script tests.
- Open PRs, all from earlier sessions and untouched: **#19** (atlas-sync props from an intersected union type, DISC-084), **#15** (dashboard coverage audit doc), **#14** (search result count on one line). The user merges; `gh pr merge` works only when the user says "merge" in chat (the auto-mode classifier blocked it before that).

## Figma pages made (file `cKYhfaHLCoyMHi9nKr63Ig`)
All sit before the "———— Mobile · Icons ————" divider, each with four guideline cards and state frames:

| Page | Page id | Notes |
|---|---|---|
| Pattern / Dashboard | `817:226` | 6 frames. Chart (fixed 670 px plot) sits beside the table. |
| Pattern / Empty state | `819:2` | 4 frames |
| Pattern / Error recovery | `821:2` | 5 frames |
| Pattern / Data table | `824:2` | 6 frames. Rows are composed from Table cell, head and Checkbox instances with a hand-made Status cell for the Badge. |
| Pattern / Settings | `825:688` | 6 frames |
| Pattern / Form | `826:332` | 5 frames |
| Pattern / Search and filter | `828:650` | 6 frames. Chips now use the Removable Badge. |
| Pattern / Onboarding | `832:2` | 9 frames, **phone frames first** (390 x 844, keyboard-open frame, Back route frames). Progress shows real steps (20/50/70/100). |
| Pattern / Auth | `836:2` | 7 frames, phone first. |

## Do next (suggested order)
1. **Use the new library options on the pattern pages** (Figma only, no code):
   - Search and filter (`828:650`): add the Input leading search icon (`Leading icon` on, search icon).
   - Auth (`836:2`): Password field show/hide as the Input trailing icon (eye); the logo is still a "Logo" placeholder.
   - Both pages' text says the icons are not drawn; update the notes if the user wants them.
2. **Refresh the Figma snapshot** with the `atlas-figma-sync` skill so `atlas/metadata/Progress.json`, Badge and Input list their new Figma properties. A full `--pull` re-stamps `syncedAt` on 90+ files; to refresh only some components, edit their entries in `.atlas-pull/pull.json` (gitignored scratch) and keep the original `pulledAt` (`2026-10-10T17:05:52.269Z`).
3. **Queue from the older handoffs:**
   - The one-page Atlas entry doc (what Atlas is, what not to hardcode, how to verify, how agents change UI).
   - Batch-2 pattern list (not decided).
   - Optional, only with the user's approval: promote candidates CAND-030 to CAND-037.
   - Log the remaining Figma gaps below in `atlas/state/candidates.json`.

## Known gaps and quirks
- **Rendering of disabled states** was fixed by DEC-058, but Dropdown, RadioGroup and Slider still set disabled 0.5 by hand (DEC-016 and later); rebinding them to `opacity/disabled` was left out on purpose.
- **Input** has no Figma property for `prefix` and `suffix` (code only), and no trailing show/hide control; the icon is 20 px on every size (no per-size token).
- **Chart** plot is fixed at 622 px inside an instance and cannot stretch; the Dashboard places it at 670 px beside the table.
- **Progress** `Value text` ("50%" or "Step 2 of 4") is a separate text property and does not follow `Percent`.
- **Search and filter** has no empty-query (recent searches) state and no filter Sheet drawn.
- **Code Connect:** `figma connect parse` reports `ParserError` for Avatar, Breadcrumb, DatePicker, DropdownMenu, ListItem, Select, Slider and Toast on `main`; exit code is 0 and CI passes (not caused by recent work).

## Gotchas learned this session (they will bite again)
- **Figma component sets:** `clone()` on a variant leaves the clone on the page; move it in with `set.appendChild`. A clone loses its text and visibility property references, so copy `componentPropertyReferences` back from the source variant. Instance sizing and constraints inside an instance cannot always be overridden (vertical constraints cannot); width and height can.
- **`setProperties` on a variant instance swaps the nested nodes**, so ids go stale: re-query children by name after each call, and set a new variant in a separate `use_figma` call from the one that creates it.
- **Opacity variables** are percent in Figma and fractions in CSS. Do not bind a node to an opacity variable expecting 0 to 1.
- **Figma variables for width and height** need a WIDTH_HEIGHT scope: `spacing/*` and `input/icon-size` work, `font-size/*` (FONT_SIZE scope) does not.
- **Text in instances:** `Input` and `Badge` text layers use the component's own styles; an error-state Input draws its value in the normal text colour, so it reads as entered text.
- **CI:** an intended visual change fails Visual Regression until the Linux baselines are regenerated. Run `gh workflow run "Visual baseline" --ref <branch>`; the run fails at its last step (the repo cannot open a PR from Actions) but pushes `visual-baseline/<run>`; cherry-pick that commit onto the PR branch and push. This worked for #31.
- **`atlas:verify --stamp`** does nothing when only companion files changed; use `--stamp-components <Name>` (used for Input and Progress).
- **A dev server may already own port 3030** and serve another checkout (it returned 404 for new routes); use `npx next dev -p 30NN` for temporary render checks, and delete the temp route and `.next/dev/types` afterwards or `tsc` fails.
- **`removeLabel`** on Badge names the item only; the button label is "Remove <item>".
- **Browser pane hidden:** screenshots time out; read the server-rendered HTML or `get_page_text` instead.
- On macOS `sed -i` needs an empty suffix argument (`sed -i ''`); use `python3` for edits.

## Rules that apply (from `AGENTS.md` and the user's standing preferences)
- Figma is the authority. Figma first, then docs through `atlas:sync`, then code. One component per task; the four gates (Figma plan, Figma built, code checked, final approval), no restating.
- No new components or tokens on your own initiative; a gap is composed locally and logged in `atlas/state/candidates.json`.
- Do not merge a PR yourself unless the user says "merge" in chat. If Auto-fix is off, ask before pushing any CI fix (the user once replied "Fix and merge", which covers regenerating baselines and merging).
- The user treats "Proceed", "Approve", "Proc es" as approval of the step just shown; a question or pushback is not approval.
- Skip pleasantries; lead with the answer. Treat the mobile frames as primary for onboarding and auth, using web components in a phone frame.
- Prefer graft skeleton, ask and grep over reading whole files.
