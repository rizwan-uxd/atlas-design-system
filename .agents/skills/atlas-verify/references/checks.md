# atlas-verify checks

"Changed files" = `git diff --name-only <base>` + untracked files, minus deletions. Design and code
checks inspect only changed `.ts/.tsx/.css` under `app/` and `packages/ui-web/src/`; token-lint,
tsc and tests run repo-wide. Pattern logic shared with the benchmark lives in
`scripts/lib/quality-checks.mjs` — the benchmark's `quality` block and this verifier count the same things.

## design

| Check | Fails when | Warns when | Fix |
|---|---|---|---|
| `snapshot-current` | `atlas-sync --check` would write files (code enums moved, snapshot not regenerated); a touched component has no `atlas/metadata/<Name>.json` | a touched component's metadata has `syncedAt: null` or `source` other than `figma-synced` | `npm run atlas:sync`; for stale Figma facts run the `atlas-figma-sync` skill |
| `variants-sizes` | a literal `variant=` / `size=` on an Atlas root component (`<Name>` or `<NameRoot>`, aliases resolved) is not in `metadata.variants` / `metadata.sizes` | — | use a listed value |
| `tokens` | a `--atlas-*` reference is a primitive (`--atlas-color-*`, `--atlas-blue-500`) or is not defined in `packages/tokens/atlas.tokens.css` | — | use a semantic token from `atlas/tokens.md` |

"Touched component" = imported from `@atlas/ui-web/...` by a changed file, or whose library folder changed.
Only string literals are checked; `variant={isOn ? "a" : "b"}` is left to tsc.

## code

| Check | Fails when | Warns when |
|---|---|---|
| `token-lint` | `packages/governance/token-lint.mjs` exits 1 (hex, rgb, hsl, raw oklch) | — |
| `tsc` | `npx tsc --noEmit -p tsconfig.json` has errors (changed files listed first) | — |
| `tests` | `npx vitest run` fails | — |
| `atlas-components` | a changed `app/` file renders a raw `<button> <input> <textarea> <dialog> <select>` | numeric style literals (`padding: 24`) in changed `app/` files |
| `a11y` | `<img>` without `alt` · `onClick` on `div/span/li/p` without `role` **and** `tabIndex` · positive `tabIndex` · `outline: none` / `outline-none` with no focus style on the same line | — |
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
`--allow-new-component` · `--allow-new-token` · `--json`. Exit 0 = no FAIL; exit 1 = at least one FAIL.

## Known limits
- Heuristic, not a parser: JSX tags are scanned textually, so props passed by spread (`{...props}`)
  are invisible to `variants-sizes` and `a11y`.
- a11y is a floor, not an audit — no contrast, label association or screen-reader checks.
- token-lint's hex rule needs whitespace, `:`, `,` or `(` before the `#`, so a quoted value like
  `color: "#ff0000"` is not caught. The fix belongs in `packages/governance/token-lint.mjs`.
- `atlas/tokens.json` lists fewer tokens than `atlas.tokens.css` defines (z-index, dialog widths,
  safe areas, some motion/typography), so `tokens` checks existence against the CSS file.
