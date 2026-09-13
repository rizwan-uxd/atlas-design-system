# Portfolio Implementation Plan

> **Purpose:** UX portfolio showcase for the Atlas Design System monorepo. Three phases, ~5 hours total. Reference this doc at the start of every session — pick a phase, follow its checklist, log outcomes in the Session Log.

**Owner:** Riz · **Created:** 2026-05-23 · **Status:** Not started

---

## How to use this doc

1. At session start: open this file, pick the next unchecked task from the active phase.
2. Mark a task `[x]` only when its acceptance criteria pass.
3. Append an entry to the **Session Log** at the bottom — date, phase, tasks done, blockers.
4. Do **not** start a later phase until the prior phase is fully checked.
5. All file outputs go into the project per `CLAUDE.md` rules — never `/outputs`.

---

## Phase ordering & dependencies

```
Phase 3 (Hero Artifact) ──► Phase 1 (Storefront) ──► Phase 2 (AI Docs)
                  built first        records demo using it      docs reference real artifacts
```

> **Build order overrides task numbering.** Phase 3's `RegistrationFlow` is the hero shown in Phase 1's recording, so build it first. Phase 1 records the sandbox (now including the hero). Phase 2 documents the prompts/evals that produced everything above.

---

## Phase 3: Hero Artifact — `RegistrationFlow` (2.5h)

**Goal:** AI-generated B2B 3-step registration flow, identical props on Web + Native, rendered in sandbox.

**Tier:** `composition` (multi-primitive, stateful). Per `CLAUDE.md`:
- Web → `packages/ui-web/src/compositions/RegistrationFlow/RegistrationFlow.tsx`
- Native → `packages/ui-native/components/RegistrationFlow/RegistrationFlow.tsx`

### Shared API contract (must match exactly across Web + Native)

```ts
type RegistrationFlowProps = {
  initialStep?: 1 | 2 | 3;
  onComplete: (data: RegistrationData) => void;
  onCancel?: () => void;
  companyDefaults?: Partial<CompanyStepData>;
};

type RegistrationData = {
  company: { name: string; domain: string; size: 'sm' | 'md' | 'lg' | 'xl' };
  admin:   { fullName: string; email: string; password: string };
  consent: { terms: boolean; marketing: boolean };
};
```

### Tasks

- [ ] Write shared types file `packages/ui-web/src/compositions/RegistrationFlow/types.ts` (also imported by native via path-mapped re-export)
- [ ] Draft AI prompt for Web variant — paste into `PROMPTS.md` later
- [ ] AI-generate Web `RegistrationFlow.tsx` using Atlas primitives (Input, Label, Button, Card, Badge)
- [ ] Build Step 1 — Company: name, domain, size (Tabs or Radio)
- [ ] Build Step 2 — Admin: fullName, email, password + live strength meter (5-band: empty/weak/fair/good/strong)
- [ ] Build Step 3 — Confirm: read-only summary + terms checkbox + submit
- [ ] Wire stepper UI (Tabs `enclosed` variant) with disabled forward nav until current step valid
- [ ] AI-generate Native variant mirroring Web prop signature 1:1
- [ ] Run prop-parity check: `diff` the exported `RegistrationFlowProps` between Web and Native — must be byte-identical
- [ ] Mount Web `<RegistrationFlow />` in `app/page.tsx` sandbox under a new "Compositions" section
- [ ] Smoke test: `npm run dev` → walk through all 3 steps → submit fires `onComplete` with full payload
- [ ] Verify a11y: tab order, focus rings on inputs, error announcements via `aria-live`
- [ ] Commit: `feat(registration-flow): add web+native RegistrationFlow composition`

**Acceptance:** Sandbox renders flow; all 3 steps navigable; `onComplete` payload matches `RegistrationData`; Web and Native props identical.

---

## Phase 1: Storefront (1.5h)

**Goal:** Polished README + 60s demo GIF that sells the project at a glance.

### Tasks

- [ ] Run `npm run dev`, open sandbox at `http://localhost:3000`
- [ ] Record 60s screen capture: scroll through 12 components → demo `RegistrationFlow` end-to-end → toggle dark mode
- [ ] Capture Web component screenshots — full sandbox, light + dark, save to `public/screenshots/web/`
- [ ] Capture Native component screenshots from Expo preview, save to `public/screenshots/native/`
- [ ] Convert recording to optimized GIF (≤ 5 MB, 12 fps, 1280px wide) → `public/demo.gif`
- [ ] Rewrite `README.md` root section with hero: **"Atlas — an AI-built, dual-platform design system"**
- [ ] Embed `public/demo.gif` directly under the hero
- [ ] Add **Tech Stack** section: Next.js 16, React 19, Tailwind v4, Radix, Expo, Figma Code Connect, Claude
- [ ] Add **Quick Start** section — exactly 3 steps: `git clone` · `npm install` · `npm run dev`
- [ ] Add link block: → `docs/sessions/PORTFOLIO-IMPLEMENTATION-PLAN.md`, → `PROMPTS.md`, → `EVALS.md`
- [ ] Commit: `docs(readme): AI-focused hero + demo GIF + quick start`

**Acceptance:** README renders cleanly on GitHub; GIF autoplays; 3-step quick start works from a fresh clone.

---

## Phase 2: AI Docs (1h)

**Goal:** Make the AI workflow legible and credible to portfolio reviewers.

### Tasks — `PROMPTS.md` (project root)

- [ ] Create `PROMPTS.md` with H1 "AI Prompts Used to Build Atlas"
- [ ] Section: **Component Generator Prompt** — exact prompt template used to scaffold v1 primitives (include token rules, a11y rules, file path)
- [ ] Section: **Web → Native Sync Prompt** — prompt that takes a Web `.tsx` and produces the matching `.native.tsx` with identical props
- [ ] Section: **Variant Audit Prompt** — prompt used during QA sessions to catch token violations
- [ ] Each prompt: include "Inputs," "Expected output," "Example run" subsections

### Tasks — `EVALS.md` (project root)

- [ ] Create `EVALS.md` with H1 "AI Evaluation & Honesty Log"
- [ ] Table: **Success rate per component** (12 rows: scaffolded on first try? Y/N · revisions needed)
- [ ] Section: **Hallucinations caught** — list of fabricated APIs, wrong Radix imports, invented tokens
- [ ] Section: **Manual UX fixes** — list of human edits applied after AI generation (focus rings, RTL, motion)
- [ ] Section: **What AI did well / poorly** — short candid summary
- [ ] Commit: `docs(ai): add PROMPTS.md and EVALS.md`

**Acceptance:** Both files committed at repo root; linked from README; numbers in EVALS reflect actual session log, not estimates.

---

## Session Log

Append one row per working session. Keep entries terse.

| Date | Phase | Tasks completed | Blockers / notes |
|------|-------|------------------|-------------------|
| _yyyy-mm-dd_ | _3_ | _e.g. shared types + Step 1_ | _e.g. need to confirm Radix Tabs supports disabled forward nav_ |

---

## Cross-cutting rules (from `CLAUDE.md`)

- Use Atlas tokens only — no hardcoded colors, spacing, or radii.
- Web components live under `packages/ui-web/src/<tier>/<Name>/`.
- Native components live under `packages/ui-native/components/<Name>/`.
- Never write to `/outputs`. Edit in place.
- Commit + push at end of every session: `git add -A && git commit -m "..." && git push origin main`.
