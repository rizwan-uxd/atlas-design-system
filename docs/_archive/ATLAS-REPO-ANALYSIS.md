# Atlas Design System — Repository Analysis
> Generated: 2026-05-17 · Scope: post-monorepo restructure audit

---

## Executive summary

The monorepo restructure is solid. Taxonomy is correct, git history is preserved, and the web sandbox runs cleanly. The issues below are the next layer — the gaps between "organised" and "production-grade design system." None require overengineering. Each has a clear, minimal fix.

---

## 1. Architecture improvements

### 1.1 Root `package.json` is not a real workspace root

**Problem:** The root `package.json` has no `workspaces` field. It installs Next.js, React, and Radix at the root level — mixing app dependencies with monorepo scaffolding. `packages/ui-native` has its own `package.json` but isn't wired as a workspace.

**Impact:** Can't `import` from `@atlas/ui-web` as a package. No hoisting. No workspace-level scripts. Prevents publishing individual packages independently.

**Fix (minimal):**
```json
// package.json
{
  "name": "atlas-design-system",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```
Then give each package its own `"name": "@atlas/ui-web"` etc. App dependencies move into `apps/sandbox/package.json`. This is a one-time migration — not optional if white-label scalability is a goal.

---

### 1.2 `tsconfig.json` sweeps in React Native files

**Problem:** `"include": ["**/*.ts", "**/*.tsx"]` catches `packages/ui-native/**` which imports `react-native`, `expo-status-bar`, etc. — none of which are installed at the root. This produces ~20 false TS errors on every `tsc` run.

**Fix:** Add a `tsconfig.base.json` at root with shared config, then give each package its own `tsconfig.json` that extends it. The root tsconfig should only include `app/**` and `packages/ui-web/**`.

```json
// tsconfig.json (root — web scope only)
{
  "extends": "./tsconfig.base.json",
  "include": ["next-env.d.ts", "app/**/*.ts", "app/**/*.tsx", "packages/ui-web/**/*.ts", "packages/ui-web/**/*.tsx"]
}
```

---

### 1.3 `@/*` alias is fragile and verbose

**Problem:** Every component import reads `@/packages/ui-web/src/primitives/Button/Button`. This is noisy, exposes internal paths, and will break if the folder moves again.

**Fix:** Add a second alias in `tsconfig.json`:
```json
"paths": {
  "@/*": ["./*"],
  "@atlas/ui-web/*": ["./packages/ui-web/src/*"]
}
```
Then `import { Button } from "@atlas/ui-web/primitives/Button/Button"` — stable, shorter, matches what a consumer of the published package would write.

---

### 1.4 `scripts/convert-tokens.mjs` references a dead path

**Problem:** The script still reads from `atlas.tokens.css` at the root and writes to `packages/mobile/tokens/atlas.tokens.ts`. Both paths are now wrong after the restructure.

**Fix (two lines):**
```js
const CSS_PATH = path.join(ROOT, "packages/tokens/atlas.tokens.css")   // was: root/atlas.tokens.css
const OUT_PATH = path.join(ROOT, "packages/ui-native/tokens/atlas.tokens.ts") // was: packages/mobile/...
```
Then add a `package.json` script: `"tokens:build": "node scripts/convert-tokens.mjs"`.

---

### 1.5 `next.config.ts` has a suspicious `turbopack.root`

**Problem:** `turbopack: { root: path.join(__dirname, "../..") }` points two levels above the project root. This was likely set during an earlier attempt to resolve monorepo paths and may cause unexpected file-watching scope.

**Fix:** Remove or reduce to `path.join(__dirname, "..")` unless there's a known reason for the extra level.

---

## 2. Folder naming improvements

| Current | Suggested | Reason |
|---------|-----------|--------|
| `packages/figma-sync/code-connect/` | `packages/figma-sync/mappings/` | "code-connect" is a tool name, not a concept. "mappings" is portable if the tool changes. |
| `packages/ui-web/src/` | `packages/ui-web/` (flatten) | The `src/` nesting is redundant — it's already a package. Saves one path segment on every import. |
| `docs/architecture/ATLAS-SPEC/` | `docs/architecture/` (flatten) | `ATLAS-SPEC/` inside `architecture/` is double-nesting — both folders say the same thing. Move the `.md` files directly into `docs/architecture/`. |
| `packages/ai-workflows/atlas-ui-skill/` | `packages/ai-workflows/atlas-skill/` | "ui-skill" is redundant given it's under `ai-workflows`. Drop the "ui" prefix for a cleaner name. |
| `packages/ui-native/tokens/atlas.tokens.ts` | `packages/ui-native/tokens/index.ts` (or `tokens.ts`) | The `atlas.` prefix is redundant inside an Atlas package. |

---

## 3. Component taxonomy issues

### 3.1 Prop name parity breaks web/native symmetry

The API surface differs between web and native for the same components — this makes cross-platform documentation and AI-generated code unreliable.

| Component | Web prop | Native prop |
|-----------|----------|-------------|
| Button | `leadingIcon` | `iconLeft` |
| Button | `trailingIcon` | `iconRight` |

**Fix:** Standardise on `leadingIcon` / `trailingIcon` across both platforms (matches the spec terminology). Update native Button props and internal references.

---

### 3.2 No barrel exports in `packages/ui-web`

**Problem:** `packages/ui-web/src/` has no `index.ts`. Every consumer imports the full internal path. The native package has `components/index.ts` — web doesn't.

**Fix:** Add `packages/ui-web/src/index.ts`:
```ts
// Primitives
export { Button } from "./primitives/Button/Button"
export { Input }  from "./primitives/Input/Input"
// ... etc
// Compositions
export { Alert }  from "./compositions/Alert/Alert"
// Types
export type { ButtonProps, ButtonVariant, ButtonSize } from "./primitives/Button/Button"
```

---

### 3.3 `ui-native/components/index.ts` only exports 4 of 12 components

**Problem:** The native index exports Badge, Label, Alert, Button — and has Phase 2 as a blank comment. The remaining 8 components exist in folders but can't be imported cleanly.

**Fix:** Complete the index. This is a one-time copy-paste of the existing export pattern.

---

### 3.4 `templates/` folder is empty with no definition

**Problem:** `packages/ui-web/src/templates/` is scaffolded but never defined. It signals "coming soon" to collaborators without explaining what qualifies as a template vs a pattern.

**Fix (documentation, not code):** Add `packages/ui-web/src/templates/README.md` with a 3-sentence definition: what a template is, how it differs from a pattern, and one example of what will go here (e.g., `DashboardLayout`, `AuthPage`).

---

## 4. Duplicate logic warnings

### 4.1 Token values are partially duplicated in the convert script

`scripts/convert-tokens.mjs` hardcodes spacing, radius, typography, and motion values directly in the output template — they are NOT read from `atlas.tokens.css`. If a token changes in the CSS file, the native tokens won't update.

**Fix:** Extend the CSS parser in `convert-tokens.mjs` to also read `--atlas-spacing-*`, `--atlas-radius-*`, `--atlas-duration-*`, and `--atlas-font-size-*` values from the CSS file, instead of duplicating them in the script body. The OKLCH→hex logic is already there; the pattern is proven.

---

### 4.2 `packages/ui-native/.gitignore` duplicates root `.gitignore`

The native package has its own `.gitignore` (carried over from when it was `packages/mobile`). Root `.gitignore` now covers `packages/ui-native/node_modules/` and `.expo/`. The local one is redundant.

**Fix:** Delete `packages/ui-native/.gitignore` and confirm root coverage handles it.

---

## 5. Weak scalability areas

### 5.1 No white-label token override layer

**Problem:** `atlas.tokens.css` bakes brand colours directly into `:root`. There is no mechanism for a consumer to swap out the brand palette without editing the source file. This makes white-labelling impossible without forking.

**Fix (minimal):** Introduce a CSS custom property indirection layer:
```css
/* packages/tokens/atlas.tokens.css */
:root {
  /* Brand override hook — redefine in your theme file to white-label */
  --atlas-brand-hue: 264;
  --atlas-brand-chroma: 0.196;
  /* All brand-500 etc. then reference --atlas-brand-hue */
}
```
Then document `packages/tokens/themes/` as the place for white-label overrides: one CSS file per client that re-sets the override hooks.

---

### 5.2 No GitHub Actions / CI pipeline

**Problem:** There is no `.github/workflows/` directory. Every push is unvalidated. With an AI-assisted workflow, this is especially important — generated code needs automated checks.

**Minimum viable CI (`ci.yml`):**
1. `tsc --noEmit` (web scope only)
2. `eslint packages/ui-web/src/`
3. `node scripts/convert-tokens.mjs` — verify it runs without error
4. (Optional) `npx figma connect parse` — validate Code Connect mappings parse cleanly

---

### 5.3 No component package versioning strategy

All packages are `version: 0.1.0` with no changelog and no release workflow. If this becomes a multi-team system, there is no way to communicate breaking changes.

**Fix (lightweight):** Add a `CHANGELOG.md` at root. Use [Keep a Changelog](https://keepachangelog.com) format. Add a single npm script `"version:bump": "npm version patch"`. Defer automated release tooling (changesets, semantic-release) until actually needed.

---

### 5.4 No rapid prototyping entry point

**Problem:** There is no `examples/` content. Someone wanting to evaluate Atlas for a new project has to understand the full monorepo before seeing a single component render. This matters for portfolio presentation.

**Fix:** Create `examples/minimal-next/` — a minimal `page.tsx` that imports from `@atlas/ui-web` and renders 3 components. Document it with `npx create-next-app --example` instructions. No new dependencies.

---

## 6. Missing governance and validation layers

### 6.1 `packages/governance/` is empty

Everything planned in the README (token lint, API contracts, deprecation scripts) is missing. Priority order for implementation:

**Phase 1 — token governance (highest ROI):**
- `packages/governance/token-lint.mjs` — scan all `.tsx` and `.css` files for hardcoded hex values, pixel values not referencing `--atlas-*` tokens, and `rgba()`/`rgb()` patterns. Run in CI.

**Phase 2 — API contracts:**
- `packages/governance/contracts/Button.contract.ts` — export a Zod schema or plain TS type assertion that defines the locked v1 API surface. If a PR changes `ButtonProps`, CI catches it.

**Phase 3 — deprecation tracker:**
- Simple JSON file listing deprecated props with target removal version. Used by the lint script to emit warnings.

---

### 6.2 `packages/ui-web/tests/` and `validations/` are empty

No tests exist for any web component. At minimum, Button should have:
- Render test (renders without crash)
- Snapshot test (variant matrix)
- A11y test with `jest-axe`

**Tooling recommendation:** Vitest + Testing Library + jest-axe. These already work with the Vite/Next.js stack and don't require a separate Jest config.

---

### 6.3 No Figma ↔ code sync validation

`packages/figma-sync/code-connect/` has 12 `.figma.tsx` files but there is no script to verify they still parse after a component refactor. Three of the 12 have pre-existing TypeScript type mismatches (Alert, Switch, Textarea) that would silently fail a `figma connect publish`.

**Fix:** Add a governance check — `npx figma connect parse --config packages/figma-sync/mcp/configs/figma.config.json` — and fix the three type errors in the affected `.figma.tsx` files.

---

## 7. Missing documentation

| Gap | Location | What's needed |
|-----|----------|---------------|
| Root README is minimal | `README.md` | Add: project description, architecture diagram, "getting started in 60 seconds", tech stack badges, link to sandbox, link to Figma file |
| No CONTRIBUTING guide | root | `CONTRIBUTING.md` — how to add a component, token naming rules, PR checklist, commit format |
| No CHANGELOG | root | `CHANGELOG.md` — start with v1.0.0 entry covering all 12 components |
| ADR format undefined | `docs/decisions/` | Add `docs/decisions/ADR-TEMPLATE.md` — dated, author, status, context, decision, consequences |
| Session docs reference old paths | `docs/sessions/`, `docs/implementation/` | Several session files still mention `components/` and `atlas.tokens.css` at root — needs a find-and-replace pass |
| `docs/architecture/ATLAS-SPEC/` has no overview | same | Add a single `INDEX.md` listing all 12 specs with status (spec-complete, verified) and links |

---

## 8. Portfolio presentation improvements

### 8.1 README is not portfolio-grade

The current `README.md` is 1,450 bytes — essentially a session log note. A portfolio viewer landing on the GitHub repo sees no value proposition.

**Target structure for `README.md`:**
1. One-line description + tech stack badges (React 19, Next.js 16, Tailwind v4, Expo, OKLCH)
2. Screenshot or GIF of the sandbox (the visual sandbox already renders all 12 components — one screenshot is all that's needed)
3. "What this is" — 3 bullets: component library, design token system, Figma-code sync
4. Architecture diagram (the tier structure: primitives → compositions → patterns → layouts)
5. Quick start: `npm run dev`
6. Links: Figma file, QA report, spec docs

---

### 8.2 No visual evidence of the system

There are no screenshots, GIFs, or videos in the repo or README. The sandbox at `http://localhost:3000` renders all 12 components across all variants and states — capturing this is 5 minutes of work with any screen recorder.

Add to `public/` or a `docs/assets/` folder:
- `sandbox-preview.png` — full sandbox screenshot (light + dark)
- Embed in README

---

### 8.3 AI-native workflow maturity gaps

The `packages/ai-workflows/atlas-ui-skill/` folder is the most forward-thinking part of this repo and deserves more visibility:

**Current state:** Skill definition exists, rules and token references are documented.

**What's missing:**
- `packages/ai-workflows/PROMPTS.md` — a catalogue of proven prompts for: generating a new component from spec, running a QA session, adding a token, updating Code Connect
- `packages/ai-workflows/EVALS.md` — a lightweight eval log: what the skill gets right, what it gets wrong, how it's improved
- A note in the root README calling out AI-assisted workflows as a feature — this is a genuine differentiator for a portfolio repo

---

## Priority order

Do these first — highest impact, lowest effort:

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Fix `convert-tokens.mjs` paths (§1.4) | 2 min | Breaks silently on every token run |
| 2 | Complete `ui-native/components/index.ts` (§3.3) | 10 min | Native package is unusable without it |
| 3 | Add `packages/ui-web/src/index.ts` barrel (§3.2) | 15 min | Required for clean consumer imports |
| 4 | Fix prop parity `leadingIcon`/`trailingIcon` (§3.1) | 20 min | Cross-platform doc/AI accuracy |
| 5 | Add GitHub Actions CI (§5.2) | 30 min | Catches regressions on every push |
| 6 | Fix `tsconfig.json` scope (§1.2) | 20 min | Eliminates 20 false TS errors |
| 7 | Update README for portfolio (§8.1) | 45 min | First thing anyone sees |
| 8 | Token governance lint script (§6.1) | 1 hr | Prevents token debt from accumulating |
| 9 | Fix `@atlas/ui-web` alias (§1.3) | 20 min | Cleaner imports across the board |
| 10 | White-label token override layer (§5.1) | 2 hrs | Core to the stated white-label goal |
