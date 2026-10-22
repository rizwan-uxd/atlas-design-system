# M2: the verifier cannot silently pass (implementation plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every JSON input `atlas-verify` reads is schema-validated before any check reads it. Every
check reports what it inspected and FAILs on zero when it should have inspected something. Every
check has a test.

**Architecture:** JSON Schemas (draft 2020-12) live in `packages/governance/schemas/` as data, so
M4's runtime validator can ship them to a browser. `scripts/lib/schemas.mjs` compiles them with
`ajv` and maps each repo input to its schema. `atlas-verify` loads JSON only through that module.
Invalid files never reach a check; they are reported by `design/schemas`, and every dependent check
fails closed on them. The regex JSX scanner is replaced with a TypeScript-AST scanner in
`scripts/lib/quality-checks.mjs`, which is exported and unit-tested.

**Tech stack:** Node ESM scripts, `node:test`, `ajv@8` (`ajv/dist/2020`), `typescript` (already a
devDependency; its compiler API parses the JSX).

## Global constraints
- Roadmap §2b (`docs/ATLAS-DELIVERY-ROADMAP.md`) is the spec. The M2 exit: corrupting one field in
  `atlas/metadata/Button.json` turns a PASS into a FAIL.
- Extend `scripts/atlas-verify.mjs`; add no new script entry point.
- Delete `guardFigmaProperties` in the same commit that adds the metadata schema.
- `ajv` over zod: the schemas must be plain JSON data.
- No optional chaining on data under test; absence is a failure that names the file and field.
- Never hand-edit `atlas/`. The schemas describe what `scripts/atlas-sync.mjs` writes.
- A parallel D1 session owns token sync work in `scripts/atlas-sync.mjs` (around the tokens
  section) and `scripts/metrics-report.mjs`. Touch atlas-sync only to validate the pull file.
- Verification order: token-lint → tsc → vitest → test:scripts → atlas:verify.

## File structure

| File | Responsibility |
|---|---|
| `packages/governance/schemas/*.schema.json` (new) | one schema per input family; shared `$defs` in `common.schema.json` |
| `scripts/lib/schemas.mjs` (new) | `INPUTS` (glob → schema id), `validateFile`, `loadInputs(root)` |
| `scripts/lib/quality-checks.mjs` | gains `jsxTags`, `literalProp`, `UNKNOWN` (TS-AST based) |
| `scripts/atlas-verify.mjs` | `design/schemas` first; loads JSON via `loadInputs`; inspection counts; FAIL on zero |
| `scripts/lib/compare-axes.mjs` | loses `guardFigmaProperties` |
| `scripts/atlas-sync.mjs` | validates `--pull` files against `figma-pull.schema.json` |
| `packages/governance/token-lint.mjs` | prints the file count it scanned |
| `scripts/tests/schemas.test.mjs` (new) | every committed input validates; targeted corruptions fail |
| `scripts/tests/quality-checks.test.mjs` (new) | parser tests from §2b |
| `scripts/tests/atlas-verify.test.mjs` | one fixture test per check, plus the M2 exit test |
| `scripts/tests/compare-axes.test.mjs` | guard tests move to schemas.test.mjs |

## Tasks

### Task 1: Schemas and the loader
- Inputs and their schemas: `atlas/metadata/*.json` → `metadata`; `atlas/index.json` → `index`;
  `atlas/tokens.json` → `tokens`; `atlas/state/{status,discrepancies,decisions,candidates,deprecations,ownership}.json`
  → `state-*`; `packages/governance/{deprecations,ownership}.json` → `deprecations`, `ownership`;
  `packages/registry/figma-axis-map.json` → `figma-axis-map`; the `--pull` file → `figma-pull`.
- `additionalProperties: false` on every object with fixed keys, so a renamed field fails.
- `figmaProperties` is a required object with ≥1 axis, each a non-empty array of non-blank strings
  (exactly what `guardFigmaProperties` enforced).
- `loadInputs(root)` returns `{ files: [{ file, schema, ok, errors, data }], byFile }`. A missing
  required input (`atlas/metadata` empty, axis map absent) is a failure too.
- Tests: all committed inputs pass; one corruption per schema fails with a message naming the file
  and JSON pointer.

### Task 2: `design/schemas` check, and the guard removed
- `design/schemas` runs before every other check: `PASS (N files, M schemas)`; FAIL lists
  `file: /pointer message`. FAIL on 0 files.
- `metadata` holds only valid files. `figma-code` fails closed when any metadata file is invalid,
  naming the files. `deprecated-usage` fails when the deprecations file is invalid. `--stamp` refuses
  to stamp when `status.json` is invalid.
- Delete `guardFigmaProperties` and its tests in compare-axes.test.mjs; their cases move to
  schemas.test.mjs.

### Task 3: Parser tests, and the AST scanner
- Write `scripts/tests/quality-checks.test.mjs` first, against the current regex functions moved
  into `quality-checks.mjs`. Cases: self-closing, nested same-name tags, fragments, a comment
  containing `>` or `variant="x"`, a JS string containing `<Button variant="bad">`, a string
  attribute containing `>`, multi-line attributes, `variant="x"`, `variant={"x"}`,
  `` variant={`x`} ``, `variant={v}` → `UNKNOWN`, absent → `undefined`, `{...rest}` after an
  explicit prop → `UNKNOWN`, `{...rest}` before it → the literal, a JSX-valued prop whose child has
  its own `variant` (not attributed to the root), `data-variant` (not `variant`).
- Run them: record which fail on the regex scanner.
- Replace the scanner with `ts.createSourceFile` and a walk over `JsxOpeningElement` /
  `JsxSelfClosingElement`. `jsxTags(src, local, file)` yields `{ attrs, line, props }`.
  `literalProp(tag, prop)` returns a string, `UNKNOWN` or `undefined`. `blankNestedJsx` is deleted:
  the AST gives each element its own attributes, which is the case it existed for.
- Callers: `variants-sizes` counts `UNKNOWN` as dynamic (reported, never a FAIL);
  `deprecated-usage` is unchanged; `a11y` uses `tag.props` instead of regexes over attribute text.

### Task 4: Inspection counts on every check
Each check returns `inspected` (a number), `scope` (what it should have inspected) and a note.
FAIL when `scope > 0 && inspected === 0`.

| check | inspected | scope |
|---|---|---|
| schemas | files validated | always ≥ 1 required input |
| snapshot-current | sync report parsed + touched components | sync must run |
| figma-code | (unchanged) | |
| variants-sizes | Atlas tags scanned | changed sources that import an Atlas component |
| deprecated-usage | changed sources scanned | changed sources |
| tokens | `--atlas-*` refs checked | changed sources containing `--atlas-`; FAIL if token CSS defines 0 |
| token-lint | files scanned (from its output) | always |
| tsc | files in the program (`--listFilesOnly` count) | always |
| tests | test files run (vitest summary) | always |
| atlas-components | app sources scanned | changed `app/` sources |
| a11y | tsx files scanned | changed `.tsx` sources |
| prototype-registered | changed prototype slugs checked | registry file must exist when a slug changed |
| paths | changed files matched against scope | changed files |
| no-new-tokens | tokens compared | FAIL if the CSS at HEAD or base defines 0 tokens |
| no-new-components | component dirs examined | changed component dirs |

### Task 5: A test for every check
Fixture-repo tests in `atlas-verify.test.mjs` (the existing `repo()` helper), each asserting one
PASS and one FAIL path. tsc and tests use a fixture with its own one-file `tsconfig.json` and one-test
`vitest.config.mjs`, so they run real commands quickly. The M2 exit test: rename `variants` in
`atlas/metadata/Button.json` → `design/schemas` FAIL and the run exits 1.

### Task 6: Verify, record, report
- token-lint → tsc → vitest → `npm run test:scripts` → `npm run atlas:verify`.
- Roadmap: mark 2b done with results; HANDOFF: the M3 starting point.
- Commit; ask before opening a PR.

## Self-review
- Spec coverage: schemas (T1), ajv (T1), design/schemas (T2), guard deleted (T2), parser tests (T3),
  counts + FAIL on zero (T4), 13/13 tested (T5), exit criterion (T5). The pull file schema is
  enforced in atlas-sync, since atlas-verify never reads a pull file.
- Deviation: the regex scanner is replaced, not only tested. The tests will show whether that is
  needed; if the regex passes every case, keep it and drop the AST step.
- Open risk: the D1 session may extend the pull file with variable data; `variables` is an open
  object in `figma-pull.schema.json` for that reason.
