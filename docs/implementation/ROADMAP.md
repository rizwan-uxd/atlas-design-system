# Atlas Design System — Implementation Roadmap

> **Status:** Active execution plan · **Generated:** 2026-05-17 · **Source:** `ATLAS-REPO-ANALYSIS.md`
> **Mission:** Evolve Atlas from an *organised component repository* into an *AI-assisted design system platform*.

---

## 0. Roadmap at a glance

| Phase | Theme | Why now | Duration | Exit signal |
|------|------|--------|---------|------------|
| **1. Platform Stability** | Fix the foundations the rest of the work assumes | Unblocks everything; nothing else is safe until paths, scopes, and exports are sane | ~1 day | `tsc --noEmit` clean, sandbox + native both build, tokens regenerate end-to-end |
| **2. Governance Automation** | Move quality out of human memory and into CI | Stops regressions on every push, enables AI-assisted contributions without trust loss | ~2 days | CI green on PRs, token lint enforced, Code Connect parses, Button smoke-tested |
| **3. Developer Experience** | Make the package *feel* like a library, not a folder | Determines how quickly a new contributor (or a generated patch) lands a clean change | ~1 day | `import { Button } from "@atlas/ui-web"` works, web/native APIs match, runnable example |
| **4. Portfolio Layer** | Make the system legible from the outside | This is the difference between "GitHub folder" and "design platform" to a viewer | ~1 day | README is the front door; screenshots, CHANGELOG, AI workflow docs present |
| **5. White-label Readiness** | Prove the system can be re-themed without forking | Validates the long-term thesis; only meaningful after 1–4 are stable | ~1 day | One alternate theme renders the sandbox correctly without source edits |

Total: **~6 focused working days**, scoped so each phase is shippable on its own.

---

## 1. Phase 1 — Platform Stability

> **Goal:** Stop the silent failures. The token converter writes to a dead path, TS sweeps in RN files, and the workspace isn't actually a workspace. Until these are fixed, everything downstream is built on sand.

### 1.1 Fix `scripts/convert-tokens.mjs` paths
- **Objective:** Restore the web→native token pipeline so the script reads from the new `packages/tokens/` location and writes into `packages/ui-native/tokens/`.
- **Files:** `scripts/convert-tokens.mjs`, `package.json` (add `"tokens:build"` script).
- **Steps:**
  1. Update `CSS_PATH` → `packages/tokens/atlas.tokens.css`.
  2. Update `OUT_PATH` → `packages/ui-native/tokens/atlas.tokens.ts`.
  3. Add npm script `"tokens:build": "node scripts/convert-tokens.mjs"`.
  4. Run once, diff output, commit regenerated file.
- **Dependencies:** None.
- **Effort:** 5 min.
- **Impact:** High — without this, tokens silently drift between platforms.
- **Risk:** Low.
- **Validation:** `npm run tokens:build` exits 0; `packages/ui-native/tokens/atlas.tokens.ts` updates; git diff is non-empty only on first run.

### 1.2 Wire root `package.json` as a real workspace
- **Objective:** Turn the repo into an npm workspace so `@atlas/ui-web`, `@atlas/ui-native`, `@atlas/tokens` resolve as packages, not relative paths.
- **Files:** root `package.json`, `packages/ui-web/package.json` (create), `packages/ui-native/package.json`, `packages/tokens/package.json` (create), `apps/sandbox/package.json` (create if relocating).
- **Steps:**
  1. Add `"workspaces": ["packages/*", "apps/*"]` to root `package.json`.
  2. Give each package a name: `@atlas/ui-web`, `@atlas/ui-native`, `@atlas/tokens`, `@atlas/figma-sync`.
  3. Decide: keep `app/` as the sandbox at root **or** move to `apps/sandbox/`. *Recommendation: keep `app/` at root for now — Next.js convention. Defer the `apps/` move to Phase 5.*
  4. Move app-only dependencies (Next.js, app-level Tailwind) out of root if app moves; otherwise leave.
  5. `rm -rf node_modules && npm install` to verify hoisting.
- **Dependencies:** 1.1 (so token script keeps running after move).
- **Effort:** 1–2 hr.
- **Impact:** High — required for publishable packages and clean imports.
- **Risk:** Medium — workspace migrations can break peer-dep resolution. Mitigate by doing it in a single commit and verifying `npm run dev` immediately after.
- **Validation:** `npm install` succeeds; `npm ls @atlas/ui-web` resolves; `npm run dev` still serves the sandbox.

### 1.3 Split `tsconfig.json` into base + per-package
- **Objective:** Stop the root TS check from sweeping in RN files. Eliminate ~20 false errors per `tsc` run.
- **Files:** new `tsconfig.base.json` (root); root `tsconfig.json` (rescope); new `packages/ui-web/tsconfig.json`; new `packages/ui-native/tsconfig.json`.
- **Steps:**
  1. Extract shared compiler options into `tsconfig.base.json` (strict, jsx, module, paths, etc).
  2. Root `tsconfig.json` extends base, `include`: `app/**`, `packages/ui-web/**`.
  3. `packages/ui-native/tsconfig.json` extends base, sets `jsx: "react-native"`, includes only its own files.
  4. Confirm `npx tsc --noEmit` runs clean from root.
- **Dependencies:** 1.2.
- **Effort:** 20 min.
- **Impact:** High — restores trust in `tsc` as a signal.
- **Risk:** Low.
- **Validation:** `npx tsc --noEmit` → 0 errors. Editor squigglies in `packages/ui-native/**` no longer appear in the sandbox VS Code window.

### 1.4 Add `@atlas/ui-web/*` path alias
- **Objective:** Stop importing via `@/packages/ui-web/src/...`. Match the consumer-facing import shape.
- **Files:** `tsconfig.base.json` (paths block), `next.config.ts` if module resolution requires it.
- **Steps:**
  1. Add `"@atlas/ui-web/*": ["./packages/ui-web/src/*"]` to `paths`.
  2. Codemod existing imports — single find/replace across `app/**`: `@/packages/ui-web/src/` → `@atlas/ui-web/`.
  3. Keep `@/*` for app-internal imports.
- **Dependencies:** 1.3.
- **Effort:** 20 min.
- **Impact:** Medium-high — cleans up every file in `app/`.
- **Risk:** Low.
- **Validation:** Sandbox renders identically; grep for `@/packages/ui-web` returns 0 results.

### 1.5 Audit `next.config.ts` turbopack root
- **Objective:** Resolve the suspicious `turbopack: { root: path.join(__dirname, "../..") }` pointing two levels above project root.
- **Files:** `next.config.ts`.
- **Steps:**
  1. Remove the override and run `npm run dev`. If file watching still works, leave it removed.
  2. If breakage, reduce to `path.join(__dirname, "..")` and re-test.
  3. Document the final choice with a one-line comment.
- **Dependencies:** 1.2 (workspace structure finalised).
- **Effort:** 10 min.
- **Impact:** Low-medium — prevents Turbopack scanning unintended directories.
- **Risk:** Low.
- **Validation:** Dev server hot-reloads on edits to `packages/ui-web/**` and `app/**`; does not watch outside the repo.

---

## 2. Phase 2 — Governance Automation

> **Goal:** Move quality from "I'll check it" to "CI checks it." Especially critical when AI is generating code — automated guards are the trust layer.

### 2.1 GitHub Actions CI baseline
- **Objective:** Block PRs that break typecheck, lint, token generation, or Code Connect parse.
- **Files:** new `.github/workflows/ci.yml`.
- **Steps:**
  1. Trigger on `push` and `pull_request`.
  2. Jobs: `setup` (Node 20, npm cache, install) → parallel `typecheck`, `lint`, `tokens-build`, `figma-parse`.
  3. `typecheck`: `npx tsc --noEmit` (web scope).
  4. `lint`: `npx eslint packages/ui-web/src/`.
  5. `tokens-build`: `node scripts/convert-tokens.mjs` and `git diff --exit-code packages/ui-native/tokens/` (fails if generated output isn't committed).
  6. `figma-parse`: `npx figma connect parse --config packages/figma-sync/mcp/configs/figma.config.json` (allow-fail until 2.4 lands).
- **Dependencies:** 1.1, 1.3.
- **Effort:** 45 min.
- **Impact:** Very high — every future change is now validated automatically.
- **Risk:** Low. Start with `continue-on-error: true` for unstable steps, then flip to required.
- **Validation:** Open a throwaway PR with a deliberate type error; CI fails. Revert; CI passes.

### 2.2 Token governance lint
- **Objective:** Detect hardcoded colour/spacing values that should reference `--atlas-*` tokens.
- **Files:** new `packages/governance/token-lint.mjs`, update CI to call it.
- **Steps:**
  1. Walk `packages/ui-web/src/**/*.{ts,tsx,css}` and `app/**/*.{tsx,css}`.
  2. Flag: `#[0-9a-fA-F]{3,8}` literals, `rgb(`/`rgba(`/`oklch(` outside `packages/tokens/`, magic numbers in `px`/`rem` not in an allow-list (line-height, 0, 1px borders).
  3. Allow-list overrides via inline `/* token-lint-disable-next-line */` comment.
  4. Wire into CI as required check.
- **Dependencies:** 2.1.
- **Effort:** 1 hr.
- **Impact:** High — prevents token debt accumulating, especially from AI-generated patches.
- **Risk:** Medium — initial run may surface many violations; fix or grandfather with disable comments in one commit.
- **Validation:** Script reports 0 violations on `main`. A deliberately added `color: #ff0000` fails CI.

### 2.3 Component test scaffold (Button only, as pattern)
- **Objective:** Establish the testing pattern with one well-tested component; expand later.
- **Files:** root `vitest.config.ts`, `packages/ui-web/tests/Button.test.tsx`, `package.json` (test scripts), dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-axe`, `jsdom`.
- **Steps:**
  1. Add Vitest with `jsdom` environment.
  2. Three tests for Button: renders default, renders all variants × sizes matrix, axe a11y check on each variant.
  3. Add `"test": "vitest run"` and `"test:watch": "vitest"`.
  4. Add `test` job to CI.
- **Dependencies:** 2.1.
- **Effort:** 1.5 hr.
- **Impact:** Medium-high — establishes the pattern. Other 11 components inherit the scaffold (~15 min each later).
- **Risk:** Low.
- **Validation:** `npm test` runs and passes locally; CI `test` job green.

### 2.4 Fix Code Connect type mismatches
- **Objective:** Make `figma connect parse` clean so the CI check from 2.1 can become required.
- **Files:** `packages/figma-sync/code-connect/Alert.figma.tsx`, `Switch.figma.tsx`, `Textarea.figma.tsx`.
- **Steps:**
  1. Run `npx figma connect parse` locally; read each error.
  2. Align prop types in the `.figma.tsx` with the actual component prop types.
  3. Re-run until clean.
- **Dependencies:** 2.1.
- **Effort:** 30 min.
- **Impact:** Medium — unblocks `figma connect publish` and proves the round-trip.
- **Risk:** Low.
- **Validation:** `npx figma connect parse` exits 0; CI `figma-parse` step flips from `continue-on-error` to required.

### 2.5 API contracts for primitives
- **Objective:** Lock the v1 API surface for the seven primitives so accidental prop renames or removals fail CI.
- **Files:** new `packages/governance/contracts/<Component>.contract.ts` per primitive (Button, Input, Label, Textarea, Checkbox, Switch, Badge).
- **Steps:**
  1. Define each contract as a TS type assertion: `type ButtonContract = { variant: ButtonVariant; size: ButtonSize; leadingIcon?: ReactNode; ... }`.
  2. Add `assert<Equals<ButtonProps, ButtonContract>>()` style check.
  3. Failure mode: `tsc` errors if `ButtonProps` drifts. No new tool needed.
- **Dependencies:** 2.3, 3.1 (web/native parity must land first or the contract will be drifting against itself).
- **Effort:** 1 hr (7 primitives × ~8 min).
- **Impact:** High portfolio signal — shows API governance maturity without overengineering.
- **Risk:** Low. Contracts can be updated in a single, explicit commit when a breaking change is intentional.
- **Validation:** Renaming `leadingIcon` to `iconStart` in `Button.tsx` causes `tsc` to fail in `Button.contract.ts`.

---

## 3. Phase 3 — Developer Experience

> **Goal:** Make Atlas feel like a library you install, not a folder you navigate.

### 3.1 Standardise web ↔ native prop names
- **Objective:** Same API surface across platforms. AI-generated code and shared docs become reliable.
- **Files:** `packages/ui-native/components/Button/Button.tsx`, anywhere `iconLeft`/`iconRight` are referenced (sandbox/native, tests, Code Connect mappings).
- **Steps:**
  1. Rename props on native Button: `iconLeft` → `leadingIcon`, `iconRight` → `trailingIcon`.
  2. Search for `iconLeft|iconRight` across the repo and update each call site.
  3. Run any native test/build to confirm.
- **Dependencies:** 1.x stable.
- **Effort:** 20 min.
- **Impact:** High symbolic value — the platform is now truly cross-platform in API, not just in folder structure.
- **Risk:** Low.
- **Validation:** Grep `iconLeft\|iconRight` returns 0 hits; native Button still renders.

### 3.2 Barrel exports for `@atlas/ui-web`
- **Objective:** One import path: `import { Button, Card, Tabs } from "@atlas/ui-web"`.
- **Files:** new `packages/ui-web/src/index.ts`; new sub-barrels at `primitives/index.ts`, `compositions/index.ts`, `patterns/index.ts`, `layouts/index.ts`.
- **Steps:**
  1. Each tier folder gets `index.ts` re-exporting its components and types.
  2. Root `src/index.ts` re-exports from each tier.
  3. Add tree-shaking-safe note in comments (only named exports, no default).
- **Dependencies:** 1.4.
- **Effort:** 15 min.
- **Impact:** Very high — defines the public API of the package.
- **Risk:** Low.
- **Validation:** `import { Button } from "@atlas/ui-web"` works in `app/page.tsx`.

### 3.3 Complete `ui-native` barrel
- **Objective:** Export all 12 native components, not just 4.
- **Files:** `packages/ui-native/components/index.ts`.
- **Steps:**
  1. Copy the existing export pattern for the 8 missing components.
  2. Export prop types too.
- **Dependencies:** 3.1 (so prop names are final before being re-exported).
- **Effort:** 10 min.
- **Impact:** High — native package becomes usable.
- **Risk:** None.
- **Validation:** All 12 named imports resolve from `@atlas/ui-native`.

### 3.4 Shared types package (deferred — see "Avoid overengineering")
- **Objective:** Single source of truth for prop unions shared between web and native (`Variant`, `Size`, etc.).
- **Files:** new `packages/types/` with `Variant.ts`, `Size.ts`, `index.ts`.
- **Steps:** *Defer.* Only create this package once 3.1 has stabilised the parity and a second component needs the same shared unions. Premature otherwise — see §6 below.

### 3.5 Folder flattening (`src/` removal) — defer
- **Objective:** Drop the redundant `packages/ui-web/src/` nesting.
- **Decision:** Defer to Phase 5. The win (one path segment) does not justify the disruption to imports, tests, Code Connect mappings, and the visual sandbox while everything else is in motion. Revisit once Phase 4 ships.

### 3.6 Minimal runnable example
- **Objective:** Give a portfolio viewer a 60-second "run this" experience.
- **Files:** new `examples/minimal-next/` with `package.json`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `README.md`.
- **Steps:**
  1. Single-page Next.js app importing Button, Card, Input from `@atlas/ui-web`.
  2. Show a sign-in form: 1 Card with 2 Inputs and 1 Button.
  3. README: `cd examples/minimal-next && npm install && npm run dev`.
- **Dependencies:** 3.2.
- **Effort:** 30 min.
- **Impact:** High portfolio signal.
- **Risk:** Low.
- **Validation:** Fresh clone → `cd examples/minimal-next && npm i && npm run dev` shows the form.

---

## 4. Phase 4 — Portfolio Layer

> **Goal:** The repo communicates "AI-assisted design platform" within 10 seconds of opening the README.

### 4.1 README rewrite
- **Objective:** Replace the 1.4 KB session-log README with a portfolio front door.
- **Files:** `README.md` (rewrite from scratch).
- **Steps:**
  1. Hero line: *"Atlas — an AI-assisted design system platform spanning Figma, web, and native."*
  2. Tech stack badges: React 19, Next.js 16, Tailwind v4, Radix, Expo, OKLCH, Figma Code Connect.
  3. Sandbox screenshot (light + dark side by side).
  4. Three-bullet "what this is": component library across web/native, OKLCH token system with white-label hooks, Figma↔code sync via Code Connect and AI workflows.
  5. Architecture diagram (Mermaid): tokens → primitives → compositions → patterns → layouts; web + native fed by shared tokens; Figma sync side car.
  6. Quick start: `npm install && npm run dev`.
  7. AI workflow section: 3 sentences + link to `packages/ai-workflows/`.
  8. Links: Figma file, sandbox screenshot, QA report, spec docs, ROADMAP.md.
- **Dependencies:** 4.2 (screenshots), 4.4 (AI workflow docs).
- **Effort:** 45 min.
- **Impact:** Very high. This is the only file most visitors will read.
- **Risk:** Low.
- **Validation:** Read it as a stranger: do you know what this is and how to run it in under 30 seconds?

### 4.2 Visual evidence
- **Objective:** Show the system, don't describe it.
- **Files:** new `docs/assets/sandbox-light.png`, `sandbox-dark.png`, optional `sandbox-tour.gif`.
- **Steps:**
  1. Run sandbox; capture full-page screenshot (Chrome DevTools → "Capture full size screenshot").
  2. Repeat with `data-theme="dark"`.
  3. Optional: 8–10 sec GIF cycling variants.
  4. Embed in README (4.1) and `docs/architecture/ATLAS-SPEC/README.md`.
- **Dependencies:** Working sandbox.
- **Effort:** 15 min.
- **Impact:** Very high portfolio signal.
- **Risk:** None.
- **Validation:** Images render on GitHub README.

### 4.3 CHANGELOG + ADR template
- **Objective:** Show this is a maintained system, not a one-off.
- **Files:** new `CHANGELOG.md`, new `docs/decisions/ADR-TEMPLATE.md`.
- **Steps:**
  1. CHANGELOG starts at `v1.0.0 — 2026-05-XX` listing all 12 components, the token system, the AI skill, the Figma integration.
  2. Follow Keep-a-Changelog format. No automation yet (see §6).
  3. ADR template: Title · Date · Status (proposed/accepted/superseded) · Context · Decision · Consequences. Reference from existing `docs/decisions/ATLAS-COMPONENTS-V1.md`.
- **Dependencies:** None.
- **Effort:** 20 min.
- **Impact:** Medium-high — adds maturity signal.
- **Risk:** None.

### 4.4 AI workflow documentation
- **Objective:** Make the AI-assisted dimension visible. This is the genuine differentiator.
- **Files:** new `packages/ai-workflows/README.md`, `packages/ai-workflows/PROMPTS.md`, `packages/ai-workflows/EVALS.md`.
- **Steps:**
  1. `README.md`: explains what the skill does, when it triggers, what guards it enforces, and how it round-trips Figma↔React.
  2. `PROMPTS.md`: catalogue of proven prompts (generate component from spec, run QA session, add a token, update Code Connect mapping) with example outputs.
  3. `EVALS.md`: lightweight eval log — what works, what's brittle, version notes.
  4. Add a `CONTRIBUTING.md` at root pointing to these.
- **Dependencies:** None.
- **Effort:** 1 hr.
- **Impact:** Very high — this is the portfolio differentiator.
- **Risk:** None.
- **Validation:** A reader unfamiliar with the project can describe the AI workflow after 5 minutes.

### 4.5 Spec index + path cleanups
- **Objective:** Tidy small documentation rot identified in the audit.
- **Files:** new `docs/architecture/ATLAS-SPEC/INDEX.md`; find/replace pass across `docs/sessions/**` and `docs/implementation/MIGRATION.md` for stale paths (`components/` at root, `atlas.tokens.css` at root).
- **Steps:**
  1. INDEX lists all 12 specs with status badges.
  2. Update stale path references with a single sed pass.
- **Dependencies:** 1.x complete.
- **Effort:** 20 min.
- **Impact:** Low-medium.
- **Risk:** None.

---

## 5. Phase 5 — White-label Readiness

> **Goal:** Prove the system can be re-skinned without forking. Only meaningful after 1–4 are done — otherwise you're white-labelling an unstable base.

### 5.1 Brand-hook indirection in tokens
- **Objective:** Introduce a thin override layer so consumers can re-skin without editing `atlas.tokens.css`.
- **Files:** `packages/tokens/atlas.tokens.css`, new `packages/tokens/themes/` folder, new `packages/tokens/themes/default.css`, `packages/tokens/themes/README.md`.
- **Steps:**
  1. Move brand-specific OKLCH triplets behind override hooks: `--atlas-brand-hue`, `--atlas-brand-chroma`, `--atlas-brand-lightness-{50,500,900}` etc.
  2. Brand scale derivatives reference those hooks: `--atlas-brand-500: oklch(var(--atlas-brand-lightness-500) var(--atlas-brand-chroma) var(--atlas-brand-hue));`.
  3. `themes/default.css` re-states the current values (no visual change).
  4. `themes/README.md` documents how to write a `themes/acme.css` override.
- **Dependencies:** 1.1, 1.2.
- **Effort:** 1.5 hr.
- **Impact:** High — converts "Atlas" from "one brand" to "a re-skinnable platform."
- **Risk:** Medium — easy to break colour fidelity. Visually diff sandbox before/after.
- **Validation:** Sandbox renders identically with `default.css` loaded; a second theme file (`themes/example-teal.css`) re-skins it without other edits.

### 5.2 Versioning + release ergonomics (lightweight)
- **Objective:** Make versions explicit. Defer changesets/semantic-release until there are real consumers.
- **Files:** root `package.json` (scripts), `CHANGELOG.md`.
- **Steps:**
  1. Add `"version:bump:patch": "npm version patch -ws --include-workspace-root"` (and minor/major variants).
  2. Document in CONTRIBUTING.md: "Bump version + update CHANGELOG in the same PR."
  3. No automated publishing yet.
- **Dependencies:** 1.2 (workspaces).
- **Effort:** 15 min.
- **Impact:** Low-medium.
- **Risk:** None.

### 5.3 Optional folder hygiene
- **Objective:** Apply the deferred renames once everything else is stable.
- **Files:** `packages/figma-sync/code-connect/` → `mappings/`; `packages/ai-workflows/atlas-ui-skill/` → `atlas-skill/`; flatten `docs/architecture/ATLAS-SPEC/` into `docs/architecture/`.
- **Steps:** Rename folders, update all references, run CI.
- **Dependencies:** Everything else stable.
- **Effort:** 1 hr (lots of reference updates).
- **Impact:** Low — cosmetic.
- **Risk:** Medium — disruptive if done early.
- **Recommendation:** Only do this if Phase 1–4 are landed and there's a quiet window. Otherwise leave it.

---

## 6. Implementation order rationale

The phases are sequenced by **dependency**, not by glamour:

1. **Stability first** because every other phase assumes paths resolve, types check, and tokens regenerate. Doing CI before fixing the token script means the CI will be red on day one.
2. **Governance second** because once the foundations are solid, the cheapest moment to add automation is *before* the codebase grows. The token lint catches one violation today, fifty in three months.
3. **DX third** because barrel exports and prop parity are only meaningful once consumers can install the package via workspaces (Phase 1) and tests/contracts guard the API (Phase 2). Doing barrels first means re-doing them when the workspace lands.
4. **Portfolio fourth** because a polished README that describes a broken system is dishonest. You can only credibly say "AI-assisted design platform" once the platform works.
5. **White-label last** because it's a stress test of everything else. If tokens aren't governed (Phase 2), if the API isn't stable (Phase 3.1, 2.5), white-labelling will surface every weakness simultaneously.

The risk profile also rises across phases: Phase 1 is cheap mechanical fixes; Phase 5 touches every colour in the system. Front-loading low-risk wins keeps momentum.

---

## 7. Quick wins (do today)

Fixes that take <15 minutes each and ship immediately:

- **1.1 Token script paths** (5 min) — repo currently broken silently. Fix first.
- **3.3 Native barrel completion** (10 min) — eight missing exports, copy-paste.
- **3.2 Web barrel** (15 min) — defines the public API.
- **3.1 Prop parity rename** (15–20 min including grep) — symbolic win, visible everywhere.
- **4.2 Screenshots** (15 min) — biggest portfolio-per-minute ratio in the entire roadmap.
- **4.3 ADR template + CHANGELOG seed** (15 min) — maturity signal for zero risk.
- **1.5 Audit turbopack root** (10 min) — possibly just delete one line.

Doing only this list takes ~90 minutes and the repo already looks meaningfully more professional from the outside.

---

## 8. Avoid overengineering — explicit non-goals

These are tempting but premature. The bar for adding them later is a **real, named need**, not a hypothetical one.

- **Changesets / semantic-release / automated npm publishing.** Defer until there's a second consumer. A `CHANGELOG.md` + manual `npm version` is sufficient through Phase 5.
- **Shared `@atlas/types` package** (3.4). Don't create it until two packages actually need the same shared unions and copy-paste becomes a maintenance burden. One use is "one use," not a pattern.
- **Storybook.** The visual sandbox at `app/page.tsx` already shows everything. Storybook adds 60 MB of dependencies and a parallel docs site. Revisit only if you need MDX-rich per-component docs that the sandbox can't host.
- **Monorepo tooling (Turborepo, Nx).** npm workspaces are enough for 4 packages. Don't add Turbo until parallel builds become slow.
- **Per-component eval suite for the AI skill.** A markdown log (`EVALS.md`, §4.4) is sufficient signal. Formal eval framework only matters when the skill is consumed by people other than you.
- **Theme runtime switcher UI** beyond the existing dark/light toggle. White-labelling is a build-time concern; don't conflate it with multi-tenancy.
- **Flattening `packages/ui-web/src/`.** Tempting cosmetic change; touches every import path. Defer indefinitely unless a concrete benefit appears.
- **API versioning beyond semver.** No `/v2/` folders, no API deprecation framework. v1 is locked; v2 will be a new major when needed.
- **"Enterprise" features that look impressive but solve no problem:** RBAC on components, audit logs, telemetry, plugin systems. Add none of these.

The honest framing: this is one well-built design system, not a platform that needs to scale to 50 teams. Resist optics-driven complexity.

---

## 9. Success criteria

The roadmap is "done" when *all* of the following are true:

**Architecture**
- Root `package.json` is a real npm workspace; `npm ls @atlas/ui-web` resolves.
- `npx tsc --noEmit` from root returns 0 errors.
- Imports read `@atlas/ui-web` or `@atlas/ui-web/primitives/...`, never `@/packages/ui-web/src/...`.
- `scripts/convert-tokens.mjs` runs end-to-end via `npm run tokens:build` and writes to `packages/ui-native/tokens/`.
- `next.config.ts` has no unexplained turbopack root override.

**Governance**
- GitHub Actions runs typecheck, lint, token-lint, tokens-build-clean, test, and figma-parse on every push and PR.
- Token lint script catches a deliberately injected hardcoded `#hex` value.
- Button has render, matrix, and `jest-axe` tests; the pattern is documented for the other 11.
- Seven primitives have `*.contract.ts` files that fail `tsc` when their props drift.
- `npx figma connect parse` exits 0 against all 12 mappings.

**Web ↔ Native parity**
- `import { Button, Card, ... } from "@atlas/ui-web"` works.
- `import { Button, ... } from "@atlas/ui-native"` works for all 12 components.
- Native and web Button accept identical props (`leadingIcon` / `trailingIcon`).
- Shared types package is **not** created until a real second use case demands it (success = restraint).

**Portfolio**
- README opens with a one-line value prop, shows a sandbox screenshot, and links to the Figma file, sandbox, and AI workflow docs in the first scroll.
- `docs/assets/` contains light + dark sandbox screenshots embedded in README.
- `examples/minimal-next/` runs from a fresh clone in under 60 seconds.
- `CHANGELOG.md` documents v1.0.0; `CONTRIBUTING.md` exists; ADR template exists.
- `packages/ai-workflows/` has README, PROMPTS, and EVALS — the AI dimension is legible to a stranger.

**White-label**
- `packages/tokens/themes/default.css` produces the current visual output.
- A second theme file re-skins the sandbox without modifying source components or `atlas.tokens.css`.

When all of the above hold, the repo is no longer "an organised component repository." It's an AI-assisted design system platform — provable in CI, visible in the README, and reusable across brands.

---

## Appendix A — Phase-by-phase checklist

```
Phase 1 — Platform Stability
[ ] 1.1 convert-tokens.mjs paths fixed + npm script
[ ] 1.2 workspaces wired; per-package package.json + names
[ ] 1.3 tsconfig.base.json + scoped per-package tsconfigs
[ ] 1.4 @atlas/ui-web alias; imports migrated
[ ] 1.5 turbopack.root resolved (removed or justified)

Phase 2 — Governance Automation
[ ] 2.1 .github/workflows/ci.yml runs on push + PR
[ ] 2.2 packages/governance/token-lint.mjs + CI step
[ ] 2.3 Vitest + Button tests (render, matrix, axe)
[ ] 2.4 Code Connect parse clean (Alert, Switch, Textarea fixed)
[ ] 2.5 API contracts for 7 primitives

Phase 3 — Developer Experience
[ ] 3.1 leadingIcon/trailingIcon parity in native
[ ] 3.2 packages/ui-web/src/index.ts + tier sub-barrels
[ ] 3.3 ui-native barrel exports all 12 components
[ ] 3.6 examples/minimal-next/ runnable in 60s

Phase 4 — Portfolio Layer
[ ] 4.1 README rewritten as portfolio front door
[ ] 4.2 docs/assets/ screenshots (light + dark) in README
[ ] 4.3 CHANGELOG.md + ADR-TEMPLATE.md
[ ] 4.4 ai-workflows/{README,PROMPTS,EVALS}.md
[ ] 4.5 ATLAS-SPEC/INDEX.md + stale path sweep

Phase 5 — White-label Readiness
[ ] 5.1 brand-hook indirection + themes/default.css + themes/README.md
[ ] 5.2 version:bump npm scripts + CONTRIBUTING note
[ ] 5.3 (optional) folder renames if time permits
```
