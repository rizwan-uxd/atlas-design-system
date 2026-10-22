# packages/figma-sync

**Figma ↔ codebase synchronisation layer.**

```
code-connect/       — Code Connect mappings (.figma.tsx) for all 47 Atlas/Web components
mcp/
  configs/
    figma.config.json — Figma Code Connect CLI config (include paths, parser, aliases)
```

## Publishing Code Connect
```bash
npx figma connect publish --config packages/figma-sync/mcp/configs/figma.config.json
```

## Figma file
`cKYhfaHLCoyMHi9nKr63Ig` — Atlas Design System (Web + Mobile-Native pages)
