# Component tokens for form controls — design (gate 1: plan)

Date: 2026-10-09 · Status: approved 2026-10-09 (colour-mix decision accepted) · Scope: web (`packages/ui-web`), colour + size
Extends: `2026-10-09-component-tokens-design.md` (same rules: aliases only, same naming, same four gates)

## Goal
Add component tokens for the next batch: **Textarea, Checkbox, Switch, RadioGroup, Select**.
Names only, no new values. Every token aliases an existing semantic token. Zero pixel change.

## Rule carried over
Aliases only, no exceptions: `var(--atlas-<semantic>)`, never a primitive, another component token, a literal or `color-mix`.

## Decision (approved 2026-10-09)
Four existing rules use `color-mix` and cannot be tokenised under the aliases-only rule:

| Rule | Where | Current value |
|---|---|---|
| Textarea filled hover, dark | `Textarea.module.css` | `color-mix(background-muted 80%, white)` |
| Switch off-track hover, dark | `Switch.module.css` | `color-mix(background-muted 80%, white)` |
| Switch off-track active, dark | `Switch.module.css` | `color-mix(background-muted 70%, white)` |
| Checkbox / Radio card checked, dark | `Checkbox.module.css`, `RadioGroup.module.css` | `color-mix(primary 15%, surface-raised)` |

Precedent: DEC-054 retired the same pattern for Card and filled Input by aliasing `--atlas-background-hovered`.
**Approved:** the first three alias `--atlas-background-hovered` in both themes and their dark `color-mix` overrides are deleted. Light is unchanged (`background-hovered` and `background-subtle` are both neutral-50); dark changes: Textarea filled hover and Switch off hover/active now use neutral-700. The card-checked rule stays untokenised: `checkbox-card-checked-background` and `radio-card-checked-background` are not created, and the module keeps its raw `primary-subtle` rule plus the dark `color-mix` override until a semantic token is approved.

## Naming
Same as the first batch: `--atlas-<component>-<variant>-<property>[-<state>]` and `--atlas-<component>-size-<size>-<property>`.
Prefixes to add to the lint allow-list: `textarea`, `checkbox`, `switch`, `radio`, `select`.

## Inventory (alias target in the right column)

### Textarea (22)
Mirrors Input names so the two read the same.
| Token | Aliases |
|---|---|
| `textarea-foreground` / `-background` / `-border` | foreground / background / border |
| `textarea-border-hover` / `-border-focus` / `-border-invalid` | border-strong / primary / danger |
| `textarea-placeholder` | foreground-muted |
| `textarea-background-disabled` / `-foreground-disabled` | background-muted / foreground-disabled |
| `textarea-filled-background` / `-background-hover` / `-background-focus` | background-muted / background-hovered* / background |
| `textarea-filled-border-focus` / `-border-invalid` | primary / danger |
| `textarea-counter-foreground` / `-counter-foreground-over` | foreground-muted / danger |
| `textarea-radius` | radius-md |
| `textarea-size-{sm,md,lg}-padding-inline` | spacing-3 / spacing-3 / spacing-4 |
| `textarea-size-{sm,md,lg}-padding-block` | spacing-2 / spacing-3 / spacing-3 |
| `textarea-size-sm-font-size` | font-size-sm |

Not tokenised: `min-height` (computed with `calc(spacing-N * 2)`; stays in the module).

### Checkbox (29)
| Token | Aliases |
|---|---|
| `checkbox-background` / `-border` / `-foreground` | background / border-strong / primary-foreground |
| `checkbox-background-hover` / `-border-hover` | background-subtle / foreground |
| `checkbox-checked-background` / `-background-hover` | primary / primary-hover |
| `checkbox-background-disabled` / `-border-disabled` | background-muted / border |
| `checkbox-invalid-border` / `-checked-background` / `-checked-background-hover` / `-checked-foreground` | danger / danger / danger-hover / danger-foreground |
| `checkbox-label-foreground` / `-label-foreground-disabled` | foreground / foreground-disabled |
| `checkbox-description-foreground` / `-description-foreground-disabled` | foreground-muted / foreground-disabled |
| `checkbox-required-foreground` | danger |
| `checkbox-card-border` / `-card-background` | border-strong / background |
| `checkbox-card-checked-border` | primary |
| `checkbox-card-invalid-border` | danger |
| `checkbox-radius` / `-card-radius` | radius-sm / radius-md |
| `checkbox-gap` | spacing-3 |
| `checkbox-size-{sm,md,lg}-box` | spacing-4 / spacing-5 / spacing-6 |

### Switch (16)
| Token | Aliases |
|---|---|
| `switch-track-background` / `-background-hover` / `-background-active` | background-muted / background-hovered / background-hovered |
| `switch-checked-track-background` / `-background-hover` / `-background-active` | primary / primary-hover / primary-active |
| `switch-thumb-background` | foreground-on-brand |
| `switch-label-foreground` / `-description-foreground` | foreground / foreground-muted |
| `switch-gap` | spacing-3 |
| `switch-size-{sm,md,lg}-height` | spacing-4 / spacing-5 / spacing-6 |
| `switch-size-{sm,md,lg}-thumb` | spacing-3 / spacing-4 / spacing-5 |

Not tokenised: track width (`calc(spacing-N + spacing-M)` at sm and lg; no single semantic alias) and the thumb travel distance.

### RadioGroup (29)
Same shape as Checkbox with `radio-` prefix and `radius-full` for the control; no indeterminate state.
Control: `radio-background`, `-border`, `-foreground`, `-background-hover`, `-border-hover`, `-checked-background`, `-checked-border`, `-checked-background-hover`, `-checked-border-hover`, `-background-disabled`, `-border-disabled`, `-invalid-border`, `-invalid-checked-background`, `-invalid-checked-border`, `-invalid-checked-foreground`, `-invalid-checked-background-hover`. Card variant: `radio-card-*` as in Checkbox (`surface` background). Text: `radio-label-foreground`, `radio-description-foreground`. Size: `radio-size-{sm,md}-control` (spacing-4 / spacing-5), `radio-dot` (spacing-2), `radio-gap`.

### Select (29)
Trigger mirrors Input; the menu surface is new.
| Token | Aliases |
|---|---|
| `select-foreground` / `-background` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` | as Input |
| `select-background-disabled` / `-foreground-disabled` | background-muted / foreground-disabled |
| `select-placeholder-foreground` / `-chevron-foreground` | foreground-muted |
| `select-radius` | radius-md |
| `select-size-{sm,md}-height` / `-padding-inline-start` / `-padding-inline-end` / `-font-size` / `-gap` | spacing-8 / 10; spacing-3; spacing-2; font-size-sm / base; spacing-1 |
| `select-content-background` / `-foreground` / `-border` / `-radius` | surface-overlay / foreground / border / radius-md |
| `select-item-background-focus` / `-indicator-foreground` / `-label-foreground` | background-accent / primary / foreground-muted |

Final counts (the plan's token block is authoritative): Textarea 22, Checkbox 29, Switch 16, RadioGroup 29, Select 29 = 125 new token names.

## Delivery: four gates
1. **Plan** — this spec, then the implementation plan. Stops here for your approval.
2. **Figma built** — extend `Atlas/Component`, rebind the five component sets, verify resolved Light and Dark values are identical before and after.
3. **Code and verify** — add CSS block entries, switch the five modules, extend the lint prefix list and `COMPONENTS` in `scripts/lib/component-tokens.mjs`, update `atlas/tokens.md` generator output, resync the snapshot. Verification order: token build → token-lint → typecheck → vitest → ESLint → `atlas:verify` → visual regression (zero pixel change, except any approved `color-mix` retirement).
4. **Final approval** — owner. The PR needs the `atlas-approved-new` label because these are new token names.

## Out of scope
Native, motion and focus-ring tokens, the `color-mix` card-checked rule (until a semantic token exists), Badge/Alert/Toast/Tabs and other components.

\* Approved decision above.
