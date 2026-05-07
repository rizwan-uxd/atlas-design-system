# Atlas v1 — Component Specs

Per-component specs for the locked v1 scope. Every spec follows `_template.md` and references semantic tokens only (no primitives, no hex). Atlas/Web and Atlas/Mobile-Native both build against these specs.

## Index

| # | Component | Spec | Notes |
|---|---|---|---|
| 0 | _template_ | [_template.md](./_template.md) | Spec skeleton — copy when adding new components |
| 1 | Button | [Button.md](./Button.md) | Reference spec — most complete; use as the model |
| 2 | Input | [Input.md](./Input.md) | Single-line text entry |
| 3 | Label | [Label.md](./Label.md) | Form label with required/optional state |
| 4 | Textarea | [Textarea.md](./Textarea.md) | Multi-line text entry |
| 5 | Checkbox | [Checkbox.md](./Checkbox.md) | Includes indeterminate state |
| 6 | Switch | [Switch.md](./Switch.md) | RN uses native Switch by default |
| 7 | Card | [Card.md](./Card.md) | Compound — Header / Content / Footer |
| 8 | Badge | [Badge.md](./Badge.md) | Status / category labels |
| 9 | Alert | [Alert.md](./Alert.md) | Inline (not toast) |
| 10 | Dialog | [Dialog.md](./Dialog.md) | Modal · sheet · drawer; mobile defaults to sheet |
| 11 | Tabs | [Tabs.md](./Tabs.md) | Top tabs only; bottom nav lives in NavBar |
| 12 | NavBar | [NavBar.md](./NavBar.md) | Web top bar / Mobile header + tab bar |

## How to read a spec

Each spec covers, in order:

1. **Anatomy** — slots and which are required vs optional.
2. **Variants × Sizes × States** — the matrix every implementation must support.
3. **Token mappings** — semantic tokens per (variant × state). Tables call out only the cells that differ from default.
4. **Responsive behavior** — what changes across the four platforms.
5. **Accessibility** — role, keyboard, focus, contrast, screen-reader, reduced motion.
6. **Code API** — TypeScript prop signature, defaults, slots.
7. **Code Connect mapping** — Figma property → React prop, 1-to-1 where possible.
8. **Test checklist** — gates before marking the component done.

## Cross-cutting standards (every component obeys)

These come from `ATLAS-COMPONENTS-V1.md` and apply universally:

- **Tokens.** Semantic tokens only. No primitives. No hex literals. No magic numbers.
- **Theming.** Light + Dark must work without component-level overrides.
- **RTL.** Logical properties on web (`margin-inline-*`, `padding-inline-*`); `start`/`end` semantics on RN. No `left`/`right`.
- **Touch targets.** Mobile-native components have hit areas ≥ `--atlas-touch-min` (44px).
- **A11y.** WCAG 2.1 AA contrast minimum. Visible focus ring (`--atlas-focus-ring`). Keyboard equivalents for every pointer interaction on web.
- **Motion.** Only `motion.duration.*` and `motion.easing.*` tokens. Default `var(--atlas-duration-fast) var(--atlas-easing-standard)`. Respect `prefers-reduced-motion`.
- **Variants.** Defined via CVA on both platforms with identical prop names.
- **Naming.** PascalCase. Figma component name = code component name. Dot-namespaced sub-components in code (`Card.Header`); `/` for variant grouping inside Figma component sets.

## Adding a new component

1. Copy `_template.md` to `<ComponentName>.md`.
2. Fill in every section. Reference semantic tokens only.
3. List all four platforms in the Responsive section, even if the answer is "same as default".
4. Define variants, sizes, and states. State transitions must be explicit.
5. Write the prop interface; mark defaults clearly.
6. Add a Code Connect mapping table.
7. Update this index.
8. Move to v1.1+ deferred list in `ATLAS-COMPONENTS-V1.md` if not in v1.

## Build sequence (next phase)

After all 12 specs are written (this folder is the deliverable):

1. Create the Atlas Figma file(s) per packaging decision.
2. Import the 4 Variables collections (Primitives, Semantic, Layout, Responsive Type).
3. Build each component in Figma against its spec.
4. Write each React + RN component against the same spec.
5. Wire **Code Connect** to close the Figma → React loop.

That's the path to "design today → working prototype same day."
