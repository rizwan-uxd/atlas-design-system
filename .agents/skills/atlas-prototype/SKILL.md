---
name: atlas-prototype
description: Build a coded prototype flow or screen in app/prototypes/<slug> from existing Atlas components — "prototype a send-money flow", "mock up a settings screen", "clone this app's onboarding". Uses FlowShell, useFlowState and the flow registry, reads only atlas/index.md plus the atlas/<Name>.md of components it uses, composes gaps locally and logs them in atlas/state/candidates.json, and ends with atlas-verify. Not for creating or changing a library component in packages/ui-web (that is atlas-component) and never calls Figma.
---

# atlas-prototype

A prototype is app code that **consumes** the library. It never changes `packages/ui-web`,
tokens or Figma, and it never reads `docs/`.

## Scope
- Writes: `app/prototypes/<slug>/**`, one entry in `app/prototypes/_shared/flowRegistry.ts`,
  and (only for gaps) a candidate entry in `atlas/state/candidates.json`.
- Never writes: `packages/**`, `atlas/` outside `state/candidates.json`, `app/prototypes/_shared/*`
  other than the registry, other prototypes.

## Read — in this order, and nothing else
1. `atlas/index.md` — pick components, variants and sizes from its table.
2. `atlas/<Name>.md` — **only** for each component you will render. Its generated `## API` block has
   the import line, every own prop with its type, the native element it extends and each
   subcomponent's props — the source adds nothing, so don't open it.
3. `atlas/tokens.md` — **required before you write the first `var(--atlas-…)`** in a style. Every token
   name you write must appear there; never guess a name from a pattern (`font-weight-normal` does not
   exist — it is `font-weight-regular`). Skip it only if no screen has an inline style.
4. `references/flow-scaffold.md` — the FlowShell / useFlowState / registry wiring. Read it instead of
   opening an existing prototype.
5. Only when needed: `references/gaps.md` + `atlas/state/candidates.json` (a gap exists), and
   `app/prototypes/_shared/flowRegistry.ts` right before editing it.

Not on the list: `docs/`, `packages/ui-web/src`, `atlas/metadata/*.json`, other prototypes,
`node_modules/next/dist/docs`, Figma MCP. If the index and the component doc cannot answer a
question, name the missing fact in the report — it is a generator gap to fix, not a reason to read source.

## Steps
1. **Parse** — list the screens/steps, and for each the Atlas components it needs. Choose the slug
   (kebab-case) and check that one path exists (Glob `app/prototypes/<slug>/*` — not a sweep of
   `app/prototypes/**`); if it exists, edit in place.
2. **Map to the library** — every control, surface and message maps to an index row. Anything that
   does not is a **gap** (Avatar, list row, select, radio, toast, tooltip…).
3. **Handle gaps** — **read `references/gaps.md` now (required whenever step 2 found anything that
   is not a plain index row, and whenever you are unsure)**: compose from primitives + semantic tokens inside the
   prototype, and add or bump the entry in `atlas/state/candidates.json`. Never create a component in
   `packages/`, never add a token, never render a raw `<button>/<input>/<select>/<textarea>/<dialog>`.
4. **Scaffold** — `page.tsx` + `schema.ts` + `steps/<Step>.tsx` per `references/flow-scaffold.md`
   (required read before the first file; it documents `_shared/`, so don't open those files),
   and register the slug in `flowRegistry.ts` (`exercises` = the Atlas components actually used).
5. **Build the screens** — Atlas components with values from their metadata row; layout via inline
   styles using only `var(--atlas-*)` semantic tokens (logical properties: `paddingInline`,
   `marginBlockStart`, `insetInlineEnd`). Every interactive element is an Atlas component or has
   `role`, `tabIndex={0}` and a key handler. Loading, disabled, error and empty states are wired
   through `mockApi.ts` where a step submits.
6. **Verify** — run the `atlas-verify` skill with
   `--scope "app/prototypes/<slug>/**,app/prototypes/_shared/flowRegistry.ts,atlas/state/candidates.json"`
   (drop the last glob if no gap was logged). Fix and re-run until it exits 0.
7. **Report** — slug and route (`/prototypes/<slug>`), screens built, components used, gaps composed
   + candidate ids, the files you read (should match the Read list), and the verify summary line.

## Rules
- A needed variant or size that is not in the index is a Figma decision: use the closest listed value,
  and name the missing value in the report. Don't invent one, don't cast around the type.
- Brand colours of a cloned app that have no semantic token go in `app/prototypes/<slug>/brand.ts`
  as one named `const` (DEC-008) — the only file where literals are allowed. Status, text and
  surfaces still use semantic tokens. No colour literals elsewhere, no `token-lint-disable` comments.
- Don't refactor `_shared/` or other prototypes. A shared-helper need is reported, not built.

## References — required reads, at the step that names them
- `references/flow-scaffold.md` — files, shapes and the registry entry, with a minimal worked example.
- `references/gaps.md` — composing a gap and the candidates.json entry format.
