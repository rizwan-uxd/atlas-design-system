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
  "boundVariables": {                       // optional — D1 option C, see "Bound variables" below
    "pulledAt": "2026-10-22T14:00:24.681Z",
    "figmaVersion": null,
    "entries": [{ "name": "spacing/2", "collection": "Atlas/Primitives", "type": "FLOAT", "web": "var(--atlas-spacing-2)" }]
  },
  "variables": { … }                         // optional — D1 option B, see "Variable table"; or pass it alone with --variables
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

Token **values** are always derived from `packages/tokens/atlas.tokens.css` and stamped
`repo-derived (packages/tokens/atlas.tokens.css)` with `syncedAt: null`: the variable table below
carries names, not values, so nobody should read a Figma guarantee into a value. Figma variable
**parity** (names, missing on either side) comes from the variable table, in `figmaTable`.

## Variable table (D1 option B, DEC-081)

The whole local variable table, read with one **read-only** `mcp__figma__use_figma` call (load the
`figma-use` skill first). It is the metric source for token-name drift, missing code tokens and missing
Figma tokens; `boundVariables` below stays as a cross-check. Return it compact with a checksum, because
it is ~460 entries and has to be copied into a file exactly:

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync()
const vars = await figma.variables.getLocalVariablesAsync()
const colIdx = new Map(cols.map((c, i) => [c.id, i]))
const conv = (n) => `var(--atlas-${n.replaceAll('/', '-')})`
const entries = vars.map((v) => {
  const web = v.codeSyntax && v.codeSyntax.WEB ? v.codeSyntax.WEB : null
  return [v.name, colIdx.get(v.variableCollectionId), v.resolvedType[0], web === null ? 0 : web === conv(v.name) ? 1 : web]
}).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]))
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 } return h.toString(16) }
const full = entries.map(([n, c, t, w]) => ({ name: n, collection: cols[c].name, type: t, web: w === 0 ? null : w === 1 ? conv(n) : w }))
return { collections: cols.map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), count: c.variableIds.length })), total: vars.length, checksum: fnv(JSON.stringify(full)), entries }
```

`web` is `0` for no `codeSyntax.WEB`, `1` for the slash→dash name, else the literal WEB string; the
type is its first letter (`C`OLOR, `F`LOAT, `S`TRING, `B`OOLEAN). Save the result as
`.atlas-pull/variables.compact.json`, recompute the same FNV-1a over the expanded entries (with the
one-letter type) in node and compare it with `checksum` — the 2026-10-23 run read 463 variables in 5
collections, `e11ec099`. Then expand it to `.atlas-pull/variables.json` in the shape of
`figma-pull.schema.json#/$defs/variableTable` —
`{ pulledAt: <now>, figmaVersion: null, collections, entries: [{ name, collection, type: "COLOR"|…, web }] }` —
and run `node scripts/atlas-sync.mjs --variables .atlas-pull/variables.json`. The generator writes
`atlas/tokens.json` `figmaTable`: coverage, `drift.nameDrift|missingInCode|missingInFigma`,
`modeExpansions` (CSS tokens that spell out a multi-mode variable's modes), `conventionExceptions`,
`unpublished` (no WEB and no CSS token: Figma-only, never drift) and the name→CSS map.

## Bound variables (D1 option C)

`boundVariables` is the honest part of a token sync that the MCP allows today: every variable bound
anywhere inside the 47 component sets, with its `codeSyntax.WEB`. Harvest it with one **read-only**
`mcp__figma__use_figma` call (load the `figma-use` skill first) over the `figmaNodeId`s in
`atlas/metadata/*.json`:

```js
const ids = [/* every figmaNodeId */], seen = new Set()
const collect = (a) => { if (!a) return; if (Array.isArray(a)) return a.forEach(collect)
  if (a.type === 'VARIABLE_ALIAS' && a.id) return void seen.add(a.id)
  if (typeof a === 'object') Object.values(a).forEach(collect) }
function visit(n) {
  try { collect(n.boundVariables) } catch {}
  for (const k of ['fills', 'strokes', 'effects', 'layoutGrids']) try { (n[k] || []).forEach((p) => collect(p.boundVariables)) } catch {}
  if (n.type === 'TEXT') try { n.getStyledTextSegments(['boundVariables', 'fills']).forEach((s) => { collect(s.boundVariables); (s.fills || []).forEach((p) => collect(p.boundVariables)) }) } catch {}
  if ('children' in n) n.children.forEach(visit)
}
for (const id of ids) visit(await figma.getNodeByIdAsync(id))
const out = []
for (const id of seen) {
  const v = await figma.variables.getVariableByIdAsync(id)
  const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)
  out.push({ name: v.name, collection: c.name, type: v.resolvedType, web: v.codeSyntax?.WEB ?? null })
}
return out
```

Copy the result into `entries` verbatim (the 2026-10-22 run returned 193; transcribe with a checksum
computed on both sides if the list is long). `pulledAt` is now; `figmaVersion` stays `null` unless the
same run read the library version. The generator compares each entry with `atlas.tokens.css` and
writes `atlas/tokens.json` `figmaBound` (coverage, `drift.nameDrift`, `drift.missingInCode`,
`conventionExceptions`, and the name→CSS map). Without `boundVariables` in the pull, the last
`figmaBound` is carried forward unchanged.
