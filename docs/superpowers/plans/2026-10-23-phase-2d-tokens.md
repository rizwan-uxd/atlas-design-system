# Phase 2d: token work that needs zero new tokens (implementation plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** close the four documented token holes without adding a token, so the two Phase-2d metric
rows (`code.raw-design-values`, `code.reduced-motion-required`) have a real check behind them and the
`tokens-build` CI gate fails when the CSS changes and native does not.

**Architecture:** the rules are pure functions in `scripts/lib/token-rules.mjs` (unit-tested with
`node:test`, no I/O). `packages/governance/token-lint.mjs` applies them repo-wide and gains `--json`;
`atlas-verify` runs it once and reports one check per metric. `scripts/convert-tokens.mjs` derives
every native export from `atlas.tokens.css` instead of a template literal.

## Global constraints
- Roadmap §2d is the spec. **No new token**, no Figma call, no visual change.
- Never invent a design-system rule (`AGENTS.md` §6): an existing value the rules flag is either fixed
  with an existing token or listed in an allowlist with its reason — never silently skipped.
- A new `atlas-verify` check returns `inspected`/`scope` (M2).
- Verification order: token build → token-lint → tsc (web + native) → vitest → test:scripts →
  registry:check → metrics:check → atlas:verify.

## Decisions taken in this plan
1. **Private vars (`--_x`) are a legal tier.** A declaration passes when its value is one
   `var(--atlas-<non-primitive>)`. Anything else (a `calc()` of tokens, `100vw`, a unitless `1`/`-1`,
   `0`) is listed with a reason in `packages/governance/private-vars.allow.json`; a new one fails.
   Vars set at runtime from TSX (`Tabs` `--_ind-*`, `Slider` `--_pos`) are not declarations and are
   out of scope.
2. **Raw lengths, strict, in `packages/ui-web/src` only** (component implementations — the metric's
   population). Not lengths: values inside `@media` queries (the breakpoint rule owns those, since CSS
   cannot use `var()` there), `em` units (font-relative by design), and the visually-hidden idiom
   (`margin: -1px` in a rule that also sets `clip`). Everything else fails.
3. **Breakpoints:** `--atlas-breakpoint-*` and `@theme inline` `--breakpoint-*` must hold the same names
   and values; every `@media (min-width: N)` in component CSS must equal a breakpoint and every
   `(max-width: N)` must equal a breakpoint minus 1px.
4. **Reduced motion:** a component CSS file that references `--atlas-duration-*` must contain a
   `@media (prefers-reduced-motion` block. File-level, as the roadmap states it.
5. **Alert's exit collapse** measures the alert's own height at dismiss (`--_exit-h`, set from TSX)
   instead of `max-height: 200px`, which clipped tall alerts. CodeBlock's cursor gap uses the existing
   `--atlas-spacing-px`.
6. **Native tokens: derive everything.** Additive drift that exists today becomes visible and is
   accepted (`spacing.9`, `radius.base`, three easings, `textRole.h1/h2`); no existing key changes value.
   The only hard-coded values left are `neutral-0`/`neutral-1000` (pure white and black, already there).
7. **Alert `tokenRoles`** maps its private-var roles to the existing tokens they resolve to
   (`pad-sm|md|lg`, `accent-<variant>`), checked by the existing registry rule (token exists and is in
   `tokensUsed`).

## Tasks
- [ ] 1. `scripts/lib/token-rules.mjs` + `scripts/tests/token-rules.test.mjs`: `privateVarDeclarations`,
      `privateVarViolations`, `rawLengths`, `breakpointViolations`, `reducedMotionMissing`.
- [ ] 2. `token-lint.mjs`: four new rules (`no-private-var-escape`, `no-raw-length`,
      `breakpoint-literal-consistency`, `reduced-motion-required`), the allowlist file, `--json`.
- [ ] 3. Fix Alert (`--_exit-h`) and CodeBlock (`--atlas-spacing-px`); Alert test for the measured height.
- [ ] 4. `atlas-verify`: `code.raw-design-values`, `code.reduced-motion-required` from one token-lint run;
      `INPUTS` for the allowlist; fixture test that a `--atlas-duration-*` file without a reduced-motion
      block FAILs (roadmap verification item 8).
- [ ] 5. `convert-tokens.mjs` derives all 17 exports; regenerate; native `tsc`; a script test that
      changing `--atlas-spacing-4` changes the output (roadmap verification item 7).
- [ ] 6. Alert `tokenRoles`; `registry:build`; `registry:check`.
- [ ] 7. Metric manifest `why` lines; `metrics:check`; roadmap §2d status; handoff progress table.
