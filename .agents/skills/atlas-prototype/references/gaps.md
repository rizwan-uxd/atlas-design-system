# Gaps

A gap is anything the screen needs that `atlas/index.md` has no row for. The index footer names the
known ones (Avatar, Table, Tooltip, Select, Radio, Toast); `atlas/state/candidates.json` lists the
ones already seen.

## Compose it locally
- Build it inside the prototype, e.g. `app/prototypes/<slug>/steps/_parts.tsx` — never in
  `packages/` and never in `_shared/`.
- Assemble from Atlas components first (`Card` as a surface, `Badge` as a pill, `Button
  variant="ghost"` as a pressable row), then plain `div`/`span` with semantic tokens only.
- Keep it accessible: a pressable `div` gets `role="button"`, `tabIndex={0}` and an Enter/Space
  handler. A single choice that Tabs can't represent (a Radio gap — see below) is either
  - `Button`s with `aria-pressed` (each is a tab stop; no arrow keys needed) — the simple default, or
  - `role="radiogroup"` + `role="radio"` with `aria-checked`, roving `tabIndex` (0 on the checked one,
    -1 on the rest) and an `onKeyDown` that moves with ArrowLeft/Right/Up/Down — all of it, or don't
    use the roles (atlas-verify fails a radiogroup/tablist/listbox with no key handling).
  Never a raw `<select>` or `<input type="radio">`.
- Use the composition already written in `candidates.json` `composedFrom` when one exists.

## It is a gap even when it is built from Atlas components
Composing from `Button`/`Card` does not make it "no gap". It is a gap — and gets a candidate entry — when
the thing you built does the job of a component the index footer lists as missing (Avatar, Table,
Tooltip, Select, Radio, Toast) or of a pattern no index component covers (list row, stepper, chip group).

## It is not a gap when an index component's doc covers the pattern
Check the closest component's "When to use" first. A segmented choice between a few short named options
(theme, tip %, plan tier) is `Tabs` `variant="pills"` — `TabsRoot` + `TabsList` + `TabsTrigger`, panels
optional — so it gets no composition and no candidate. A pick-one that Tabs can't represent (options
with descriptions or other content, a long vertical list) is a Radio gap.

## Log it — `atlas/state/candidates.json`
This is the one `atlas/` file a prototype writes: the sync keeps its entries and only restamps the
header. Edit the `candidates` array only; leave `_generated`, `syncedAt` and `figmaVersion` alone.

**Existing candidate** (same name or same job) — add the prototype to `seenIn`, `occurrences + 1`:
```json
"seenIn": ["app/prototypes/send-money (benchmark T1)", "app/prototypes/wise-home", "app/prototypes/<slug>"],
"occurrences": 4,
```

**New candidate** — next `CAND-NNN` id:
```json
{
  "id": "CAND-005",
  "name": "QuantityStepper",
  "seenIn": ["app/prototypes/<slug>"],
  "composedFrom": "Button variant=outline − and + around a count in a span with aria-live=polite",
  "occurrences": 1,
  "note": "One sentence: what the screen needed and why no existing component fits."
}
```

A candidate is not a component. Promoting one is a design decision in Figma, then an
`atlas-component` task — never part of a prototype.
