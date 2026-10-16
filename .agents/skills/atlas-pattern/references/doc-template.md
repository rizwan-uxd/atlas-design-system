# Pattern doc and example

`atlas-sync` validates every file in `packages/governance/patterns/`; a failure prints
`✗ pattern validation failed` with the file and the reason and stops the run.

## File shape
```
---
summary: one sentence, what the screen is for (used in the atlas/index.md Patterns table)
---
# <Title>

## Use when
## Don't use when
## Decision rules
## Components and variants
## Layout and density
## Hierarchy and composition
## Responsive behavior
## States
## Accessibility
## Anti-patterns
## Example
{{example}}
```
All eleven sections must exist and be non-empty. `{{example}}` is replaced by the example file in the
generated copy.

## What each section says
- **Use when / Don't use when** — 2 to 4 bullets each; every "don't" names the pattern or component to use instead.
- **Decision rules** — one decision per bullet with its reason: which component, which variant, what never to do.
- **Components and variants** — one line per component, exactly `- \`Name\` variant: \`a\`, \`b\` · size: \`md\``.
  `Name` must be a component in `atlas/index.md` (not a sub-part: `BubbleGroup`, `CardHeader`, `TabsList` fail).
  Every `variant:` and `size:` value must exist in code **and** be drawn in Figma. A line with no variants
  is just `- \`Divider\``. Any other line shape fails the check.
- **Layout and density** — spacing as `--atlas-spacing-N`, logical properties, widths.
- **Hierarchy and composition** — what is largest, what is muted; typography from `--atlas-text-*`
  (`h1`..`h4`, `body`, `body-sm`, `caption`). Every token must exist in `atlas/tokens.md`.
- **Responsive behavior** — the phone rule; only what the Mobile 390 frame draws.
- **States** — default, loading, empty, error, disabled, plus any dialog; matches the state frames.
- **Accessibility** — roles, names, focus order, never colour alone.
- **Anti-patterns** — 4 to 7 concrete mistakes.

## Example file
`packages/governance/patterns/examples/<slug>.example.tsx` is real TSX compiled by `npx tsc --noEmit`:
- Imports come from `@atlas/ui-web/<tier>/<Name>/<Name>` as in the sibling examples; no raw HTML controls
  where a component exists; styles use `var(--atlas-...)` only (token-lint runs on the repo).
- Keep it short: one exported component showing the main state, the loading state and the key action.
  Behaviour the doc describes but the example omits is fine if the doc marks it "not drawn" or the report lists it.
- Match the sibling's style (`settings.example.tsx`, `members-permissions.example.tsx`).

## After the files exist
Add the slug to the pattern list in `packages/governance/README.md`, run `npm run atlas:sync`, then
`npx tsc --noEmit` and `atlas-verify`. The sync writes `atlas/patterns/<slug>.md` and the index row.
