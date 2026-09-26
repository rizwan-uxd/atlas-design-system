# Atlas component expansion, batch 2: plan and shared understanding

Status: fully agreed, **not started**. Execute only when the user says "start", beginning with Phase 1 (Spinner).
Written: 2026-09-25. Follows `docs/componentlist plan _25 sep.md` and reuses its process.

Components (web only): **Spinner, Skeleton, Image, Progress, Radio Group, Slider**. Six, by the user's decision (Q1).

---

## 1. Sources of authority

| Source | Role |
|---|---|
| Atlas Figma library, file `cKYhfaHLCoyMHi9nKr63Ig` | Implementation authority |
| ReUI shadcn Figma file `BOJ49F6rceAmcCC70lSiav` | Structural references only |
| GitHub repo `rizwan-uxd/atlas-design-system` | Code authority |

Reference nodes (from the user's list):

| Phase | Component | Reference node |
|---|---|---|
| 1 | Spinner | `42836:15305` |
| 2 | Skeleton | `42836:14236` |
| 3 | Image | merged to `main` (`61eab54`) | none (radius, background-muted, foreground-subtle, icon-size-lg, icon-stroke-lg and the Skeleton pulse tokens all exist) | one primitive with Ratio (ten values incl. auto, vs the reference's nine) x State (loaded, loading, error) instead of the reference's nine ratio-only variants; fit and radius are code props, not Figma variants; loaded variants use a token-bound stand-in scene; error icon stroke weight numeric (nested icon strokes cannot bind) |
| 3 | Image | `42732:27744` |
| 4 | Progress | `42829:9378` |
| 5 | Radio Group | `42830:1880` |
| 6 | Slider | `42836:14404` |

## 2. Non-negotiable rules

Same as the previous plan, plus:

- No raw values. Atlas tokens only (`--atlas-*`, semantic tokens, no primitive refs in app code).
- A missing token goes to Figma foundations first, then code tokens, then the component.
- No code until the Figma page has an explicit **"approved"** reply from the user in chat.
- No next component until the previous one has final approval.
- Figma wins over code and drives it. If code needs something Figma does not draw, fix Figma first.
- Figma work goes through the authenticated Figma MCP only.
- **No new dependencies. No Radix packages are installed (Q3).** Everything is built from Atlas foundations.
- Read `node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md).
- `atlas/` is generated, never hand-edited.

## 3. Workflow per phase (A to E)

- **A. Audit.** Read the reference node with `get_design_context` (load `figma:figma-design-to-code` first) against Atlas foundations and existing components. Post a mapping table, proposed tokens and gaps. Wait for the user's answers. One audit per phase, at the start of that phase (Q6).
- **B. Figma.** Load `figma:figma-use` and `figma:figma-generate-library` before `use_figma`. Create a page after the last component page. Build the component set with properties, a Light and Dark examples frame and a usage panel, following the Divider page layout. Bind everything to variables.
- **C. Gate 1.** User replies "approved".
- **D. Code.** `atlas-figma-sync` pull; implement through `atlas-component`; Code Connect file in `packages/figma-sync/code-connect/`; contract in `packages/governance/contracts/`; vitest and jest-axe tests; sandbox section in `app/page.tsx` with browser check; `atlas-verify` (`node scripts/atlas-verify.mjs --allow-new-component --scope "<globs>"`).
- **E. Gate 2.** User replies "approved", then commit on the component branch and merge `--no-ff` to `main`. Trailer: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Push only when asked.

## 4. Settled decisions

| # | Decision |
|---|---|
| Q1 | Six components: Spinner, Skeleton, Image, Progress, Radio Group, Slider. |
| Q2/Q8 | Order: Spinner, Skeleton, Image, Progress, Radio Group, Slider. Image follows Skeleton because its loading state reuses Skeleton. |
| Q3 | No Radix or other new dependencies. Radio Group and Slider are hand-built. |
| Q4 | Tier: all six in `packages/ui-web/src/primitives/<Name>/`. Radio Group is a compound export (`RadioGroup` + `RadioGroupItem`) in one folder. |
| Q5 | Contracts in `packages/governance/contracts/` for **all six**. |
| Q6 | Audit one component at a time at the start of its phase. No Figma edits until the mapping is approved. |
| Q7 | Branch `feat/<name>` per component (convention only, matches merged history): `feat/spinner`, `feat/skeleton`, `feat/image`, `feat/progress`, `feat/radio-group`, `feat/slider`. Nothing committed before Gate 2. |
| Q9 | Radio Group: native `<input type="radio">`, no custom ARIA divs. |
| Q10 | Slider: default to native `<input type="range">` (a), single thumb, horizontal. Switch to a custom pointer-event slider (b) only if the Figma node draws a range or vertical orientation; flag it at that audit. |
| Q11 | Image: plain `<img>` wrapper (aspect ratio, `object-fit`, radius token, Skeleton loading state, error fallback slot). No `next/image`. |
| Q12 | Spinner is standalone. Button is not changed; log "Button loading slot uses Spinner" in `candidates.json`. |
| Q13 | This file. |

Also: native parity is logged in `atlas/state/candidates.json` per component, not built. Standing approval for the semantic tokens these components need; each goes Figma, then code tokens (`atlas.tokens.css`, `.json`, `.figma.tokens.json`), then the component. Motion tokens must honour `prefers-reduced-motion`.

## 5. Phases

1. **Spinner** (`42836:15305`), branch `feat/spinner`. Standalone; motion honours reduced-motion.
2. **Skeleton** (`42836:14236`), branch `feat/skeleton`.
3. **Image** (`42732:27744`), branch `feat/image`. Uses Skeleton.
4. **Progress** (`42829:9378`), branch `feat/progress`. Plain `role="progressbar"`.
5. **Radio Group** (`42830:1880`), branch `feat/radio-group`.
6. **Slider** (`42836:14404`), branch `feat/slider`. Highest risk; decide native versus custom at audit.

## 6. Q9 resolved

**Q9: Radio Group implementation.** Decided 2026-09-25: **(a) native `<input type="radio">`**. No open decisions remain.

- Checkbox uses Radix only as an unstyled behavior layer (state, keyboard, ARIA). All its looks come from Atlas tokens. Radix is not a visual choice.
- With Radix ruled out, the options are (a) native `<input type="radio">` styled with Atlas tokens, or (b) custom `role="radio"` divs with hand-written roving focus.
- Recommendation: **(a)**. The browser provides arrow-key movement, grouping and form submission. The Figma look is applied with `appearance: none` and a tokenised indicator, so it looks identical either way.
- Consequence to accept: Radio Group's internals differ from Checkbox's (native versus Radix). Visuals and the public API stay consistent.

## 7. Completion criteria

A component is done only when Gate 1 and Gate 2 both carry an explicit "approved"; code, tests, contract, sync output, docs and state updates are committed together on its branch; `atlas-verify` passes; and the branch is merged to `main`. Only then does the next phase begin.

## 8. Files likely touched (per component)

- `packages/ui-web/src/primitives/<Name>/`
- `packages/figma-sync/code-connect/<Name>.figma.tsx`
- `packages/governance/contracts/`
- `packages/tokens/atlas.tokens.css`, `.json`, `.figma.tokens.json` (only if new tokens)
- `app/page.tsx` (sandbox section)
- `atlas/state/candidates.json`, `atlas/state/decisions.json`, `atlas/state/status.json`
- `atlas/` regenerated by `atlas-figma-sync`, never hand-edited

## 9. Start of next session

1. Read this file and `AGENTS.md`.
2. Wait for the user's "start".
3. Phase 1, step A: audit Spinner `42836:15305`, deliver the mapping table and any proposed tokens. Create `feat/spinner`. No Figma edits until the mapping is approved.

---

## 10. Progress log

Rule (user, 2026-09-26): audit findings are hypotheses until verified against `atlas.tokens.css` and Figma; add tokens only for real gaps, through Figma first. Order: Skeleton → Image → Progress → Radio Group → Slider, one full cycle per component.

| Phase | Component | Status | Tokens added (verified missing) | Deviations from the reference |
|---|---|---|---|---|
| 1 | Spinner | merged to `main` (`6e6fea8`) | `duration/spin` 1000ms; code `icon-stroke-*` (already in Figma) | lowercase variants; sizes xs–lg beyond the single 16px |
| 2 | Skeleton | merged to `main` (`8a19d7d`) | `duration/pulse` 2000ms, `opacity/pulse` 0.5 (Figma `530:2`, `530:3`; code too) | one primitive (`shape` rect \| circle) instead of the five Avatar/Card/Text/Form/Table variants, which are composed examples; existing opacity tokens (disabled .5, hover .9, overlay .6) checked and rejected on semantics |
| 4 | Progress | merged to `main` (branch `feat/progress`; Figma page `538:2`, set `538:7`) | none (`spacing/1`, `radius/full`, `background-muted`, `primary`, `duration/base`, `duration/pulse`, `easing/standard`, `easing/linear` all exist; indeterminate slide reuses `duration/pulse`, DEC-021) | one 4px bar with Figma `State` determinate \| indeterminate instead of the 11 `Progress=` variants; no thumb (Slider owns it); fill `primary`, not black; `value`, `max`, label, value text and helper text are props or slots; optional `aria-valuetext`; Figma example fills are overlay rectangles because the Plugin API cannot resize a fill inside an instance |

Verified for Skeleton against Figma and CSS: fill `background-muted`; radius `radius/md`, `radius/full`; spacing 4/8/16/24/32/40 exist (`spacing/1…10`); durations 0/120/200/320/1000 and easings exist, no pulse period.

Next: Phase 5 Radio Group (audited, decisions given, not built), then Slider. Decisions already given for those two are in `docs/HANDOFF-batch2-next-session.md`.
