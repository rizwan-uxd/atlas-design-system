# Field mapping and drift rules

What `scripts/atlas-sync.mjs` regenerates, from what, and how it decides something has drifted.

## Where each field comes from

| Snapshot field | Source | Why not the other side |
|---|---|---|
| `name`, `tier`, `import` | `packages/ui-web/src/<tier>/<Name>/<Name>.tsx` path | the import must be typeable |
| `variants`, `sizes` | `export type <Name>Variant` / `<Name>Size` | these are what a caller can actually pass |
| `props` | own members of `export interface <Name>Props` (jsdoc stripped) | inherited DOM props are noise |
| `subcomponents` | exports named `<Name>*` that are not types or `*Props` | |
| `tokensUsed` | every `--atlas-*` in the component's `.tsx` + `.module.css`, minus `--atlas-color-*` | primitive ramps are not app-facing |
| `figmaNodeId` | the pull, else the Code Connect URL | |
| `figmaProperties` | the pull — the value set per Figma property | this is the design authority |
| `syncedAt`, `figmaVersion`, `source` | the pull | `null` + `repo-derived` means never read from Figma |
| `index.md` | all of the above, one row per component | |
| `tokens.json` / `tokens.md` | `packages/tokens/atlas.tokens.css` | Figma MCP has no variable table (see `pull-file.md`) |
| `<Name>.md` | the Figma description **if it reads as guidance**, else preserved | see below |
| `<Name>.md` `## API` block | `<Name>Props` and each subcomponent's `<Sub>Props` (own members, extended native element) — between `generated-api` markers, regenerated on every run | |

`atlas/README.md`, `atlas/tokens.md` and preserved `<Name>.md` files keep their body; only the
`<!-- GENERATED … -->` stamp on line 1 is rewritten.

### The doc rule

A Figma description replaces `atlas/<Name>.md` only when it contains "when to use" / "when not to"
or runs to 200+ characters. Anything shorter is a spec summary, not documentation: the existing doc
survives and the sync files a `figma`-side discrepancy asking for a real description (phase 3).
This is the one place the generator refuses to let Figma overwrite the repo, and it does so loudly
rather than silently.

## Drift rules

Every rule below writes into `atlas/state/discrepancies.json` with `detectedBy`, `firstSeen` and
`lastSeen`. Matching is by `component` + exact `issue` text, so re-running is idempotent.

| # | Condition | `side` | `detectedBy` |
|---|---|---|---|
| 1 | Code Connect maps a `Variant`/`Size` value the code type doesn't export | code | `sync:code-connect` |
| 2 | Figma `Variant` set ≠ code `<Name>Variant` | figma / code / both | `sync:figma` |
| 3 | Figma `Size` set ≠ code `<Name>Size` | figma / code / both | `sync:figma` |
| 4 | Code has a Variant type, Figma has no `Variant` property | figma | `sync:figma` |
| 5 | Figma has a `Variant` property, code exports no Variant type | code | `sync:figma` |
| 6 | Code Connect node id ≠ the node id Figma reports | code | `sync:figma` |
| 7 | Component in code, absent from the pull | figma | `sync:figma` |
| 8 | Component in the pull, absent from `packages/ui-web/src` | code | `sync:figma` |
| 9 | Figma description is a spec summary, not guidance | figma | `sync:figma` |

`side` is who must change: `figma` = fix the Figma file, `code` = fix the repo, `both` = the two
sides model different axes and need a decision first. Per `AGENTS.md` §1 the Figma side goes first.

Rules 2–9 only run when a pull is supplied; rule 1 always runs, so a pull-less run still checks the
repo against itself. A sync-detected entry whose detector ran and no longer fires is closed
automatically (`status: "closed"`, `closedBy`). Hand-written entries (no `detectedBy`, e.g. the ones
carried over from `docs/audits/FIGMA-CODE-PARITY.md`) are never auto-closed and never rewritten —
a mechanical restatement of one is expected and harmless.

## Running it

```bash
node scripts/atlas-sync.mjs                            # repo-derived refresh, no Figma
node scripts/atlas-sync.mjs --pull .atlas-pull/pull.json
node scripts/atlas-sync.mjs --pull … --check           # preview; exit 1 if anything would change
```

`--check` writes nothing and exits non-zero when the snapshot is out of date or drift exists —
that is the form to use from CI or `atlas-verify` (phase 6).
