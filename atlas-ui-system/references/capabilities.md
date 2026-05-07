# Atlas Capabilities (v1 — what's built)

## Built and verified

| Layer | State | Reference |
|---|---|---|
| W3C DTCG tokens | ✓ | `atlas.tokens.json` |
| CSS vars + Tailwind v4 `@theme inline` | ✓ | `atlas.tokens.css` (331 atlas vars) |
| Figma Variables (4 collections, 150 vars) | ✓ | `atlas.figma.tokens.json` · file `cKYhfaHLCoyMHi9nKr63Ig` |
| Mode-swap (Light/Dark, Mobile/Tablet/Desktop) smoke test | ✓ | 3 frames on Atlas/Web |
| All 12 component specs | ✓ | `ATLAS-SPEC/*.md` |
| Button — Atlas/Web component set (144 cells) | ✓ | Figma node `19:2` |
| Button — Atlas/Mobile-Native component set (90 cells) | ✓ | Figma node `29:14` |
| Button — Light + Dark demo frames (web + mobile) | ✓ | Figma nodes `22:2`, `22:17`, `31:14`, `31:29` |
| Button — React component | ✓ | `packages/web/src/components/Button/` |
| Button — Code Connect mapping | ✓ | `Button.figma.tsx` |
| Button — Round-trip sample frame | ✓ | Figma node `36:14` |

## Pending (do not assume built)

- Input · Label · Textarea · Checkbox · Switch · Card · Badge · Alert · Dialog · Tabs · NavBar — Figma sets, React components, Code Connect mappings all pending.
- Atlas/Mobile-Native React Native components — none built.
- Storybook / playground app — none.
- Versioning / release infra — none.

## Workflow (proven on Button)

1. Build Figma component set on Atlas/Web (delta from spec matrix).
2. Mirror on Atlas/Mobile-Native by trimming `sizes` and `states` arrays per spec.
3. Write `packages/web/src/components/<Name>/<Name>.{tsx,variants.ts,types.ts}` + `index.ts`.
4. Write `<Name>.figma.tsx` Code Connect mapping (1:1 enum strings; ignore `State`).
5. Drop instances into a sample frame; trace expected JSX per instance.

## Constraints

- No new components in v1.
- No new tokens without updating `atlas.tokens.json` first (DTCG is source of truth; CSS + Figma JSON regenerate from it).
- No primitive token references in components.
- No raw values in components.
- No `figma.notify()` in `use_figma` scripts (throws). No sync `figma.currentPage = page` (throws — use `setCurrentPageAsync`).
- No `getLocalVariablesAsync()` after page-switch boundary in `use_figma` scripts (unreliable — hardcode Variable IDs).
