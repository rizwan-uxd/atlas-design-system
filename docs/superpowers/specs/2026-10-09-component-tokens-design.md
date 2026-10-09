# Component tokens for Button, Input and Card — design

Date: 2026-10-09 · Status: draft for review · Scope: web (`packages/ui-web`), colour + size

## Goal
Add a component-token layer so each component's visual decisions are named, retrievable and auditable
(AI-readiness checklist §1, "no component tokens"). The layer adds names, not new values: every
component token aliases an existing semantic token.

## Decisions
| Topic | Decision |
|---|---|
| Components | Button, Input, Card. Card is the surface container (there is no `Surface` component). |
| Coverage | Colour (per variant and state) and size/shape (height, padding, gap, radius, font size). Motion, focus ring and disabled opacity stay on the shared semantic tokens. |
| Structure | Aliased layer: a new "Component" block in `packages/tokens/atlas.tokens.css` and a matching Figma collection `Atlas/Component`. Dark mode follows because each token aliases a semantic token that already flips. |
| Rejected | Scoped CSS custom properties inside each module (not retrievable, not bindable in Figma); a JSON-generated pipeline (too large for this step). |

## Rule: aliases only
All new component tokens must alias existing semantic tokens, except Card interactive filled hover,
which preserves the existing computed value until a proper semantic token is approved.

That exception is `color-mix(in oklch, var(--atlas-background-muted) 80%, oklch(1 0 0))` in
`Card.module.css`. The component token `--atlas-card-filled-background-hover` carries that expression
with a comment pointing here. It is not an alias and it is the only one. No other new value is allowed.

## Who uses them
Component tokens are for Atlas component implementation and documentation. Product code and
prototypes keep preferring semantic tokens; they reach for a component token only when styling or
wrapping an Atlas component (for example restyling a Button variant). `atlas/tokens.md` lists the
component tokens in their own section, headed accordingly, so agents do not default to them.

## Naming
Colour and state tokens:
`--atlas-<component>-<variant>-<property>[-<state>]`
e.g. `--atlas-button-primary-background-hover`, `--atlas-input-border-invalid`,
`--atlas-card-outlined-border`.

Size and shape tokens:
`--atlas-<component>-size-<size>-<property>`
e.g. `--atlas-button-size-md-height`, `--atlas-input-size-lg-padding-inline`,
`--atlas-card-size-sm-padding`.

Shape properties that do not vary by size use `--atlas-<component>-<property>`
(e.g. `--atlas-button-radius`, `--atlas-card-radius`).

## Inventory (counted from current CSS; final list fixed in Figma first)
| Component | Colour | Size and shape | Total |
|---|---:|---:|---:|
| Button | 23 | 14 | about 37 |
| Input | about 14 | about 11 | about 25 |
| Card | about 12 | about 9 | about 21 |

Button colour: primary, secondary, destructive (background, hover, active, foreground); outline
(foreground, border, hover, active); ghost (foreground, hover, active); link (foreground, hover,
active); disabled foreground. Button size: height, padding-inline and font size for xs, sm, md, lg,
plus the xs gap and the radius.

## Delivery: four gates
1. **Plan** — this spec, then the implementation plan.
2. **Figma built** — create `Atlas/Component` (aliases of the semantic variables) and rebind the
   Button, Input and Card component sets to it. Figma wins on any disagreement.
3. **Code and verify** — add the CSS block, switch `Button.module.css`, `Input.module.css` and
   `Card.module.css` to the new tokens, update `convert-tokens.mjs`, the `atlas/tokens.md` generator
   and `token-lint` to accept and list the layer, then resync the snapshot.
4. **Final approval** — by the owner.

## Success criteria
- Visual regression reports **zero pixel changes** (everything is an alias; the one exception
  resolves to the same computed value).
- `atlas:verify`, vitest, `tsc`, ESLint and `token-lint` pass.
- `token-lint` still rejects primitive refs in app code and does not let a component token point
  at a primitive (`--atlas-color-*`).
- `atlas/tokens.md` has a component-token section; `atlas/metadata/<Name>.json` lists the
  component tokens each component uses.

## Approval for new token names
These are new token names, so the "no new tokens" check in `atlas:verify` must fail on this PR until
the owner approves explicitly. The PR carries the `atlas-approved-new` label (see `ci.yml`), which
passes `--allow-new-token`. Without the label the check fails; do not bypass it any other way.

## Out of scope
- **Native (`ui-native`).** No native component adopts the tokens in this change. The generated
  token files (for example `packages/ui-native/tokens/atlas.tokens.ts`) may gain the new names as
  a side effect of `convert-tokens.mjs`; that is accepted, and the `Tokens Build` CI diff check
  requires the regenerated file to be committed.
- Motion and focus-ring component tokens, other components, and a spec-generated pipeline.

## Risks
- Rebinding Figma variants is the largest piece of work (Button alone has 6 variants × 4 sizes × 6
  states). Mitigation: bind by variant property in batches and verify by screenshot per set.
- A component token that silently diverges from its semantic target: covered by the zero-pixel
  visual check and a `token-lint` rule that every component token is `var(--atlas-<semantic>)`.
