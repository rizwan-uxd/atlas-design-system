# Atlas Design System — Portfolio Roadmap

> **Goal:** Transform this repository into a UX portfolio asset that demonstrates an end-to-end AI-assisted design-to-code workflow.
> **Total timebox:** 5 hours across 3 phases.

---

## Phase 1 — The Storefront
*Visuals & Positioning · ⏱ ~1.5 hours*

Make the repository immediately legible to a recruiter or design director in under 60 seconds.

- [ ] **Record 60-second sandbox demo** — screen-record `localhost:3000`, sweep through component variants and a live state change (hover, focus, disabled). Export as `docs/assets/demo.gif` or `.mp4`.
- [ ] **Capture Web component screenshots** — screenshot every component row in the sandbox. Save to `docs/assets/screenshots/web/`.
- [ ] **Capture Native component screenshots** — screenshot the Expo / React Native equivalents. Save to `docs/assets/screenshots/native/`.
- [ ] **Rewrite root `README.md`** with the following structure:
  - Hero headline: *"AI-Assisted Design System — from Figma prompt to production component in one session"*
  - Embed demo GIF near the top
  - **AI-Assisted Rapid Prototyping** section (2–3 sentences on the Claude workflow)
  - **Tech Stack** badge row (React 19, Next.js 16, Tailwind v4, Radix UI, Atlas tokens)
  - **3-step Quick Start** (`git clone` → `npm install` → `npm run dev`)
  - Embed two side-by-side screenshots (Web / Native)

### Definition of Done — Phase 1
> The README renders a working GIF and screenshots on GitHub without clicking through to any other file. A reader understands the AI angle within 10 seconds of landing on the repo.

---

## Phase 2 — The AI Pipeline
*Methodology Documentation · ⏱ ~1 hour*

Surface the AI prompting strategy so the portfolio tells a repeatable, credible story.

- [ ] **Create `packages/ai-workflows/PROMPTS.md`** documenting:
  - **Primary component generator prompt** — the exact Claude prompt (or template) used to scaffold a component from a Figma spec or plain-language description. Include input variables (component name, variants, token prefix).
  - **Cross-platform translation prompt** — the prompt used to convert a web component to its React Native equivalent. Document prop-mapping decisions (e.g. `className` → `style`, `onClick` → `onPress`).
  - For each prompt: *Purpose · Input · Output · Known limitations*
- [ ] **Create `packages/ai-workflows/EVALS.md`** documenting:
  - **AI success rates** — which component types Claude handled well vs. struggled with (e.g. "Checkbox indeterminate state required manual fix").
  - **Hallucination tendencies** — token names invented by the model, incorrect Radix API usage, layout assumptions.
  - **Manual UX correction strategies** — the specific human review steps applied after each AI generation pass (focus ring audit, colour contrast check, motion token substitution).

### Definition of Done — Phase 2
> Both files exist, are written in plain English (not code), and together answer the question: *"How exactly did AI assist you, and where did human judgment take over?"*

---

## Phase 3 — The Hero Artifact
*Execution Proof · ⏱ ~2.5 hours*

Build one polished, new component using the documented AI pipeline — then make it the centrepiece of the recording.

- [ ] **Define the component:** B2B mobile registration flow — a multi-step form component (`RegistrationFlow`) with the following screens/steps:
  - Step 1: Company details (company name, industry select)
  - Step 2: Admin account (email, password with strength indicator)
  - Step 3: Confirmation (summary + submit)
- [ ] **Run the Phase 2 prompts** against this component spec and document the Claude output vs. the final committed code (delta = your human contribution).
- [ ] **Implement `RegistrationFlow` — Web** at `packages/ui-web/src/patterns/RegistrationFlow/RegistrationFlow.tsx`:
  - Props: `onComplete`, `initialStep?`, `leadingIcon?`, `trailingIcon?`
  - All form fields use existing Atlas primitives (Input, Label, Button, Badge for step indicator)
  - Tokens only — no hardcoded values
- [ ] **Implement `RegistrationFlow` — Native** at `packages/ui-native/components/RegistrationFlow/RegistrationFlow.tsx`:
  - Prop names mirror Web exactly: `leadingIcon`, `trailingIcon`, `onComplete`, `initialStep?`
  - No `className` — style via Atlas token constants
- [ ] **Add `RegistrationFlow` to the sandbox** (`app/page.tsx`) so it renders at `localhost:3000`
- [ ] **Record the Phase 1 demo using this component as the hero** — show the multi-step flow transitioning through all three steps.

### Definition of Done — Phase 3
> `RegistrationFlow` exists in both `packages/ui-web` and `packages/ui-native` with matching prop signatures. It renders fully in the sandbox. The screen recording captures at least one full step-transition. A viewer can trace the component back to the AI prompt in `PROMPTS.md`.

---

## Summary

| Phase | Focus | Timebox | Key Output |
|---|---|---|---|
| 1 — Storefront | Visuals & positioning | 1.5 h | Rewritten README + demo GIF + screenshots |
| 2 — AI Pipeline | Methodology docs | 1 h | `PROMPTS.md` + `EVALS.md` |
| 3 — Hero Artifact | Execution proof | 2.5 h | `RegistrationFlow` (Web + Native) + recording |

**Total: 5 hours.**
