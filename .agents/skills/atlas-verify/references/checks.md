# atlas-verify checks

"Changed files" = `git diff --name-only <base>` + untracked files, minus deletions. Design and code
checks inspect only changed `.ts/.tsx/.css` under `app/` and `packages/ui-web/src/`; token-lint,
tsc and tests run repo-wide. Pattern logic shared with the benchmark lives in
`scripts/lib/quality-checks.mjs` — the benchmark's `quality` block and this verifier count the same things.

**Every check reports what it inspected** (the note after its status, and `inspected` / `scope` in
`--json`). A check that inspected nothing when its scope was non-empty FAILs with
`0 inspected, N in scope`, and a check that reports no count at all FAILs: that is what a parser bug or
a renamed field looks like, and before M2 it printed PASS.

**Every JSON input is schema-validated first** (`packages/governance/schemas/`, compiled with ajv by
`scripts/lib/schemas.mjs`). A check only ever sees data that validated; checks that depend on an
invalid file fail closed on it.

## design

| Check | Fails when | Warns when | Fix |
|---|---|---|---|
| `schemas` | an input fails its schema (the message is `file: /json/pointer problem`); a required input is missing; a `*.json` under `atlas/`, `packages/governance/` or `packages/registry/` has no rule in `INPUTS` | — | regenerate (`npm run atlas:sync`) for `atlas/`; fix the authored file otherwise. A new JSON input needs a schema and an `INPUTS` rule |
| `snapshot-current` | `atlas-sync --check` would write files (code enums moved, snapshot not regenerated); a touched component has no `atlas/metadata/<Name>.json` | a touched component's metadata has `syncedAt: null` or `source` other than `figma-synced` | `npm run atlas:sync`; for stale Figma facts run the `atlas-figma-sync` skill |
| `figma-registry-code` | repo-wide, not over the diff. **Figma↔code** (fails on the code side): a Figma axis member is missing from code (metadata union or Code Connect `figma.enum`) or the reverse; an axis is not classified in `packages/registry/figma-axis-map.json`; a component's metadata failed its schema; with `--max-figma-age <days>`, a Figma pull older than that. **Registry** (fails on the registry side, `[registry]`): an entry's enum differs from its Figma axis (narrower only with `narrowed`) or has a member the code union lacks; a Figma `State` member the entry does not classify, or the reverse; a slot Figma supplies no content for (`figmaContent` in the facts: an instance swap, `figma.string`, a JSX branch or drawn literal content); an entry's facts or metadata are missing or invalid; 0 registry entries | an axis is `unmapped` (Figma draws it, code does not model it; the map gives the reason) | Figma is the authority: change Figma first, re-sync, then code. A registry finding is fixed in `packages/registry/src/` (it is derived from both), e.g. move an undrawn slot to `hiddenProps` with a reason |
| `variants-sizes` | a literal `variant=` / `size=` on an Atlas root component (`<Name>` or `<NameRoot>`, aliases resolved) is not in `metadata.variants` / `metadata.sizes`; a changed file imports an Atlas component and no tag of it was found | — | use a listed value |
| `tokens` | a `--atlas-*` reference is a primitive (`--atlas-color-*`, `--atlas-blue-500`) or is not defined in `packages/tokens/atlas.tokens.css`. Exception: `app/prototypes/<slug>/brand.ts` may reference primitives (DEC-008) | — | use a semantic token from `atlas/tokens.md` |

"Touched component" = imported from `@atlas/ui-web/...` by a changed file, or whose library folder changed.
Only string literals are checked. `variant={isOn ? "a" : "b"}`, a boolean shorthand, and any prop a later
`{...spread}` may override are counted as **dynamic** in the note (never read as "no variant") and left to tsc.

## code

| Check | Fails when | Warns when |
|---|---|---|
| `token-lint` | `packages/governance/token-lint.mjs` exits 1 (hex, rgb, hsl, raw oklch); skips only `app/prototypes/<slug>/brand.ts` and lists it | — |
| `tsc` | `npx tsc --noEmit -p tsconfig.json` has errors (changed files listed first) | — |
| `tests` | `npx vitest run` fails | — |
| `atlas-components` | a changed `app/` file renders a raw `<button> <input> <textarea> <dialog> <select>` | a hardcoded px/rem/em or bare number on a length property (padding, margin, inset, gap, width/height, top/left…, font-size, letter-spacing, border-radius/width, outline-offset) in changed `app/` files — one line each. Not flagged: unitless properties (`flex: 1`, `opacity`, `zIndex`, `fontWeight`, `lineHeight`), data fields (`tipPercent: 15`), `0`, `%`/`fr`/`vh`, `calc()` multipliers |
| `a11y` | `<img>` without `alt` · `onClick` on `div/span/li/p` without `role` **and** `tabIndex` · positive `tabIndex` · `role="radiogroup|tablist|listbox|menu|menubar|grid|tree"` in a file with no `onKeyDown` · `outline: none` / `outline-none` with no focus style on the same line | — |
| `prototype-registered` | a changed `app/prototypes/<slug>/` with a `page.tsx` has no `"<slug>"` in `_shared/flowRegistry.ts` | — |

Raw controls are only checked under `app/` — library components in `packages/ui-web` wrap them legitimately.

## scope

| Check | Fails when | Warns when |
|---|---|---|
| `paths` | a changed file matches none of `--scope` (comma-separated globs; `*` = one segment, `**` = any depth) | no `--scope` given and there are changes |
| `no-new-tokens` | `atlas.tokens.css` defines a `--atlas-*` name that `<base>` did not (override: `--allow-new-token`) | — |
| `no-new-components` | a changed file sits in a component folder (`packages/ui-web/src/<tier>/<Name>/`, `packages/ui-native/components/<Name>/`) that does not exist at `<base>` (override: `--allow-new-component`) | — |

## Flags
`--base <ref>` (default `HEAD`) · `--scope <globs>` · `--skip <id,...>` (e.g. `tests,tsc`, or `code.a11y`) ·
`--only <id,...>` (run just these; the rest SKIP, so `--stamp` refuses the run) · `--max-figma-age <days>` ·
`--allow-new-component` · `--allow-new-token` · `--json` · `--stamp` (on a run with no FAIL and no SKIP, writes the current ISO time to `verifiedAt` in `atlas/state/status.json` for each component whose `packages/ui-web/src` folder changed; otherwise prints why it did not). Exit 0 = no FAIL; exit 1 = at least one FAIL.

## Known limits
- JSX is parsed with the TypeScript compiler (`jsxTags` in `scripts/lib/quality-checks.mjs`), so tags in
  strings, comments and generics are ignored. A spread makes a prop **unknown**: `a11y` then passes
  `<img {...p}>`, since the spread may carry `alt`.
- `a11y`'s `role="…"` and `outline` rules are still line regexes over the whole file, so a doc comment
  that mentions `role="radiogroup"` counts (RadioGroup.tsx today).
- a11y is a floor, not an audit — no contrast, label association or screen-reader checks.
- token-lint does not catch CSS named colours (`white`, `black`) — they are not hex/rgb/hsl/oklch.
- `atlas/tokens.json` lists fewer tokens than `atlas.tokens.css` defines (z-index, dialog widths,
  safe areas, some motion/typography), so `tokens` checks existence against the CSS file.
