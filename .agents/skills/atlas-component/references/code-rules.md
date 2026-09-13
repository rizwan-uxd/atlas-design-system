# Code rules

## Location and files
`packages/ui-web/src/<tier>/<Name>/<Name>.tsx` + `<Name>.module.css`. Tiers are fixed:
primitives (Button, Input, Label, Textarea, Checkbox, Switch, Badge) · compositions (Alert, Card,
Dialog) · patterns (Tabs) · layouts (NavBar). Import path `@atlas/ui-web/<tier>/<Name>/<Name>`.
Edit in place — no `<Name>V2`, no parallel folder. `templates/` is not a tier for real components.

## API shape (the generator reads it)
- `"use client"` first; a header comment listing Variants, Sizes, States and Accessibility.
- `export type <Name>Variant = "a" | "b"` and `export type <Name>Size = …` — string-literal unions
  whose values are **exactly** the Figma values. `atlas-sync` builds `metadata.variants`/`sizes`
  from these names; a renamed type silently drops them.
- `export interface <Name>Props` — own members only become `metadata.props`; keep jsdoc short.
- Subcomponents are exported as `<Name><Part>` (`CardHeader`, `TabsTrigger`).
- Value props (`checked`, `open`, `dismissible`) stay props, not variant values (DEC-003).

## Styling
- Semantic `--atlas-*` tokens only — no hex/rgb/hsl/oklch, no px literals, no `--atlas-color-*`
  primitives. `atlas/tokens.md` lists what exists; a missing token stops the task (no new tokens).
- Variant/size/state via `data-*` attributes or class maps in the CSS module.
- Logical properties: `padding-inline`, `margin-block-start`, `inset-inline-end`, `border-inline-start`.
- Motion from `--atlas-duration-*` / `--atlas-easing-*`, disabled under
  `@media (prefers-reduced-motion: reduce)`.

## States — every interactive component
default · hover (`:hover:not([data-disabled])`) · active · `:focus-visible` ring with
`--atlas-focus-ring` on the interactive element only · disabled (`aria-disabled`/`disabled`,
`--atlas-opacity-disabled`) · invalid (`aria-invalid`, danger tokens) · loading where Figma has it
(`aria-busy`). Touch targets respect `--atlas-touch-min`.

## Accessibility bar
- Prefer Radix primitives already installed (checkbox, dialog, tabs) for roles and keyboard.
- Label association: `htmlFor`/`id` via `useId`; no label → caller must pass `aria-label` (dev warn).
- Keyboard: Enter/Space activate; arrow-key roving focus in groups (Tabs); Escape closes overlays;
  focus trap and scroll lock for Dialog.
- `aria-describedby` forwarded for helper/error text.

## Don't
- Don't change another component or `_shared` prototype files to make this one fit.
- Don't widen a union "for flexibility"; every value must exist in Figma.
- Don't leave call sites broken: `tsc` in atlas-verify runs repo-wide.
