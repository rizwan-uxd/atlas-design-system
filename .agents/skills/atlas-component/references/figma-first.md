# Figma first

File key `cKYhfaHLCoyMHi9nKr63Ig`. The component's node id is in
`packages/figma-sync/code-connect/<Name>.figma.tsx` (`node-id=<a>-<b>` → `<a>:<b>`) and in
`atlas/metadata/<Name>.json` `figmaNodeId`. Don't browse the file tree for it.

## Does Figma have to change?
| Change | Figma edit? |
|---|---|
| New/renamed/removed variant or size value | **Yes** — Figma first, code follows the Figma value name (DEC-002) |
| A code-only option that is real (e.g. `inline`) | **Yes** — add it to Figma rather than delete it from code (DEC-002) |
| A value prop (checked, on/off, dismissible) | **Yes** — its own Figma property, never a Variant value (DEC-003) |
| Usage guidance for `atlas/<Name>.md` | **Yes** — written as the component set description (see the doc rule below) |
| A new prop or state that changes how the component looks (`invalid`, `loading`, `selected`, an error colour) and has no matching value in `metadata.figmaProperties` | **Yes** — stop before coding it. Figma draws it first; the visual treatment is a design decision, not yours |
| A11y, focus ring, keyboard, reduced motion, bug fix, token swap with no visual change | No — code-only; say so in the report |
| Visual change (size, radius, colour, spacing) | Check the Figma variant first; if Figma already shows it, code-only. If not, **Yes** |

**Precedent is not approval.** Another component already shipping a similar prop or state without a
Figma property (e.g. Checkbox `invalid`) is itself undocumented drift — never a reason to copy it.
Name that drift in the report instead.

**When the user asked for it but Figma lacks it** — the request settles *what*, not *how it looks*.
Implement the non-visual part if any (`aria-invalid`, the prop, tests), then stop and propose the Figma
edit (next section). Without approval, leave the visual part out and list it as unresolved.

A discrepancy with `side: "figma"` is fixed in Figma; `side: "code"` in code; `side: "both"` needs a
decision first — stop and name it.

## Approval
Figma is shared and outward-facing. Before any write, show the user the exact edit:
```
Figma edit — Checkbox (82:24)
  rename property Variant value "unchecked" → move to new property Checked
  add variants: Variant=card × Checked × State at Size=md (15)
Proceed?
```
Wait for a yes. No reply or a no → continue code-side only if the change is code-only; otherwise stop.

## Calls
1. Load the `figma-use` skill before the first `mcp__figma__use_figma` call (mandatory).
2. `mcp__figma__get_metadata` on the node — current children, property values. One call.
3. `mcp__figma__use_figma` — apply the approved edit. Keep to the one component set.
4. `mcp__figma__get_metadata` again — confirm the property values now match the plan.
5. Only when guidance changed: `mcp__figma__search_design_system` (`entity: component`) to read the
   description back.

No `get_design_context` unless a visual value is genuinely unknown; no screenshots for property work.

## Getting it into atlas/
Run the `atlas-figma-sync` skill (pull file → `node scripts/atlas-sync.mjs --pull .atlas-pull/pull.json`).
Without a Figma edit, `npm run atlas:sync` carries Figma facts forward and refreshes code facts.

## The doc rule
The sync replaces `atlas/<Name>.md` with the Figma description only when it contains "when to use" /
"when not to" or runs 200+ characters; a shorter description is filed as a content gap and the doc
is kept. So new guidance is written in Figma in that shape — not typed into `atlas/`.
