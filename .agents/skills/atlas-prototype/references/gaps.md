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
  handler; a single choice from a list is a group of `Checkbox variant="card"` driven as one value
  or `Button`s with `aria-pressed` — never a raw `<select>` or `<input type="radio">`.
- Use the composition already written in `candidates.json` `composedFrom` when one exists.

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
  "name": "SegmentedControl",
  "seenIn": ["app/prototypes/<slug>"],
  "composedFrom": "row of Button variant=ghost with aria-pressed, selected one variant=secondary",
  "occurrences": 1,
  "note": "One sentence: what the screen needed and why no existing component fits."
}
```

A candidate is not a component. Promoting one is a design decision in Figma, then an
`atlas-component` task — never part of a prototype.
