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
2. `atlas/<Name>.md` — **only** for each component you will render. Skip one you already know from
   the index row (e.g. a plain `Button variant="primary"`).
3. `atlas/tokens.md` — **only** if a screen needs custom layout (spacing, radius, type, surfaces).
4. `references/flow-scaffold.md` — the FlowShell / useFlowState / registry wiring. Read it instead of
   opening an existing prototype.
5. Only when needed: `references/gaps.md` + `atlas/state/candidates.json` (a gap exists), and
   `app/prototypes/_shared/flowRegistry.ts` right before editing it.

Not on the list: `docs/`, `packages/ui-web/src`, `atlas/metadata/*.json`, other prototypes,
`node_modules/next/dist/docs`, Figma MCP. If the index and the component doc cannot answer a
question, open `packages/ui-web/src/<tier>/<Name>/<Name>.tsx` for that one prop and say why in the report.

## Steps
1. **Parse** — list the screens/steps, and for each the Atlas components it needs. Choose the slug
   (kebab-case) and check that one path exists (Glob `app/prototypes/<slug>/*` — not a sweep of
   `app/prototypes/**`); if it exists, edit in place.
2. **Map to the library** — every control, surface and message maps to an index row. Anything that
   does not is a **gap** (Avatar, list row, select, radio, toast, tooltip…).
3. **Handle gaps** — see `references/gaps.md`: compose from primitives + semantic tokens inside the
   prototype, and add or bump the entry in `atlas/state/candidates.json`. Never create a component in
   `packages/`, never add a token, never render a raw `<button>/<input>/<select>/<textarea>/<dialog>`.
4. **Scaffold** — `page.tsx` + `schema.ts` + `steps/<Step>.tsx` per `references/flow-scaffold.md`,
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

## References
- `references/flow-scaffold.md` — files, shapes and the registry entry, with a minimal worked example.
- `references/gaps.md` — composing a gap and the candidates.json entry format.
