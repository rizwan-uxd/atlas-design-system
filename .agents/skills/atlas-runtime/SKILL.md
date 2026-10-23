---
name: atlas-runtime
description: Change the Atlas runtime — packages/runtime (protocol, validator, fallback, reducer, renderer, stub agent) and app/runtime-demo. Use for "the runtime drops X", "add a protocol op", "fix the renderer", "the fuzz found a crash", "a runtime-demo test fails". Not for registry declarative fields (packages/registry/src, aliases — the registry lane), not for a library component (atlas-component), not for a prototype (atlas-prototype). Never creates routes under app/prototypes.
---

# atlas-runtime

## Owns
`packages/runtime/**`, `app/runtime-demo/**` and `tests/runtime/**` (roadmap R9).

## Must not
- Author registry declarative fields (protocolProps, slots, nesting, fallback, required…). Those are owner
  decisions in `packages/registry/src`, built by `npm run registry:build`.
- Change any component in `packages/ui-web/src`, or add a token or component. An axe or rendering bug inside a
  component goes to `docs/audits/QA-REPORT.md` for an atlas-component session.
- Create routes under `app/prototypes`.

## Contract (do not break)
- The validator never throws: unknown or malformed → fallback; disallowed nesting → dropped; unknown, invalid or
  markup props → stripped; missing required → fallback; a fallback target that is not registered → the node is
  dropped and its siblings stay (DEC-082, DEC-083, DEC-084).
- Every rendered node carries a registered `data-atlas-type`; no raw `style` attribute.
- Server ops are sequenced; a stale seq is ignored. Patches keep untouched subtrees' identity.
- Metric test names are exact strings from `metrics.manifest.json`: vitest `describe("runtime/x >")` + `it("…")`
  (vitest joins titles with a space); Playwright a top-level `test("runtime-demo > …")`.
- `*.metric.tsx` tests are report-only (`npm run test:metrics`, non-blocking in CI, DEC-085). The protocol size
  ratio reads failing at 0.308; do not trim fixture copy to pass it.

## Verify
1. `npx vitest run packages/registry packages/runtime`
2. `npm run test:runtime` (locally, `PW_CHROMIUM` may point at an installed Chromium)
3. `npm run test:metrics` (exit 1 is expected while the size metric reads failing)
4. `npm run atlas:verify -- --scope "packages/runtime/**,app/runtime-demo/**,tests/runtime/**"`

A fuzz failure: reproduce with `FUZZ_SEED=<seed> npx vitest run packages/runtime/tests/fuzz.test.tsx`, add the
payload as a named case in `validate.test.ts`, fix `src/`, never filter payloads.
