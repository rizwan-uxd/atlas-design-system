# The pull file

`.atlas-pull/pull.json` is the only thing the agent writes by hand during a sync. It is scratch:
gitignored, rewritten every run, and read by `scripts/atlas-sync.mjs` exactly once.

## Shape

```jsonc
{
  "fileKey": "cKYhfaHLCoyMHi9nKr63Ig",      // required; the generator refuses any other file
  "figmaVersion": "lib:Atlas Design System v1@2026-07-06T03:42:12Z",
  "pulledAt": "2026-09-12T00:00:00.000Z",   // ISO; becomes syncedAt on every generated file
  "components": {
    "<Name>": {
      "nodeId": "82:24",
      "description": "…",                    // optional — only when Figma has one (step 3)
      "properties": {                        // the value SET per Figma property
        "Variant": ["default", "card"],
        "Checked": ["unchecked", "checked", "indeterminate"],
        "Size": ["sm", "md", "lg"],
        "State": ["default", "hover", "focus-visible", "active", "disabled"]
      },
      "componentProperties": {               // optional — booleans / instance-swap slots, see below
        "Leading icon": { "type": "BOOLEAN", "default": false },
        "Leading icon slot": { "type": "INSTANCE_SWAP" }
      }
    }
  },
  "variables": { … }                         // optional, currently never populated — see tokens below
}
```

## Filling it

| Field | Comes from |
|---|---|
| `nodeId` | the `node-id=<a>-<b>` in `packages/figma-sync/code-connect/<Name>.figma.tsx`, rewritten `a:b` |
| `properties` | `mcp__figma__get_metadata(fileKey, nodeId)` — parse each `<symbol name="…">` |
| `componentProperties` | `mcp__figma__use_figma` (read-only) → `node.componentPropertyDefinitions` on the component set; `get_metadata` cannot see them |
| `description` | `mcp__figma__search_design_system` (`entity: component`), Atlas library result |
| `figmaVersion` | newest `updatedAt` among the Atlas-library results seen this run |
| `pulledAt` | now, ISO 8601 |

### Parsing `get_metadata`

A component set returns one `<symbol>` per variant combination:

```xml
<symbol id="81:24" name="Variant=default, Checked=unchecked, Size=sm, State=default" … />
<symbol id="420:2" name="Variant=card, Checked=unchecked, Size=md, State=default" … />
```

Split each `name` on `, `, then on `=`. Collect the **distinct values per property, in first-seen
order**. Don't record per-symbol node ids, geometry, or the combination count — the snapshot never
uses them, and they are the bulk of the tokens.

Sparse matrices are normal: Checkbox draws `card` at `md` only, so `Size` still reads
`["sm","md","lg"]` even though `card` exists at one size. The property value set is the fact; the
matrix is not.

### Component properties

`componentPropertyDefinitions` keys look like `Leading icon#845:0`. Copy the entries whose `type` is
`BOOLEAN`, `INSTANCE_SWAP` or `TEXT` (skip `VARIANT`, those are `properties`). The generator strips the
`#id` suffix and keeps only `type` plus, for a `BOOLEAN`, its `default`; an instance-swap default is a
node id and is dropped. Omit the field when a component has none. The generator writes it to
`figmaComponentProperties` and renders the booleans as `## Figma toggles`.

### Descriptions

Search results span every library the user can see. Take only the one whose `libraryName` is
`Atlas Design System v1`, and of those the **Web** set — the Mobile-Native set has its own entry and
says so in its description. If neither is unambiguous, leave `description` out; a missing description
costs nothing, a wrong one rewrites a doc.

## Tokens

`variables` stays absent. Figma MCP returns variables *used by a node*, not the file's variable
table, so there is no honest way to regenerate `atlas/tokens.*` from Figma today. The generator
therefore derives tokens from `packages/tokens/atlas.tokens.css` and stamps them
`repo-derived (packages/tokens/atlas.tokens.css)` with `syncedAt: null` — deliberately, so nobody
reads a Figma guarantee into them. Figma variable parity is phase 3 / `atlas-verify` work.
