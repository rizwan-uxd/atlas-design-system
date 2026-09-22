# Companions and state

Every API change updates all three companions in the same task. A missing companion is created from
the pattern below (only Button has a test today; 7 components have contracts).

## Code Connect — `packages/figma-sync/code-connect/<Name>.figma.tsx`
Maps Figma properties to props. Keys on the left are **Figma** values, right side is what the prop gets.
```tsx
import figma from "@figma/code-connect"
import { Checkbox } from "@atlas/ui-web/primitives/Checkbox/Checkbox"

figma.connect(Checkbox, "https://www.figma.com/design/cKYhfaHLCoyMHi9nKr63Ig/Atlas-Design-System?node-id=82-24", {
  props: {
    variant:  figma.enum("Variant", { default: "default", card: "card" }),
    checked:  figma.enum("Checked", { unchecked: false, checked: true, indeterminate: "indeterminate" }),
    size:     figma.enum("Size",    { sm: "sm", md: "md", lg: "lg" }),
    disabled: figma.enum("State",   { disabled: true }),
  },
  example: ({ variant, checked, size, disabled }) => (
    <Checkbox variant={variant} checked={checked} size={size} disabled={disabled} label="Checkbox label" />
  ),
})
```
- Every value in `metadata.figmaProperties` for a mapped property appears as a key.
- The URL's `node-id` is the sync's pull list — change it only when the Figma node id changed.
- Publishing (`npx figma connect publish --config packages/figma-sync/mcp/configs/figma.config.json`)
  is outward-facing: ask first, and don't publish unless the user asked.

## Contract — `packages/governance/contracts/<Name>.contract.ts`
Type-level assertions; `tsc` fails when the union or props drift.
```ts
import type { CheckboxProps, CheckboxVariant, CheckboxSize } from "@atlas/ui-web/primitives/Checkbox/Checkbox"

type AssertCheckboxVariant = CheckboxVariant extends "default" | "card" ? true : false
const _v: AssertCheckboxVariant = true; void _v

type AssertCheckboxSize = CheckboxSize extends "sm" | "md" | "lg" ? true : false
const _s: AssertCheckboxSize = true; void _s

type AssertCheckboxShape = { variant?: CheckboxVariant; size?: CheckboxSize; /* …public props */ }
type _CheckCheckboxProps = AssertCheckboxShape extends Pick<CheckboxProps, keyof AssertCheckboxShape & keyof CheckboxProps> ? true : never
const _p: _CheckCheckboxProps = true; void _p
```

## Test — `packages/ui-web/tests/<Name>.test.tsx`
Pattern: `packages/ui-web/tests/Button.test.tsx` (vitest + Testing Library + jest-axe; the only
included test path). Cover: renders by default · every variant × size · each state from
`code-rules.md` (disabled blocks interaction, invalid sets `aria-invalid`, loading sets `aria-busy`)
· keyboard activation · `axe` has no violations per variant. Run while iterating:
`npx vitest run packages/ui-web/tests/<Name>.test.tsx`.

## State — `atlas/state/*.json`
The generator restamps these headers and keeps their bodies; edit only the rows below, never
`_generated`, `syncedAt`, `figmaVersion`.

| File | When | Edit |
|---|---|---|
| `status.json` | parity or code status changed | `components.<Name>`: `parity` `match \| code-applied \| open`, `code` `scaffolded \| spec-complete`. Leave `figmaMetadata` to match what Figma has (`none \| description-written \| complete`). `verifiedAt` is written only by `atlas-verify --stamp`, never by hand. |
| `discrepancies.json` | a **hand-written** entry (no `detectedBy`) is resolved | `status: "closed"`, `side: "closed"`, `resolution` rewritten as what was done + date, like DISC-003. Entries with `detectedBy` (`sync:figma`, `sync:code-connect`) close themselves on re-sync — never edit those. |
| `candidates.json` | the task promoted a candidate into a component | remove its entry. |
| `decisions.json` | the user made a new design decision in this task | append `{ id: "DEC-NNN", topic, decision, date }`. Never record your own guess as a decision. |

Sync after code, companion or generated-output changes — that post-code sync is the one whose output you
check. If only a hand-written row in `atlas/state/*.json` is edited after it, don't run sync again: step 7's
`design.snapshot-current` check verifies that state edit.
