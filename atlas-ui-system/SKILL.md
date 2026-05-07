---
name: atlas-ui-system
description: Silent enforcement layer for Atlas Design System v1. Triggers whenever the user works on Atlas components — Button/Input/Label/Textarea/Checkbox/Switch/Card/Badge/Alert/Dialog/Tabs/NavBar — touches files in `packages/web/`, `packages/mobile/`, `ATLAS-SPEC/`, `atlas.tokens.*`, or builds anything in the Atlas Figma file (`cKYhfaHLCoyMHi9nKr63Ig`). Use this skill whenever the user mentions Atlas, design tokens, component variants, Code Connect, semantic tokens, OKLCH colors, the matrix (variant × size × state), or any Figma↔React round-trip work, even if "Atlas" isn't said explicitly. Activate the six guards on every turn — token-enforcer, component-scope-guard, consistency-guard, state-helper, structure-enforcer, accessibility-lite — and emit only structured violation flags; never re-explain the system.
---

# Atlas UI System v1 — Enforcement Skill

## Mode

- minimal output
- structured only
- do not explain
- do not redefine system
- do not introduce new tokens / components
- do not repeat context
- flag violations only (concise)

## Priority

`rules > skills > generation`

## Context (load implicitly)

| Layer | Source |
|---|---|
| rules | `claude.md` → "Conventions & guardrails" + `ATLAS-SPEC/README.md` cross-cutting standards |
| tokens | `atlas.tokens.json` (DTCG) · `atlas.tokens.css` · `atlas.figma.tokens.json` · [`references/tokens.md`](references/tokens.md) |
| capabilities | [`references/capabilities.md`](references/capabilities.md) |
| memory | `claude.md` (project state) · [`references/memory.md`](references/memory.md) |

Read `references/rules.md` first on every activation. It is the source of truth for the six guards.

## Guards (silent, always on)

1. **token-enforcer** — No hex literals. No primitive token references downstream. No magic numbers for spacing / radius / motion / opacity. Composition uses semantic tokens only (`--atlas-primary`, never `--atlas-blue-500`).
2. **component-scope-guard** — V1 surface is the 12 locked components only. Do not invent new components. Deferred list lives in `ATLAS-COMPONENTS-V1.md`.
3. **consistency-guard** — Reuse the Button playbook (CVA + Radix on web; trim sizes/states for mobile). PascalCase identical Figma↔code. Identical enum strings between Figma `Variant`/`Size` and React `variant`/`size`.
4. **state-helper** — Every interactive component must declare: `default · hover (web only) · focus-visible · active · disabled · loading` where applicable per spec. Mobile drops `hover`. `loading` keeps width and shows spinner in leading-icon slot.
5. **structure-enforcer** — Logical properties only (`inline-start`, `margin-inline-*`); no `left`/`right`. Touch ≥ `--atlas-touch-min` on mobile-native. Motion via `--atlas-duration-*` + `--atlas-easing-*` only; respect `prefers-reduced-motion`. Variant matrix lives in CVA, never in a per-state branch.
6. **accessibility-lite** — `role`, keyboard equivalents, visible `--atlas-focus-ring`, contrast 4.5:1 in both modes, `aria-busy` on loading, `aria-disabled` on disabled, `aria-label` on icon-only buttons.

## Output protocol

Default response when no violation is detected: proceed with the work; emit nothing about Atlas.

When a violation is detected, emit a single block — nothing else:

```
[atlas-violation]
guard:    <token-enforcer | component-scope-guard | consistency-guard | state-helper | structure-enforcer | accessibility-lite>
location: <file:line or figma node id>
issue:    <one-line description>
fix:      <one-line corrective action; reference a token/spec>
```

Multiple violations → repeat the block. Never wrap in prose. Never add a closing summary.

## When this skill triggers

- File path contains `packages/web/`, `packages/mobile/`, `ATLAS-SPEC/`, `atlas.tokens.*`, or `atlas.figma.tokens.json`
- Any `use_figma` call against fileKey `cKYhfaHLCoyMHi9nKr63Ig`
- User mentions: Atlas, design tokens, OKLCH, semantic tokens, primitive tokens, Code Connect, the matrix, variant × size × state, light/dark mode swap, RTL, touch min
- User asks for any of the 12 v1 components (Button · Input · Label · Textarea · Checkbox · Switch · Card · Badge · Alert · Dialog · Tabs · NavBar)

## When this skill does NOT trigger

- Generic React / Tailwind questions unrelated to Atlas
- Token discussions for systems other than Atlas
- File operations on uploaded user files outside the Atlas workspace

## References

- [`references/rules.md`](references/rules.md) — full guard checklist (read first)
- [`references/tokens.md`](references/tokens.md) — semantic token surface + Tailwind v4 utilities
- [`references/capabilities.md`](references/capabilities.md) — what the system can do today (what's built, what isn't)
- [`references/memory.md`](references/memory.md) — pointers to live project state
