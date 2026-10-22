# packages/tokens

**`atlas.tokens.css` is the source of truth for all Atlas design tokens.** Every generator reads that
file; the two JSON files below are hand-maintained mirrors, not build outputs.

| File | Purpose |
|------|---------|
| `atlas.tokens.css` | CSS custom properties, and the source of truth. Consumed by web components and the Next.js app, and read by every script. |
| `atlas.tokens.json` | DTCG / Tokens-Studio mirror. **Hand-maintained; nothing reads it and nothing generates it.** |
| `atlas.figma.tokens.json` | Figma Variables collection shape, carrying the Figma-scale values (opacity in percent, DEC-058). **Hand-maintained; nothing reads it and nothing generates it.** |

Because the two JSON files are neither generated nor validated, they can drift from the CSS silently.
`docs/ATLAS-DELIVERY-ROADMAP.md` (D1) covers putting them under CI.

## Token structure
Tokens use the `--atlas-*` prefix in three layers:

1. **Primitives** — `--atlas-color-*` ramps (OKLCH). Token definitions only, never app or component code.
2. **Semantic** — no `color` segment (`--atlas-background`, `--atlas-foreground-muted`, `--atlas-primary`).
   Each aliases a primitive. **This is what app code uses.** The naming convention is load-bearing:
   `token-lint` and `atlas-verify` both use the presence of `color` to reject primitive use.
3. **Component** — `--atlas-<component>-<variant>-<property>[-<state>]` inside the
   `/* BEGIN:component-tokens */` block, for Button, Input, Card, Textarea, Checkbox, Switch, Radio and
   Select. Each must alias exactly one semantic token; `token-lint` enforces it. For implementing Atlas
   components, not for product code.

Non-colour scales (spacing, radius, type, motion, shadow, z-index, layout) have **no semantic layer** —
components reference them directly. Dark mode re-aliases the semantic colour tokens under
`[data-theme="dark"], .dark`.

## Usage
```css
/* In any CSS file */
@import "../../packages/tokens/atlas.tokens.css";
```

## Scripts
`scripts/convert-tokens.mjs` generates **`packages/ui-native/tokens/atlas.tokens.ts`** from
`atlas.tokens.css` (CSS → TS, not JSON → CSS). It derives the primitive and semantic colour objects by
parsing the CSS; the other scales are currently literals inside the script, so the CI `tokens-build`
diff proves only that the script is idempotent. Run `npm run tokens:build` and commit the result.
