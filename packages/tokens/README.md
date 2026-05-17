# packages/tokens

**Source of truth for all Atlas design tokens.**

| File | Purpose |
|------|---------|
| `atlas.tokens.css` | CSS custom properties (consumed by web components + Next.js app) |
| `atlas.tokens.json` | Raw token JSON (consumed by scripts and tooling) |
| `atlas.figma.tokens.json` | Figma Variables export — round-trips with Figma via figma-sync |

## Token structure
Tokens follow the `--atlas-*` prefix convention. Categories: color, spacing, typography, radius, shadow, motion, z-index.

## Usage
```css
/* In any CSS file */
@import "../../packages/tokens/atlas.tokens.css";
```

## Scripts
`scripts/convert-tokens.mjs` — converts `atlas.tokens.json` → `atlas.tokens.css`.
