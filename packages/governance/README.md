# packages/governance

Design-system governance: what exists, who owns it, what is retired, and the checks that enforce it.

## Contents

| File | Purpose |
|---|---|
| `token-lint.mjs` | Fails on hardcoded colour literals in `packages/ui-web/src` and `app/`. Run `npm run token-lint`; CI runs it. |
| `contracts/<Name>.contract.ts` | Compile-time guard for each component's props, variants and sizes. A breaking change updates the contract in the same commit. |
| `ownership.json` | Owners per area (design-system, tokens, components, docs, ai-context) and optional per-component owners. Mirrored by `.github/CODEOWNERS`. |
| `patterns/<slug>.md` + `patterns/examples/<slug>.example.tsx` | Authored product patterns (form, empty state, data table, error recovery, settings). `atlas-sync` validates every named component, variant and size, embeds the example (compiled by `tsc`) and writes `atlas/patterns/<slug>.md` plus a Patterns table in `atlas/index.md`. Required sections are listed in `scripts/atlas-sync.mjs` (`REQUIRED_SECTIONS`). |
| `deprecations.json` | Registry of deprecated components, variants and tokens with `since`, `removeIn`, `replacement`, `migration`. Empty today. |

## How the pieces reach agents

`npm run atlas:sync` copies `ownership.json` and `deprecations.json` into `atlas/state/`, adds `status` and `deprecated` to every `atlas/metadata/<Name>.json`, and prints a Deprecated line in `atlas/index.md`. `npm run atlas:verify` includes a `deprecated-usage` check that fails when a changed file adds a use of a listed asset.

## Deprecating an asset

1. Add an entry to `deprecations.json`. Names: `Button` (component), `Button.link` (variant), `--atlas-x` (token).
2. Run `npm run atlas:sync`, then `npm run atlas:verify`.
3. Note it under `### Breaking` or `### Deprecated` in `CHANGELOG.md`.
4. Remove the asset no sooner than the version in `removeIn`, then delete the entry.

Versioning rules are in `CHANGELOG.md`.

## Not built yet

Breaking-change detection scripts and codemods.
