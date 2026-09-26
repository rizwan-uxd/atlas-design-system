# Handoff: Atlas component batch 2, next session

Written: 2026-09-26. Read this, `AGENTS.md` and `docs/componentlist plan _next6_2026-09-25.md` (section 10 is the progress log). Then start **Phase 3, Image, step A (audit)**. The user has already said to proceed in plan order, so no separate "start" is needed.

## Token budget: use graft
The user wants graft used to cut token and context cost. The repo is indexed (`graft/INDEX.md`, hooks print starting points). Prefer it over broad reads and greps:
- `graft ask "<task>" --source` to find and understand code (ranked, code inlined at file:line).
- `graft grep "<literal>"` when you need every occurrence.
- `graft skeleton <file>` for a file's API instead of reading it (about 10x cheaper).
- `graft callers <symbol>` before changing a symbol.
- Already know the file? Go straight to it and read only the span you need.
The `mcp__graft__*` tools do the same (load them in one ToolSearch call). Graft covers repo code only, so Figma work still uses the Figma MCP. Per AGENTS.md section 7, do not re-read files already read, and skip `docs/` reads that do not change what you write. Close a reply with the one-line graft token tally when you used it.

## State
`main` is local only (nothing pushed since `61dd2c7`). Working tree is clean after the docs commit that carries this file.

| Phase | Component | Status |
|---|---|---|
| 1 | Spinner | merged `6e6fea8` (page `527:2`, set `527:63`) |
| 2 | Skeleton | merged `8a19d7d` (page `531:2`, set `531:5`) |
| 3 | Image | **next**. Reference node `42732:27744`. Reuses Skeleton for loading |
| 4 | Progress | audited, decisions given, not built |
| 5 | Radio Group | audited, decisions given, not built |
| 6 | Slider | audited, decisions given, not built |

Latest ids: DEC-019, CAND-015. Next new ones are DEC-020, CAND-016. Tests 244/244 at last run. Figma pages go after the last component page (currently Skeleton `531:2`).

## Rules the user set (locked)
1. **Audit findings are hypotheses.** Verify token, dimension, radius, colour, state and motion claims against `atlas.tokens.css` **and** the Atlas Figma variables before implementing. Add a token only for a real gap, Figma first, then `atlas.tokens.css`, `atlas.tokens.json`, `atlas.figma.tokens.json`. Reuse an existing token only when it is semantically equivalent (e.g. opacity/disabled was rejected for the Skeleton pulse).
2. **One component at a time**, full cycle each: audit, Figma page, Gate 1 "approved", token verify, code, tests, sandbox, verify, Gate 2 "approved", commit and merge. Do not start the next until the previous has Gate 2.
3. Record every new token or deviation in the progress log (section 10 of the plan doc).
4. No new dependencies. Figma via the authenticated MCP only. Read `node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md). Never hand-edit `atlas/` except the state rows named in `atlas-component/references/companions.md`.
5. Commit and merge only after Gate 2. Trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Merge `--no-ff`. Push only if asked.

## Decisions already given (user, 2026-09-26)
Skeleton is done: single primitive `Shape rect | circle`, composed examples, pulse tokens.

**Progress** (plain `role="progressbar"`, no Radix)
- Drop the thumb (Slider owns it). One 4px bar, default intent only.
- `value`/`max` are props, not the reference's 11 `Progress=` variants.
- Include indeterminate, but **draw it in Figma first**. Check existing tokens before adding a slide duration (spin is 1000ms, pulse 2000ms).
- Label, value and helper are composable props or slots. Fill is `--atlas-primary`, not black.
- My leftover recommendations, not yet confirmed by the user: use `--atlas-spacing-1` for height (no progress-height token); add an `aria-valuetext` prop.

**Radio Group** (native `<input type="radio">`, `appearance: none`, no Radix; compound `RadioGroup` + `RadioGroupItem` in one folder)
- Sizes sm 16px and md 20px, if they align with Checkbox and Atlas foundations.
- Card variant follows the Checkbox card (`radius-md`), not the reference's 10px.
- Invalid is a red ring like Checkbox, no separate red label unless Figma or Atlas requires it.
- Draw hover in Figma, mirroring Checkbox. Indicator on the left. Dot 8px if confirmed by CAND-011 or Figma. Keep `Direction` as a Figma property.
- Check whether CAND-011 (DropdownMenuRadioItem's own dot) should be closed by this component.

**Slider** (highest risk)
- Custom pointer-event implementation (option B): range (two thumbs) and vertical in v1. No Radix.
- Verify thumb-border and hover-ring tokens against Atlas first; add them Figma-first only if genuinely missing. Do not force-fit existing tokens if that changes the semantics.
- Thumb 16px with a 44px minimum hit area. Value text as a composed slot. No marks or steps.
- Roles: each thumb `role="slider"` with arrow, PageUp/PageDown, Home, End; thumbs cannot cross; RTL and vertical mapping.

**Image** (Q11, from the plan): plain `<img>` wrapper: aspect ratio, `object-fit`, radius token, Skeleton loading state, error fallback slot. No `next/image`. Audit not yet done, so ask the user the usual questions after it.

## Workflow (A to E), what worked
- **A. Audit:** `Skill figma:figma-design-to-code`, then `mcp__figma__get_metadata` on the reference canvas node (in the ReUI file `BOJ49F6rceAmcCC70lSiav`, not Atlas), then `get_design_context` on the set node. Deferred tools load with `ToolSearch select:mcp__figma__...`. Post a mapping table, proposed tokens and numbered questions.
- **B. Figma:** `Skill figma:figma-use` and `figma:figma-generate-library`, then `use_figma` on file `cKYhfaHLCoyMHi9nKr63Ig`. Follow the Spinner and Skeleton pages: component set at x=0, Examples Light at x = set width + 80, Examples Dark (explicit Semantic Dark mode `3:1`), Usage panel. Bind fills and radii to variables. Screenshot once, read it via `curl -o` into the scratchpad then Read.
- **D. Code:** copy the pattern of `primitives/Spinner` and `primitives/Skeleton` (tsx, module.css, Code Connect, contract, test, sandbox section). Sync: add the component to `.atlas-pull/pull.json` (`nodeId`, `description`, `properties`), run `node scripts/atlas-sync.mjs --pull .atlas-pull/pull.json` twice (the second must write 0 files), then add the status row, a DEC and a CAND in `atlas/state/*.json`. Verify: `node scripts/atlas-verify.mjs --allow-new-component --allow-new-token --scope "<component globs>,atlas/**,packages/tokens/**,app/page.tsx"`. Browser check: `npm run dev` (port 3030), inspect computed styles, then stop the server.

## Gotchas learned
- Reference node ids belong to the ReUI file. `get_design_context` on a canvas page node can fail ("nothing selected"); use the child set node id from `get_metadata`. `get_variable_defs` also needs the set node.
- `search_design_system` does not find unpublished Atlas sets. Read a set's description with `use_figma` (`node.description`) and put it in the pull file. The output HTML-escapes apostrophes and quotes; write plain characters.
- Nested icon vectors inside instances cannot bind `strokeWeight` to a variable in Figma (the binding does not resolve). Scale icons with `instance.rescale(n/24)`, not `resize`, then set stroke weights numerically and say so in the usage panel.
- `use_figma` writes are strictly sequential. Read-only agents may run in parallel: four audits ran fine, but their reports sometimes did not reach the parent, so ask the agent to resend.
- Icons come from `Atlas/Icons` (page `322:106`), Lucide 24px symbols.
- Figma property values are lowercase like other Atlas sets (Spinner Default/Custom was renamed at the user's request). Code unions must match Figma exactly (DEC-002).
- `Edit` requires a prior `Read` of the file in the session; `sed -i` on macOS needs care.
- `atlas-verify` has two pre-existing failures unrelated to any new component: `<NavBar variant="outline">` at `app/page.tsx:77` and (until the docs commit) the untracked plan doc. Because of them `--stamp` has not been run. Raise the NavBar one with the user rather than fixing it inside a component task.
- Figma tokens already present in Atlas: `icon/size/*`, `icon/stroke/*`, `duration/{instant,fast,base,slow,spin,pulse}`, `easing/*`, `opacity/{disabled,hover,overlay,pulse}`, `spacing/0…16`, `radius/*`, semantic `background`, `background-muted`, `foreground*`.

## Files
Plan: `docs/componentlist plan _next6_2026-09-25.md`. This handoff. Sibling handoff for the previous batch: `docs/HANDOFF-v1.1-next-session.md`.
