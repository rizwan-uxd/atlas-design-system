# Handoff: Atlas v1.1 component expansion, next session

Written: 2026-09-25. Read this, `AGENTS.md` and `docs/componentlist plan _25 sep.md`, then wait for the user's "start".

## State

`main` is pushed to origin at `735d2df`. Working tree: only `docs/componentlist plan _25 sep.md` (user's plan, untracked, never committed) and this file.

| Phase | Component | Status |
|---|---|---|
| 1 | Avatar + AvatarGroup | merged |
| 2 | Breadcrumb family | merged |
| 3 | Divider | merged |
| 5 | **ListItem** (replaces DescriptionList, DEC-014) | merged `ab9f06c`; branch `feat/list-item` is local only |
| 4 | Timeline | **removed from the plan by the user (2026-09-25)**; will not be built |
| 6 | DropdownMenu (DEC-012, DEC-016, DEC-017) | merged `c5ca2aa` and pushed; no external dependency |

Also merged: DEC-015 (code tokens added to Figma foundations) and the Tailwind fix `735d2df` (`@source not "../benchmarks"` in `app/globals.css`).

## Next work, in the user's order of choice

## Next work
None planned. Timeline was removed from the plan; DropdownMenu is done.

## The workflow that worked (keep using it)

1. **A. Audit:** read the reference node (`get_design_context` after loading `figma:figma-design-to-code`) against Atlas foundations and existing components. Post a mapping table, proposed tokens and gaps. Wait for the user's answers.
2. **B. Figma:** load `figma:figma-use` and `figma:figma-generate-library` before `use_figma`. Create a page after the last component page, build a Media/atom set if needed, the main component set with component properties (booleans, text, instance swaps), a Light and Dark examples frame, and a usage panel. Follow the Divider page layout (component set at left, then Light / Dark / usage frames). Bind everything to variables.
3. **C. Gate 1:** user replies "approved".
4. **D. Code:** `atlas-figma-sync` pull, then `atlas-component`, Code Connect, vitest + jest-axe test, sandbox section in `app/page.tsx`, browser check, `atlas-verify`.
5. **E. Gate 2:** user replies "approved", then commit on `feat/<name>` and merge `--no-ff` to `main`. Trailer: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Push only when asked.

User principle (stated 2026-09-25): **Figma is the single source of truth and drives code.** If code needs something Figma does not draw, fix Figma first; never let code go beyond the approved page. This is why, for ListItem, the text-action claim was removed and the line heights were changed in Figma to match the code tokens.

## Facts and gotchas

- **Files/keys:** Atlas `cKYhfaHLCoyMHi9nKr63Ig`; ReUI reference `BOJ49F6rceAmcCC70lSiav`.
- **Figma IDs:** ListItem set `505:124`, List Item Media set `504:21`, page `504:2`. Avatar `487:720`, Avatar Group `488:452`, Button set `19:2` (outline sm `18:104`, Button sm is 32px). Lucide icons live on the `Atlas/Icons` page (`322:106`), e.g. chevron-right `322:4883`.
- **Figma variable ids:** collections Atlas/Primitives `VariableCollectionId:2:2`, Atlas/Semantic `3:2` (Light/Dark). Semantic ids are `VariableID:3:N` (background `3:3`, background-muted `3:5`, border `3:9`, foreground `3:12`, foreground-muted `3:13`); look up primitives by name.
- **Figma has no text styles**; text uses Inter with raw sizes. Bind `fontSize` to `font-size/*` variables. Line height cannot be bound to a ratio variable, so set it as a percentage matching `line-height/normal` (150%) or `snug` (135%).
- **Instances:** `targetAspectRatio` is read-only on instances. A linked INSTANCE_SWAP property forces its default onto every variant, so unlink it on variants that need a different default (done for ListItem vertical). After `setProperties` on nested instances, node ids shift: re-fetch each time instead of holding ids.
- **Sync:** `node scripts/atlas-sync.mjs --pull .atlas-pull/pull.json`. The generator only discovers components that already have source under `packages/ui-web/src/<tier>/<Name>/`, so write the code first, then add the component to `.atlas-pull/pull.json` (nodeId, description read from Figma, property value sets). `.atlas-pull/` is scratch and gitignored. A second run must write 0 files.
- **Figma library search does not index unpublished Atlas components**, so read descriptions with a read-only `use_figma`.
- **Verify:** `node scripts/atlas-verify.mjs --allow-new-component --scope "<globs>"` (add `--stamp` on a clean final run). `--allow-new-component` is needed for a new component the user asked for.
- **State edits (by hand, then `atlas-sync` normalises formatting):** `status.json` row, `decisions.json` (next id is DEC-016), `candidates.json` (native-parity candidate per component; remove a superseded candidate).
- **Contracts** only for Avatar and Divider (plan). **No new dependencies** without asking.
- **Dev server** works now (`npm run dev`, port 3030). Sandbox fonts are Nunito Sans; Figma uses Inter (pre-existing).

## Open items (not caused by v1.1 work)

- `atlas-verify` fails on `app/page.tsx:67` (`<NavBar variant="outline">`, NavBar drift DISC-010) and on the untracked plan doc being outside the scope. Both existed before ListItem. Decide whether to commit the plan doc, and whether to fix the NavBar call site.
- 27 open drift entries in `atlas/state/discrepancies.json` (the project file still says 17).
- `--atlas-spacing-9` was added to Figma (parity done); `layout/container/*` exists in Figma but not in code (unused).
- Shadow effect styles in Figma have light values only; dark shadow values stay code-only.
- Not pushed: `feat/list-item` branch (local only, merged).
- `CLAUDE.md` "Status" and component sections do not mention v1.1 yet; update when the user asks.
- Visual-regression tooling: the plan says to revisit it after Avatar's Gate 2. Still open, no decision recorded.

## First steps next session

1. Read this file, `AGENTS.md` and the plan doc. Do not read `docs/` for building.
2. Wait for the user's "start".
3. Ask what the user wants next; nothing is queued.
