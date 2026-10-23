# M4: the runtime vertical slice (implementation plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `app/runtime-demo` renders a "Request access" form entirely from a JSON protocol tree through the
real `packages/registry` and a new `packages/runtime`. Deleting the `Alert` registry entry keeps the rest of
the page, and 12 metric rows move out of "not measurable".

**Architecture:** `registry-build` also emits `generated/runtimeRegistry.ts`, which bundles every authored entry
and its generated protocol schema as JSON imports. `packages/registry/lib` wraps that file with `resolve`,
`filter` and `without`. `packages/runtime` is made of five parts:
1. a pure validator that repairs or drops nodes and never throws;
2. a fallback resolver;
3. a reducer over sequenced server ops (render, patch, state, ack);
4. a React renderer with an error boundary on every node;
5. a stub agent that answers from fixture ops.

The agent is stubbed on purpose: M4 proves the runtime, and Phase 6 proves the agent.

**Tech stack:** React 19, Next.js 16 (App Router), `ajv@8` 2020 dialect (already in `package.json`), vitest 4
(jsdom), Playwright 1.64, and `axe-core` (already installed through `jest-axe`). No new dependency.

## Global constraints
- Roadmap §M4 (`docs/ATLAS-DELIVERY-ROADMAP.md`) is the spec. **Exit:** `app/runtime-demo` renders the form
  entirely from a JSON tree through the real packages, and deleting the `Alert` registry entry keeps the rest of
  the page. **12 manifest rows** with `milestone: "M4"` move out of "not measurable". The roadmap prose says 11,
  but the manifest has 12, and the manifest is what gets counted.
- **R9 lanes.** The registry lane (`packages/registry/**`, `scripts/registry-build.mjs`, `scripts/lib/registry.mjs`,
  schemas) is kept apart from the runtime lane (`packages/runtime/**`, `app/runtime-demo/**`). There are no edits under
  `packages/ui-web/src` and no route under `app/prototypes`. No new component and no new token (`AGENTS.md` §4).
- The agent is a **stub driven by fixture ops** (`packages/runtime/tests/fixtures/*.json`). No model call and no
  network.
- **Never invent a design-system rule** (`AGENTS.md` §6). The owner decisions this plan relies on are recorded in
  Task 1 (DEC-082, DEC-083). The runtime-composition choices it makes are recorded in Task 7 (DEC-084).
- **Every new JSON input has a schema and an `INPUTS` rule in the same commit** (M2 rule). `packages/runtime`
  joins `WATCHED`.
- **Metric names are exact strings.** vitest's JSON `fullName` is `[...describe titles, test title].join(" ")`
  (vitest 4.1.6, `node_modules/vitest/dist/chunks/index.*.js`). A vitest check `runtime/validator > X` is
  therefore written as `describe("runtime/validator >", () => it("X", …))`. A Playwright check is a top-level
  `test("runtime-demo > X", …)` with no `describe`, because `metrics-report` reads `suites[].specs[].title`.
- **Latency gates sit at 2× the north-star target:** ack p95 under 600 ms (target 300) and fallback p95 under
  200 ms (target 100). The measured p95 is recorded in the handoff.
- Fuzzing runs with a **fixed seed** in `test`. The nightly workflow uses a random seed and opens an issue; it
  never blocks.
- Semantic tokens only in app code (`AGENTS.md` §7). The runtime adds one CSS rule (`display: contents`), which is
  not a design value.
- Verification order: token build → token-lint → tsc → vitest → test:scripts → ESLint → `atlas:verify` →
  Playwright.
- Commit only when complete and verified. Ask before opening the PR. Once the PR is open, turn on auto-merge and
  auto-fix (the user's standing preference).

## Decisions taken in this plan
1. **An unregistered fallback target renders nothing** (owner, 2026-10-23 → DEC-082). When a node needs a fallback
   whose target type is not registered (for example, Alert's own entry was deleted), the node is dropped, its
   siblings render, and the runtime reports an issue. No unregistered markup reaches the DOM.
2. **`TextField.name` is the one required protocol prop** (owner, 2026-10-23 → DEC-083). It uses the existing
   `protocolProps.<p>.required` flag, which `registry.schema.json` already allows and `protocolSchema()` already
   emits into `required`.
3. **The fallback copy is DEC-080's Alert, not the roadmap's `Card + Text`.** Atlas has no Text component, and
   DEC-080 made Alert (neutral, "This content is unavailable") the one terminal fallback. The message goes into the
   target's `description` slot, or its `children` slot when there is no `description`.
4. **Nesting is closed.** A child is allowed only when at least one side declares the pair (the parent's
   `nesting.children` or the child's `nesting.parents`) and neither side contradicts it. This is how `Button`
   containing `Form` gets dropped: Button declares no children and Form declares no parents. Fallback nodes are
   not nesting-checked, because they are the safe render.
5. **Patches address the rendered tree.** A pointer is `(/slots/<name>/<index>)*`, where the index counts what
   survived validation. Structural sharing keeps the identity of every subtree off the patched path, so memoised
   nodes skip re-rendering.
6. **State paths are `form.<TextField name>`.** `state` ops carry `{ error?, value? }`. The client sends `submit`
   events with every value, each with its own `seq`.
7. **`data-atlas-type` sits on a wrapper.** Most Atlas components do not forward arbitrary attributes (Alert
   takes no `...rest`). The renderer wraps each node in `<div class="atlas-node" data-atlas-node
   data-atlas-type data-atlas-path>`, and `runtime.css` gives that div `display: contents`, so it has no layout
   or accessibility effect. A Form node is its own `<form>` and carries the attributes directly.
8. **One Playwright web server, two projects.** The roadmap suggests a second port, 3032. This plan uses one
   instead: two `next dev` servers would share one `.next` directory, and in CI that would mean building twice.
   Both projects share port 3031, and CI builds once in its own step before Playwright. This deviation is
   recorded in DEC-084.

## File structure

| File | Session | Lane | Responsibility |
|---|---|---|---|
| `packages/registry/src/TextField.registry.json` | 2 | registry | `name.required: true` |
| `packages/registry/generated/schemas/TextField.schema.json` | 2 | registry | regenerated, gets `props.required: ["name"]` |
| `scripts/lib/registry.mjs` | 2 | registry | `runtimeRegistrySource()` |
| `scripts/registry-build.mjs` | 2 | registry | writes and checks `generated/runtimeRegistry.ts` |
| `scripts/tests/registry.test.mjs` | 2 | registry | test for `runtimeRegistrySource` |
| `packages/registry/generated/runtimeRegistry.ts` | 2 | registry | GENERATED: entries, schemas and aliases as JSON imports |
| `packages/registry/lib/index.ts` | 2 | registry | `registry`, `resolve`, `filter`, `without`, types |
| `packages/registry/tests/registry.test.ts` | 2 | registry | vitest: resolve, filter, without |
| `packages/governance/schemas/protocol.schema.json` | 2 | registry | envelope schema: node, op, fixture |
| `scripts/lib/schemas.mjs` | 2 | registry | `INPUTS` rule for fixtures, `WATCHED += packages/runtime` |
| `packages/runtime/package.json` | 2 | runtime | `@atlas/runtime`, private, no `main` |
| `packages/runtime/src/protocol.ts` | 2 | runtime | protocol and runtime types |
| `packages/runtime/src/markup.ts` | 2 | runtime | `findMarkup()` |
| `packages/runtime/src/schema.ts` | 2 | runtime | compiled prop and node validators per registry |
| `packages/runtime/src/fallback.ts` | 2 | runtime | `fallbackFor()` |
| `packages/runtime/src/validate.ts` | 2 | runtime | `validateTree()` |
| `packages/runtime/tests/fixtures/request-access.json` | 2 | runtime | render op plus response ops |
| `packages/runtime/tests/{markup,validate,protocol}.test.ts` | 2 | runtime | vitest |
| `vitest.config.ts`, `tsconfig.base.json`, `tsconfig.json` | 2 | — | aliases, includes |
| `packages/runtime/src/store.ts` | 3 | runtime | `reduce()`, pointer patching |
| `packages/runtime/src/Runtime.tsx` | 3 | runtime | `<AtlasRuntime>`, NodeView, NodeBoundary, FieldView |
| `packages/runtime/src/runtime.css` | 3 | runtime | `.atlas-node { display: contents }` |
| `packages/runtime/tests/{store,render,size,fuzz}.test.tsx` | 3 | runtime | vitest |
| `packages/runtime/tests/fuzz.ts` | 3 | runtime | seeded PRNG and mutator |
| `packages/runtime/src/stub-agent.ts` | 4 | runtime | fixture-driven transport with a log and `inject` |
| `app/runtime-demo/{page.tsx,RuntimeDemo.tsx,runtime-demo.css}` | 4 | runtime | the route |
| `tests/runtime/runtime-demo.spec.ts` | 4 | runtime | Playwright, 6 metric tests plus axe |
| `playwright.config.ts`, `package.json`, `.github/workflows/{ci,visual-baseline,fuzz-nightly}.yml` | 4 | — | CI |
| `packages/ui-web/package.json` | 4 | — | drop the false `main`/`types`/`"."` |
| `.agents/skills/atlas-runtime/SKILL.md`, `AGENTS.md` §9 | 4 | — | the runtime skill (R9) and its route row |
| `atlas/state/{decisions,candidates}.json`, roadmap, handoff, `claude.md` | 4 | — | records |

**Sessions.** Session 1 (this one) is the plan and the two owner decisions. Session 2 covers Tasks 1–5
(registry API, protocol, validator; vitest only). Session 3 covers Tasks 6–9 (reducer, renderer, size, fuzz,
exit test). Session 4 covers Tasks 10–14 (stub agent, route, Playwright, CI, records, PR). Total: about 3.5
sessions.

---

## Session 2

### Task 1: TextField.name is required, and the two owner decisions are recorded

**Files:**
- Modify: `packages/registry/src/TextField.registry.json` (`"name": {}` becomes `"name": { "required": true }`)
- Regenerate: `packages/registry/generated/schemas/TextField.schema.json`
- Modify: `atlas/state/decisions.json` (append DEC-082 and DEC-083)

**Interfaces:**
- Produces: the TextField protocol schema has `properties.props.required === ["name"]`.

- [ ] **Step 1: Write the failing check.** Run `npm run registry:check`, then:
  `node -e 'const s=require("./packages/registry/generated/schemas/TextField.schema.json");if(JSON.stringify(s.properties.props.required)!=="[\"name\"]")process.exit(1)'`
  Expected: exit 1, because `required` is absent.
- [ ] **Step 2: Edit the entry.** In `TextField.registry.json`, change `"name": {},` to `"name": { "required": true },`.
- [ ] **Step 3: Regenerate.** Run `npm run registry:build`, then the Step 1 `node -e` command. Expected: exit 0.
  `git diff packages/registry/generated` should show only the `required` line in `TextField.schema.json`.
- [ ] **Step 4: Record the decisions.** Append to the `decisions` array in `atlas/state/decisions.json`:

```json
{
  "id": "DEC-082",
  "topic": "M4 runtime: a fallback whose target type is not registered renders nothing",
  "decision": "Owner-chosen 2026-10-23 (M4 session 1). When the runtime needs a node's fallback and the fallback target is not a registered type (for example, Alert's own entry was deleted, and Alert is the one terminal of DEC-080), the node is dropped. Its siblings and the rest of the page render, and the runtime reports a render issue. No unregistered or runtime-invented markup reaches the DOM, so every rendered node still carries a registered data-atlas-type. Rejected: a runtime-owned placeholder element (it would need an exemption from 'every node registered'), and changing the exit test to delete a non-terminal entry.",
  "date": "2026-10-23"
},
{
  "id": "DEC-083",
  "topic": "M4 runtime: TextField.name is the one required protocol prop",
  "decision": "Owner-chosen 2026-10-23 (M4 session 1). protocolProps.name.required is true on TextField, the only required prop for now: a form cannot submit a field with no name. registry-build already emits protocolProps.<p>.required into the generated schema's props.required. The validator sends a node missing a required prop to its fallback instead of throwing. More required props are later owner decisions, one per entry.",
  "date": "2026-10-23"
}
```

- [ ] **Step 5: Verify.** Run `npm run registry:check && npm run atlas:verify -- --scope "packages/registry/**" --skip tsc,tests`.
  Expected: PASS, including `design/schemas` and `design/registry-*`.
- [ ] **Step 6: Commit.** `git add packages/registry atlas/state/decisions.json && git commit -m "feat(registry): TextField.name is required (DEC-083); DEC-082 last-fallback rule"`

### Task 2: registry-build bundles the registry for the runtime, and `packages/registry/lib` reads it

**Files:**
- Modify: `scripts/lib/registry.mjs` (add `runtimeRegistrySource` after `componentMapSource`)
- Modify: `scripts/registry-build.mjs:21` (import) and `:125` (write)
- Modify: `scripts/tests/registry.test.mjs` (one test)
- Create (generated): `packages/registry/generated/runtimeRegistry.ts`
- Create: `packages/registry/lib/index.ts`, `packages/registry/tests/registry.test.ts`
- Modify: `tsconfig.base.json` (paths), `tsconfig.json` (include), `vitest.config.ts` (include, aliases)

**Interfaces:**
- Produces: `import { registry, resolve, filter, without, type Registry, type Entry } from "@atlas/registry/lib"`
  - `resolve(name: string, r?: Registry): string | null`
  - `filter(capabilities: string[], r?: Registry): string[]` (sorted)
  - `without(type: string, r?: Registry): Registry`
  - `Registry = { entries: Record<string, Entry>; schemas: Record<string, JsonSchema>; aliases: Record<string, string> }`

- [ ] **Step 1: Write the failing script test.** Append to `scripts/tests/registry.test.mjs`, and add
  `runtimeRegistrySource` to its import from `../lib/registry.mjs`:

```js
test("runtimeRegistry bundles every entry with its schema, sorted, and the alias table", () => {
  const text = runtimeRegistrySource({ TextField: {}, Alert: {}, Form: {} })
  assert.match(text, /^\/\/ GENERATED — do not hand-edit\./)
  assert.ok(text.indexOf('import AlertEntry from "../src/Alert.registry.json"') < text.indexOf("import FormEntry"))
  assert.match(text, /import TextFieldSchema from "\.\/schemas\/TextField\.schema\.json"/)
  assert.match(text, /export const entries = \{\n  Alert: AlertEntry,\n  Form: FormEntry,\n  TextField: TextFieldEntry,\n\}/)
  assert.match(text, /export const aliasTable: Record<string, string> = aliases\.aliases/)
})
```

- [ ] **Step 2: Run it.** `node --test scripts/tests/registry.test.mjs`. Expected: FAIL, `runtimeRegistrySource` is not exported.
- [ ] **Step 3: Implement.** Add to `scripts/lib/registry.mjs`, after `componentMapSource`:

```js
/** `runtimeRegistry.ts`: every authored entry and its protocol schema as JSON imports, for the M4 runtime (no fs at runtime). */
export function runtimeRegistrySource(entries) {
  const types = Object.keys(entries).sort()
  return `// GENERATED — do not hand-edit. registry-build from packages/registry/src, generated/schemas and aliases.json; run npm run registry:build.
// Every registered entry and its protocol schema, bundled so the runtime reads the registry without fs (roadmap M4).
import aliases from "../aliases.json"
${types.map((t) => `import ${t}Entry from "../src/${t}.registry.json"\nimport ${t}Schema from "./schemas/${t}.schema.json"`).join("\n")}

export const entries = {
${types.map((t) => `  ${t}: ${t}Entry,`).join("\n")}
}

export const schemas = {
${types.map((t) => `  ${t}: ${t}Schema,`).join("\n")}
}

export const aliasTable: Record<string, string> = aliases.aliases
`
}
```

  In `scripts/registry-build.mjs`, add `runtimeRegistrySource` to the import on line 21. After line 125, add
  `written[`${GEN}/runtimeRegistry.ts`] = runtimeRegistrySource(entries)`. The `--check` stale loop on line 143
  already covers every key of `written`. If the orphan scan (line 144) flags `runtimeRegistry.ts`, add it to the
  scan's allowed generated files next to `componentMap.ts`.
- [ ] **Step 4: Run.** `node --test scripts/tests/registry.test.mjs && npm run registry:build && npm run registry:check`.
  Expected: PASS, and `packages/registry/generated/runtimeRegistry.ts` exists.
- [ ] **Step 5: Wire the aliases.**
  - In `tsconfig.base.json` `paths`, add `"@atlas/registry/*": ["./packages/registry/*"]` and
    `"@atlas/runtime/*": ["./packages/runtime/src/*"]`.
  - In `tsconfig.json` `include`, add `"packages/runtime/**/*.ts"` and `"packages/runtime/**/*.tsx"`.
  - In `vitest.config.ts`, set `include` to
    `["packages/ui-web/tests/**/*.test.{ts,tsx}", "packages/registry/tests/**/*.test.ts", "packages/runtime/tests/**/*.test.{ts,tsx}"]`,
    and add these aliases:
    `"@atlas/registry": path.resolve(__dirname, "packages/registry")` and
    `"@atlas/runtime": path.resolve(__dirname, "packages/runtime/src")`.
- [ ] **Step 6: Write the failing vitest.** Create `packages/registry/tests/registry.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { filter, registry, resolve, without } from "@atlas/registry/lib"

describe("registry/resolve >", () => {
  it("TextField renders Input", () => expect(resolve("TextField")).toBe("Input"))
  it("Modal is an alias of Dialog", () => expect(resolve("Modal")).toBe("Dialog"))
  it("Form is structural", () => expect(resolve("Form")).toBe("structural"))
  it("Button renders Button", () => expect(resolve("Button")).toBe("Button"))
  it("an unknown name resolves to null", () => expect(resolve("UnknownChart")).toBeNull())
})

describe("registry/filter >", () => {
  it("a submit request gets at most 6 types, and never Dialog", () => {
    const types = filter(["submit"])
    expect(types).toEqual(["Alert", "Button", "Field", "Form", "TextField"])
    expect(types.length).toBeLessThanOrEqual(6)
    expect(types).not.toContain("Dialog")
  })
  it("a press request gets only Button", () => expect(filter(["press"])).toEqual(["Button"]))
  it("an unknown capability gets nothing", () => expect(filter(["chart"])).toEqual([]))
})

describe("registry/without >", () => {
  it("removes one entry and its schema and leaves the shared registry alone", () => {
    const r = without("Alert")
    expect(Object.keys(r.entries).sort()).toEqual(["Button", "Field", "Form", "TextField"])
    expect(r.schemas).not.toHaveProperty("Alert")
    expect(registry.entries).toHaveProperty("Alert")
  })
})
```

- [ ] **Step 7: Run it.** `npx vitest run packages/registry`. Expected: FAIL, because `@atlas/registry/lib` does not exist yet.
- [ ] **Step 8: Implement.** Create `packages/registry/lib/index.ts`:

```ts
// The registry as the runtime reads it: generated/runtimeRegistry.ts plus three lookups. Authored data lives in
// src/ and aliases.json; nothing here is hand-maintained per component.
import { aliasTable, entries, schemas } from "../generated/runtimeRegistry"

export type ProtocolPropSpec = { values?: string[]; narrowed?: string; required?: boolean }
export type Fallback = { type: string; props?: Record<string, unknown>; message: string }
export type Entry = {
  type: string
  aliasOf: string | null
  kind: "component" | "structural"
  element?: string
  protocolProps?: Record<string, ProtocolPropSpec>
  slots?: string[]
  events?: Record<string, { handler: string }>
  fallback?: Fallback
  nesting?: { parents?: string[]; children?: string[] }
  capabilities?: string[]
}
export type JsonSchema = Record<string, unknown>
export type Registry = { entries: Record<string, Entry>; schemas: Record<string, JsonSchema>; aliases: Record<string, string> }

export const registry: Registry = {
  entries: entries as unknown as Record<string, Entry>,
  schemas: schemas as unknown as Record<string, JsonSchema>,
  aliases: aliasTable,
}

/** The Atlas component a type name renders: an alias target, a registered entry's aliasOf, or "structural". */
export function resolve(name: string, r: Registry = registry): string | null {
  if (Object.hasOwn(r.aliases, name)) return r.aliases[name]
  if (Object.hasOwn(r.entries, name)) return r.entries[name].aliasOf ?? "structural"
  return null
}

/** Registered types for a request: every type with a requested capability, plus everything those may nest. */
export function filter(capabilities: string[], r: Registry = registry): string[] {
  const out = new Set<string>()
  const visit = (type: string) => {
    if (out.has(type) || !Object.hasOwn(r.entries, type)) return
    out.add(type)
    for (const child of r.entries[type].nesting?.children ?? []) visit(child)
  }
  for (const e of Object.values(r.entries)) if ((e.capabilities ?? []).some((c) => capabilities.includes(c))) visit(e.type)
  return [...out].sort()
}

/** A copy of the registry with one type removed, as if its entry were deleted (the M4 exit test). */
export function without(type: string, r: Registry = registry): Registry {
  const { [type]: _entry, ...entries } = r.entries
  const { [type]: _schema, ...schemas } = r.schemas
  return { ...r, entries, schemas }
}
```

- [ ] **Step 9: Run.** `npx vitest run packages/registry && npx tsc --noEmit`. Expected: PASS. If `filter(["submit"])`
  differs, the registry's `nesting` changed: fix the expectation only if the change was intended, and say so.
- [ ] **Step 10: Commit.** `git add scripts packages/registry tsconfig.base.json tsconfig.json vitest.config.ts && git commit -m "feat(registry): runtimeRegistry bundle and the resolve/filter/without lookups (M4)"`

### Task 3: protocol types, the envelope schema and the request-access fixture

**Files:**
- Create: `packages/runtime/package.json`, `packages/runtime/src/protocol.ts`
- Create: `packages/governance/schemas/protocol.schema.json`
- Create: `packages/runtime/tests/fixtures/request-access.json`
- Modify: `scripts/lib/schemas.mjs:24-45` (`INPUTS` and `WATCHED`)
- Test: `packages/runtime/tests/protocol.test.ts` (Task 5 adds the per-node schema assertion)

**Interfaces:**
- Produces, from `@atlas/runtime/protocol`: `ProtocolNode`, `SafeNode`, `SafeItem`, `Issue`, `IssueCode`, `StateValue`,
  `ServerOp`, `ClientEvent`, `Transport`, `Fixture`.

- [ ] **Step 1: Create `packages/runtime/package.json`:**

```json
{
  "name": "@atlas/runtime",
  "version": "0.1.0",
  "private": true,
  "exports": { "./*": "./src/*" },
  "peerDependencies": { "react": ">=19" }
}
```

- [ ] **Step 2: Create `packages/runtime/src/protocol.ts`:**

```ts
// The M4 protocol. A server op is sequenced (`seq` strictly increasing); a client event carries its own seq.
// Nodes are `{ type, props, slots }`, the shape of each generated schema in packages/registry/generated/schemas.

export type ProtocolNode = { type: string; props?: Record<string, unknown>; slots?: Record<string, Array<ProtocolNode | string>> }

/** A node after validation: registered type, known props only, every slot checked. `path` is its pointer. */
export type SafeNode = { type: string; props: Record<string, unknown>; slots: Record<string, SafeItem[]>; path: string; fallback?: true }
export type SafeItem = SafeNode | string

export type IssueCode =
  | "malformed" | "unknown-type" | "nesting" | "unknown-prop" | "invalid-prop" | "markup"
  | "missing-required" | "unknown-slot" | "stale-seq" | "bad-pointer" | "render-error" | "no-fallback"
export type Issue = { path: string; code: IssueCode; detail: string }

export type StateValue = { error?: string | null; value?: string }

export type ServerOp =
  | { op: "render"; seq: number; root: ProtocolNode }
  | { op: "patch"; seq: number; at: string; node: ProtocolNode | null }
  | { op: "state"; seq: number; path: string; value: StateValue }
  | { op: "ack"; seq: number; ack: number }

export type ClientEvent = { kind: "event"; seq: number; type: "submit"; source: string; values: Record<string, string> }

export type Transport = { send(event: ClientEvent): void; subscribe(listener: (op: ServerOp) => void): () => void }

export type Fixture = { _note: string; render: Extract<ServerOp, { op: "render" }>; responses: Record<string, ServerOp[]> }
```

- [ ] **Step 3: Create `packages/governance/schemas/protocol.schema.json`:**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://atlas.design-system/schemas/protocol.schema.json",
  "title": "Atlas runtime protocol (M4)",
  "description": "The envelope only. A node's props and slots are checked per type by packages/registry/generated/schemas.",
  "$defs": {
    "seq": { "type": "integer", "minimum": 1 },
    "node": {
      "type": "object",
      "additionalProperties": false,
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]*$" },
        "props": { "type": "object" },
        "slots": {
          "type": "object",
          "additionalProperties": { "type": "array", "items": { "anyOf": [{ "type": "string" }, { "$ref": "#/$defs/node" }] } }
        }
      }
    },
    "op": {
      "oneOf": [
        { "type": "object", "additionalProperties": false, "required": ["op", "seq", "root"],
          "properties": { "op": { "const": "render" }, "seq": { "$ref": "#/$defs/seq" }, "root": { "$ref": "#/$defs/node" } } },
        { "type": "object", "additionalProperties": false, "required": ["op", "seq", "at", "node"],
          "properties": { "op": { "const": "patch" }, "seq": { "$ref": "#/$defs/seq" },
            "at": { "type": "string", "pattern": "^(/slots/[a-zA-Z]+/[0-9]+)+$" },
            "node": { "anyOf": [{ "$ref": "#/$defs/node" }, { "type": "null" }] } } },
        { "type": "object", "additionalProperties": false, "required": ["op", "seq", "path", "value"],
          "properties": { "op": { "const": "state" }, "seq": { "$ref": "#/$defs/seq" },
            "path": { "type": "string", "pattern": "^form\\.[a-z][A-Za-z0-9]*$" },
            "value": { "type": "object", "additionalProperties": false, "minProperties": 1,
              "properties": { "error": { "type": ["string", "null"] }, "value": { "type": "string" } } } } },
        { "type": "object", "additionalProperties": false, "required": ["op", "seq", "ack"],
          "properties": { "op": { "const": "ack" }, "seq": { "$ref": "#/$defs/seq" }, "ack": { "$ref": "#/$defs/seq" } } }
      ]
    },
    "fixture": {
      "type": "object",
      "additionalProperties": false,
      "required": ["_note", "render", "responses"],
      "properties": {
        "_note": { "$ref": "common.schema.json#/$defs/text" },
        "render": { "allOf": [{ "$ref": "#/$defs/op" }, { "properties": { "op": { "const": "render" } } }] },
        "responses": { "type": "object", "additionalProperties": { "type": "array", "items": { "$ref": "#/$defs/op" } } }
      }
    }
  }
}
```

- [ ] **Step 4: Create `packages/runtime/tests/fixtures/request-access.json`.** The stub agent re-stamps every
  response `seq` when it sends the response.

```json
{
  "_note": "AUTHORED. The M4 Request access form (roadmap M4): render is the first op; responses are the op lists the stub agent sends after a submit, chosen by its validation. seq values here are placeholders the stub re-stamps.",
  "render": {
    "op": "render",
    "seq": 1,
    "root": {
      "type": "Form",
      "slots": {
        "children": [
          { "type": "Field", "props": { "required": true }, "slots": {
            "label": ["Work email"],
            "helpText": ["We send the access link here."],
            "children": [{ "type": "TextField", "props": { "name": "email", "placeholder": "you@company.com" } }]
          } },
          { "type": "Field", "props": { "required": true }, "slots": {
            "label": ["Organisation"],
            "children": [{ "type": "TextField", "props": { "name": "organisation" } }]
          } },
          { "type": "Button", "props": { "variant": "primary" }, "slots": { "children": ["Request access"] } }
        ]
      }
    }
  },
  "responses": {
    "invalid-email": [{ "op": "state", "seq": 1, "path": "form.email", "value": { "error": "Enter a valid work email" } }],
    "clear-email": [{ "op": "state", "seq": 1, "path": "form.email", "value": { "error": null } }],
    "missing-organisation": [{ "op": "state", "seq": 1, "path": "form.organisation", "value": { "error": "Enter your organisation" } }],
    "clear-organisation": [{ "op": "state", "seq": 1, "path": "form.organisation", "value": { "error": null } }],
    "success": [{ "op": "patch", "seq": 1, "at": "/slots/children/3", "node": {
      "type": "Alert", "props": { "variant": "success" },
      "slots": { "title": ["Request sent"], "description": ["We will email you when access is approved."] }
    } }]
  }
}
```

- [ ] **Step 5: Write the failing check.** Run `npm run atlas:verify -- --scope "packages/runtime/**" --skip tsc,tests`.
  Expected: `design/schemas` either does not list the fixture, or names it as uncovered. The intent is that it
  becomes covered.
- [ ] **Step 6: Register the input.** In `scripts/lib/schemas.mjs`, add to `INPUTS`:
  `{ glob: "packages/runtime/tests/fixtures/*.json", schema: "protocol.schema.json#/$defs/fixture", min: 1 },`
  and change `WATCHED` to `["atlas", "packages/governance", "packages/registry", "packages/runtime"]`. `package.json`
  files are not inputs. If `WATCHED` flags `packages/runtime/package.json`, extend `EXEMPT` to
  `/^packages\/(governance\/schemas|registry\/generated\/schemas)\/|^packages\/runtime\/package\.json$/`.
- [ ] **Step 7: Verify.** Run `npm run atlas:verify -- --scope "packages/runtime/**" --skip tsc,tests && npm run test:scripts`.
  Expected: `design/schemas` PASS, with the fixture counted in `inspected`. Then break the fixture on purpose
  (`"seq": 0`), confirm FAIL `/render/seq must be >= 1`, and revert.
- [ ] **Step 8: Commit.** `git add packages/runtime packages/governance/schemas/protocol.schema.json scripts/lib/schemas.mjs && git commit -m "feat(runtime): protocol types, envelope schema, request-access fixture (M4)"`

### Task 4: the markup detector

**Files:** Create `packages/runtime/src/markup.ts` and `packages/runtime/tests/markup.test.ts`.

**Interfaces:** Produces `findMarkup(text: string): string | null`, which returns the name of the first pattern that matches.

- [ ] **Step 1: Write the failing test** (`packages/runtime/tests/markup.test.ts`):

```ts
import { describe, expect, it } from "vitest"
import { findMarkup } from "@atlas/runtime/markup"

const REJECT: Array<[string, string]> = [
  ["<div>", "html tag"], ["</span>", "html tag"], ["<img src=x onerror=alert(1)>", "html tag"], ["<br/>", "html tag"],
  ["<Button variant=\"primary\" />", "html tag"], ["<!-- hi -->", "html comment"],
  ["color: red", "css declaration"], ["background-color:#fff", "css declaration"], ["padding: 4px", "css declaration"],
  ["style=\"x\"", "css declaration"], ["className=\"p-4\"", "css declaration"],
  ["{user.name}", "jsx expression"], ["javascript:alert(1)", "script url"], ["url(evil.png)", "css function"],
]
const ACCEPT = ["Work email", "Enter a valid work email", "Email: required", "We will email you when access is approved.", "3 < 4 and 5 > 2", "Organisation"]

describe("runtime/markup >", () => {
  it.each(REJECT)("rejects %s as %s", (text, kind) => expect(findMarkup(text)).toBe(kind))
  it.each(ACCEPT)("accepts %s", (text) => expect(findMarkup(text)).toBeNull())
})
```

- [ ] **Step 2: Run it.** `npx vitest run packages/runtime/tests/markup.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** (`packages/runtime/src/markup.ts`):

```ts
// Agent text must be copy, never markup: this is how "0 outputs containing CSS, HTML or JSX" is enforced before an
// agent exists. Patterns are ordered; the first match names the finding. Plain prose with a colon ("Email:
// required") passes because only CSS property names count as declarations.
const PATTERNS: Array<[string, RegExp]> = [
  ["html comment", /<!--/],
  ["html tag", /<\/?[A-Za-z][\w:-]*(\s[^<>]*)?\/?>/],
  ["css declaration", /(?:^|[\s;{"'])(?:color|background(?:-[a-z]+)?|margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|font(?:-[a-z]+)?|display|position|width|height|border(?:-[a-z]+)?|top|left|right|bottom|z-index|opacity|transform)\s*:\s*\S/i],
  ["css declaration", /(?:^|\s)(?:style|class|className)\s*=/],
  ["jsx expression", /\{[^{}]*\}/],
  ["script url", /javascript\s*:/i],
  ["css function", /\b(?:url|expression)\s*\(/i],
]

export function findMarkup(text: string): string | null {
  for (const [kind, re] of PATTERNS) if (re.test(text)) return kind
  return null
}
```

- [ ] **Step 4: Run it.** Same command. Expected: PASS (20 cases). A failing ACCEPT case means a pattern is too
  broad: narrow the pattern, never the case.
- [ ] **Step 5: Commit.** `git add packages/runtime && git commit -m "feat(runtime): markup detector for agent text (M4)"`

### Task 5: the validator and the fallback resolver

**Files:**
- Create: `packages/runtime/src/schema.ts`, `packages/runtime/src/fallback.ts`, `packages/runtime/src/validate.ts`
- Create: `packages/runtime/tests/validate.test.ts`
- Modify: `packages/runtime/tests/protocol.test.ts` (create it if Task 3 did not)

**Interfaces:**
- Consumes: `Registry` and `registry` (Task 2), `findMarkup` (Task 4), the protocol types (Task 3).
- Produces:
  - `validateTree(raw: unknown, r: Registry, at?: string, parent?: string | null): { node: SafeNode | null; issues: Issue[] }`
  - `fallbackFor(type: string | null, r: Registry, path: string): SafeNode | null`
  - `propValidator(r, type, prop)` and `nodeValidator(r, type)`, which return an ajv `ValidateFunction` or `null`.

- [ ] **Step 1: Write the failing tests** (`packages/runtime/tests/validate.test.ts`):

```ts
import { describe, expect, it } from "vitest"
import { registry, without } from "@atlas/registry/lib"
import { validateTree } from "@atlas/runtime/validate"
import { fallbackFor } from "@atlas/runtime/fallback"
import type { SafeNode } from "@atlas/runtime/protocol"
import fixture from "../tests/fixtures/request-access.json"

const FALLBACK = { type: "Alert", props: { variant: "neutral" }, slots: { description: ["This content is unavailable"] }, fallback: true }
const kids = (n: SafeNode | null) => (n as SafeNode).slots.children
const form = (...children: unknown[]) => ({ type: "Form", slots: { children } })
const button = (props: Record<string, unknown> = {}) => ({ type: "Button", props, slots: { children: ["Go"] } })

describe("runtime/validator >", () => {
  it("unknown type replaced by fallback", () => {
    const { node, issues } = validateTree(form({ type: "UnknownChart" }, button()), registry)
    expect(kids(node)[0]).toMatchObject(FALLBACK)
    expect(kids(node)[1]).toMatchObject({ type: "Button" })
    expect(issues).toContainEqual(expect.objectContaining({ code: "unknown-type", path: "/slots/children/0" }))
  })

  it("unregistered type never renders", () => {
    const { node } = validateTree(form({ type: "UnknownChart" }, { type: "Dialog" }, { type: "Modal" }), registry)
    const types = JSON.stringify(node).match(/"type":"[A-Za-z]+"/g) as string[]
    expect(types.every((t) => /"(Form|Alert|Button|Field|TextField)"/.test(t))).toBe(true)
  })

  describe("rejects markup in prop values", () => {
    it.each(["<div>hi</div>", "color: red"])("%s", (bad) => {
      const { node, issues } = validateTree(form({ type: "Field", slots: { label: ["Email"], children: [{ type: "TextField", props: { name: "email", placeholder: bad } }] } }), registry)
      const field = kids(node)[0] as SafeNode
      expect((field.slots.children[0] as SafeNode).props).not.toHaveProperty("placeholder")
      expect(issues).toContainEqual(expect.objectContaining({ code: "markup" }))
    })
    it("in slot text too", () => {
      const { node } = validateTree(form({ type: "Button", slots: { children: ["<script>x</script>"] } }), registry)
      expect((kids(node)[0] as SafeNode).slots.children).toEqual([])
    })
  })

  it("strips an unknown prop and keeps the node", () => {
    const { node, issues } = validateTree(form(button({ variant: "primary", onClick: "alert(1)", style: { color: "red" } })), registry)
    expect((kids(node)[0] as SafeNode).props).toEqual({ variant: "primary" })
    expect(issues.filter((i) => i.code === "unknown-prop")).toHaveLength(2)
  })

  it("drops an invalid variant so the component default applies", () => {
    const { node, issues } = validateTree(form(button({ variant: "sparkly" })), registry)
    expect((kids(node)[0] as SafeNode).props).not.toHaveProperty("variant")
    expect(issues).toContainEqual(expect.objectContaining({ code: "invalid-prop" }))
  })

  it("drops a Form inside a Button and keeps the Button", () => {
    const { node, issues } = validateTree(form({ type: "Button", slots: { children: ["Go", form()] } }), registry)
    expect((kids(node)[0] as SafeNode).slots.children).toEqual(["Go"])
    expect(issues).toContainEqual(expect.objectContaining({ code: "nesting" }))
  })

  it("sends a TextField with no name to its fallback instead of throwing", () => {
    const raw = form({ type: "Field", slots: { label: ["Email"], children: [{ type: "TextField", props: { placeholder: "x" } }] } })
    expect(() => validateTree(raw, registry)).not.toThrow()
    const field = kids(validateTree(raw, registry).node)[0] as SafeNode
    expect(field.slots.children[0]).toMatchObject(FALLBACK)
  })

  it("repairs a malformed root into the fallback", () => {
    for (const raw of [null, 42, "x", [], { type: 7 }, {}]) expect(validateTree(raw, registry).node).toMatchObject(FALLBACK)
  })

  it("keeps the request-access fixture whole, with no issues", () => {
    const { node, issues } = validateTree(fixture.render.root, registry)
    expect(issues).toEqual([])
    expect(kids(node).map((c) => (c as SafeNode).type)).toEqual(["Field", "Field", "Button"])
  })
})

describe("runtime/fallback >", () => {
  it("every registered type has a fallback whose target is registered", () => {
    for (const e of Object.values(registry.entries)) {
      expect(e.fallback, `${e.type} fallback`).toBeDefined()
      expect(Object.hasOwn(registry.entries, (e.fallback as { type: string }).type), `${e.type} → ${e.fallback?.type}`).toBe(true)
    }
  })
  it("copy is exact", () => expect(fallbackFor("Button", registry, "/x")).toMatchObject({ ...FALLBACK, path: "/x" }))
  it("renders nothing when the target is not registered (DEC-082)", () => {
    const r = without("Alert")
    expect(fallbackFor("Button", r, "/x")).toBeNull()
    expect(fallbackFor(null, r, "/x")).toBeNull()
  })
  it("deleting Alert keeps the rest of the tree", () => {
    const { node } = validateTree(form({ type: "Alert", slots: { title: ["Hi"] } }, button()), without("Alert"))
    expect(kids(node).map((c) => (c as SafeNode).type)).toEqual(["Button"])
  })
})
```

  Add to `packages/runtime/tests/protocol.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { registry } from "@atlas/registry/lib"
import { nodeValidator } from "@atlas/runtime/schema"
import type { ProtocolNode } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const nodes = (n: ProtocolNode): ProtocolNode[] =>
  [n, ...Object.values(n.slots ?? {}).flat().filter((i): i is ProtocolNode => typeof i !== "string").flatMap(nodes)]

describe("runtime/protocol >", () => {
  it("every fixture node validates against its generated schema", () => {
    const roots = [fixture.render.root, ...Object.values(fixture.responses).flat().flatMap((op) => ("node" in op && op.node ? [op.node] : []))]
    for (const n of roots.flatMap((r) => nodes(r as ProtocolNode))) {
      const v = nodeValidator(registry, n.type)
      expect(v, `${n.type} has a schema`).not.toBeNull()
      expect(v!(n), `${n.type}: ${JSON.stringify(v!.errors)}`).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run them.** `npx vitest run packages/runtime`. Expected: FAIL, modules not found.
- [ ] **Step 3: Implement `packages/runtime/src/schema.ts`:**

```ts
// Compiled validators from the generated protocol schemas, one ajv instance per registry object, so the runtime
// checks a prop with exactly the schema registry-build emitted and never a hand copy of it.
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020"
import type { JsonSchema, Registry } from "@atlas/registry/lib"

type Cache = { ajv: Ajv2020; nodes: Map<string, ValidateFunction>; props: Map<string, ValidateFunction | null> }
const caches = new WeakMap<Registry, Cache>()

function cache(r: Registry): Cache {
  let c = caches.get(r)
  if (!c) { c = { ajv: new Ajv2020({ allErrors: false, strict: false }), nodes: new Map(), props: new Map() }; caches.set(r, c) }
  return c
}

export function nodeValidator(r: Registry, type: string): ValidateFunction | null {
  if (!Object.hasOwn(r.schemas, type)) return null
  const c = cache(r)
  let v = c.nodes.get(type)
  if (!v) { v = c.ajv.compile(r.schemas[type]); c.nodes.set(type, v) }
  return v
}

export function propValidator(r: Registry, type: string, prop: string): ValidateFunction | null {
  const key = `${type}.${prop}`
  const c = cache(r)
  if (c.props.has(key)) return c.props.get(key) ?? null
  const props = ((r.schemas[type]?.properties as JsonSchema | undefined)?.props as JsonSchema | undefined)?.properties as Record<string, JsonSchema> | undefined
  const v = props && Object.hasOwn(props, prop) ? c.ajv.compile(props[prop]) : null
  c.props.set(key, v)
  return v
}
```

- [ ] **Step 4: Implement `packages/runtime/src/fallback.ts`:**

```ts
// DEC-080: every type falls back to Alert (neutral, "This content is unavailable"); Alert is the one terminal.
// DEC-082: a target that is not registered renders nothing, so the node is dropped and its siblings stay.
import type { Entry, Registry } from "@atlas/registry/lib"
import type { SafeNode } from "./protocol"

const terminal = (r: Registry): Entry | null => Object.values(r.entries).find((e) => e.fallback?.type === e.type) ?? null

export function fallbackFor(type: string | null, r: Registry, path: string): SafeNode | null {
  const from = type !== null && Object.hasOwn(r.entries, type) ? r.entries[type] : terminal(r)
  if (!from || !from.fallback) return null
  const target = from.fallback.type
  if (!Object.hasOwn(r.entries, target)) return null
  const slots = r.entries[target].slots ?? []
  const slot = slots.includes("description") ? "description" : slots.includes("children") ? "children" : null
  return { type: target, props: { ...(from.fallback.props ?? {}) }, slots: slot ? { [slot]: [from.fallback.message] } : {}, path, fallback: true }
}
```

- [ ] **Step 5: Implement `packages/runtime/src/validate.ts`:**

```ts
// The validator repairs or drops; it never throws. Unknown or malformed → fallback; disallowed nesting → dropped;
// unknown, invalid or markup props → stripped (the component default applies); missing required → fallback.
import type { Registry } from "@atlas/registry/lib"
import { fallbackFor } from "./fallback"
import { findMarkup } from "./markup"
import { propValidator } from "./schema"
import type { Issue, SafeItem, SafeNode } from "./protocol"

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

export function validateTree(raw: unknown, r: Registry, at = "", parent: string | null = null): { node: SafeNode | null; issues: Issue[] } {
  const issues: Issue[] = []
  const node = validateNode(raw, r, at, parent, issues)
  return { node, issues }
}

/** Decision 4: one side must declare the pair and neither may contradict it. */
function nests(r: Registry, parent: string, child: string): boolean {
  const p = r.entries[parent].nesting?.children, c = r.entries[child].nesting?.parents
  const byParent = p ? p.includes(child) : undefined
  const byChild = c ? c.includes(parent) : undefined
  if (byParent === undefined && byChild === undefined) return false
  return byParent !== false && byChild !== false
}

function validateNode(raw: unknown, r: Registry, path: string, parent: string | null, issues: Issue[]): SafeNode | null {
  if (!isObject(raw) || typeof raw.type !== "string") {
    issues.push({ path, code: "malformed", detail: "a node must be an object with a string type" })
    return fallbackFor(null, r, path)
  }
  const type = raw.type
  if (!Object.hasOwn(r.entries, type)) {
    issues.push({ path, code: "unknown-type", detail: `${type} is not a registered type` })
    return fallbackFor(null, r, path)
  }
  if (parent !== null && !nests(r, parent, type)) {
    issues.push({ path, code: "nesting", detail: `${type} may not be placed in ${parent}` })
    return null
  }
  const entry = r.entries[type]

  const props: Record<string, unknown> = {}
  if (raw.props !== undefined && !isObject(raw.props)) issues.push({ path, code: "malformed", detail: `${type}.props must be an object` })
  for (const [name, value] of Object.entries(isObject(raw.props) ? raw.props : {})) {
    const check = propValidator(r, type, name)
    if (!check) { issues.push({ path, code: "unknown-prop", detail: `${type}.${name} is not a protocol prop` }); continue }
    const markup = typeof value === "string" ? findMarkup(value) : null
    if (markup) { issues.push({ path, code: "markup", detail: `${type}.${name} contains ${markup}` }); continue }
    if (!check(value)) { issues.push({ path, code: "invalid-prop", detail: `${type}.${name} is invalid; the component default applies` }); continue }
    props[name] = value
  }
  const missing = Object.entries(entry.protocolProps ?? {}).filter(([n, s]) => s.required && !Object.hasOwn(props, n)).map(([n]) => n)
  if (missing.length) {
    issues.push({ path, code: "missing-required", detail: `${type} needs ${missing.join(", ")}` })
    return fallbackFor(type, r, path)
  }

  const slots: Record<string, SafeItem[]> = {}
  if (raw.slots !== undefined && !isObject(raw.slots)) issues.push({ path, code: "malformed", detail: `${type}.slots must be an object` })
  for (const [name, items] of Object.entries(isObject(raw.slots) ? raw.slots : {})) {
    if (!(entry.slots ?? []).includes(name)) { issues.push({ path, code: "unknown-slot", detail: `${type} has no ${name} slot` }); continue }
    if (!Array.isArray(items)) { issues.push({ path, code: "malformed", detail: `${type}.slots.${name} must be an array` }); continue }
    const out: SafeItem[] = []
    for (const item of items) {
      const at = `${path}/slots/${name}/${out.length}`
      if (typeof item === "string") {
        const markup = findMarkup(item)
        if (markup) issues.push({ path: at, code: "markup", detail: `text contains ${markup}` })
        else out.push(item)
        continue
      }
      const child = validateNode(item, r, at, type, issues)
      if (child) out.push(child)
    }
    slots[name] = out
  }
  return { type, props, slots, path }
}
```

- [ ] **Step 6: Run.** `npx vitest run packages/runtime packages/registry && npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 7: Prove the metric names land.** Run
  `npx vitest run packages/runtime --reporter=json --outputFile=.metrics/vitest.json && npm run metrics:report -- --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);for(const m of r.metrics??r)if(/runtime\/validator/.test(m.check))console.log(m.status,m.check)})'`
  Expected: three `runtime/validator` rows read `passing`. If the JSON shape differs, read the `--json` output
  once and adjust the filter only. The rows themselves must say passing.
- [ ] **Step 8: Verify.** `npm run token-lint && npm run test:scripts && npx eslint packages/runtime packages/registry && npm run atlas:verify -- --scope "packages/runtime/**,packages/registry/**"`.
- [ ] **Step 9: Commit.** `git add packages/runtime && git commit -m "feat(runtime): validator and fallback resolver; never throws (M4)"`
- [ ] **Step 10: Session close.** Update the progress table in `docs/HANDOFF-next-session.md` (M4 1.5 of 3.5) and
  report doing / done / % / session X of N.

---

## Session 3

### Task 6: the reducer, sequencing and pointer patches

**Files:** Create `packages/runtime/src/store.ts` and `packages/runtime/tests/store.test.ts`.

**Interfaces:**
- Consumes: `validateTree`, the protocol types.
- Produces:
  - `RuntimeState = { root: SafeNode | null; values: Record<string, string>; errors: Record<string, string>; lastSeq: number; issues: Issue[]; acks: number[]; fallbackSeq: number | null }`
  - `initialState: RuntimeState`
  - `Action = { kind: "server"; op: ServerOp } | { kind: "input"; path: string; value: string }`
  - `reduce(r: Registry): (s: RuntimeState, a: Action) => RuntimeState`

- [ ] **Step 1: Write the failing tests** (`packages/runtime/tests/store.test.ts`):

```ts
import { describe, expect, it } from "vitest"
import { registry } from "@atlas/registry/lib"
import { initialState, reduce } from "@atlas/runtime/store"
import type { SafeNode, ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const step = reduce(registry)
const run = (...ops: ServerOp[]) => ops.reduce((s, op) => step(s, { kind: "server", op }), initialState)
const rendered = () => run(fixture.render as ServerOp)
const kids = (s: { root: SafeNode | null }) => (s.root as SafeNode).slots.children as SafeNode[]

describe("runtime/store >", () => {
  it("render validates the tree", () => expect(kids(rendered()).map((k) => k.type)).toEqual(["Field", "Field", "Button"]))

  it("a stale or repeated seq is ignored and reported", () => {
    const s = run(fixture.render as ServerOp, { op: "ack", seq: 1, ack: 1 })
    expect(s.acks).toEqual([])
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "stale-seq" }))
  })

  it("state sets and clears an error by path", () => {
    const s1 = run(fixture.render as ServerOp, { op: "state", seq: 2, path: "form.email", value: { error: "Bad" } })
    expect(s1.errors).toEqual({ "form.email": "Bad" })
    const s2 = step(s1, { kind: "server", op: { op: "state", seq: 3, path: "form.email", value: { error: null } } })
    expect(s2.errors).toEqual({})
  })

  it("state rejects error text that is markup", () => {
    const s = run(fixture.render as ServerOp, { op: "state", seq: 2, path: "form.email", value: { error: "<b>x</b>" } })
    expect(s.errors).toEqual({})
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "markup" }))
  })

  it("patch appends and keeps the identity of every untouched subtree", () => {
    const before = rendered()
    const after = step(before, { kind: "server", op: { ...(fixture.responses.success[0] as ServerOp), seq: 2 } })
    expect(kids(after)[3]).toMatchObject({ type: "Alert", path: "/slots/children/3" })
    expect(kids(after)[0]).toBe(kids(before)[0])
    expect(kids(after)[2]).toBe(kids(before)[2])
    expect(after.root).not.toBe(before.root)
  })

  it("patch with node null removes, and later siblings are re-pathed", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/0", node: null })
    expect(kids(s).map((k) => k.path)).toEqual(["/slots/children/0", "/slots/children/1"])
  })

  it("patch validates the node in its parent's context", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/3", node: { type: "UnknownChart" } })
    expect(kids(s)[3]).toMatchObject({ type: "Alert", fallback: true })
    expect(s.fallbackSeq).toBe(2)
  })

  it("a pointer past the end is reported, not thrown", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/9", node: { type: "Button" } })
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "bad-pointer" }))
  })

  it("input stores a value locally and emits nothing", () => {
    const s = step(rendered(), { kind: "input", path: "form.email", value: "a@b.co" })
    expect(s.values).toEqual({ "form.email": "a@b.co" })
  })
})
```

- [ ] **Step 2: Run.** `npx vitest run packages/runtime/tests/store.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement** (`packages/runtime/src/store.ts`):

```ts
// One reducer over sequenced server ops. Patches copy only the nodes on the pointer's path (structural sharing),
// so a memoised renderer skips every untouched subtree; that is "patch updates only the addressed subtree".
import type { Registry } from "@atlas/registry/lib"
import { findMarkup } from "./markup"
import { validateTree } from "./validate"
import type { Issue, SafeItem, SafeNode, ServerOp } from "./protocol"

export type RuntimeState = {
  root: SafeNode | null
  values: Record<string, string>
  errors: Record<string, string>
  lastSeq: number
  issues: Issue[]
  acks: number[]
  /** seq of the last op whose validation produced a fallback node; drives the fallback latency mark. */
  fallbackSeq: number | null
}
export type Action = { kind: "server"; op: ServerOp } | { kind: "input"; path: string; value: string }

export const initialState: RuntimeState = { root: null, values: {}, errors: {}, lastSeq: 0, issues: [], acks: [], fallbackSeq: null }

const FALLBACK_CODES = new Set(["malformed", "unknown-type", "missing-required"])

function repath(item: SafeItem, path: string): SafeItem {
  if (typeof item === "string" || item.path === path) return item
  const slots = Object.fromEntries(Object.entries(item.slots).map(([k, v]) => [k, v.map((c, i) => repath(c, `${path}/slots/${k}/${i}`))]))
  return { ...item, path, slots }
}

/** Replace, insert (index === length) or remove (node null) at a pointer; null when the pointer misses. */
function applyPatch(root: SafeNode, at: string, raw: unknown, r: Registry, issues: Issue[]): SafeNode | null {
  const segs = at.split("/").filter(Boolean).filter((s, i) => !(i % 3 === 0 && s === "slots"))
  const leafSlot = segs[segs.length - 2], leafIndex = Number(segs[segs.length - 1])
  const parentSegs = segs.slice(0, -2)
  const update = (parent: SafeNode): SafeNode | null => {
    const items = parent.slots[leafSlot] ?? []
    if (!(r.entries[parent.type].slots ?? []).includes(leafSlot) || !Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex > items.length) return null
    const path = `${parent.path}/slots/${leafSlot}/${leafIndex}`
    const next = [...items]
    if (raw === null) next.splice(leafIndex, 1)
    else {
      const { node, issues: found } = validateTree(raw, r, path, parent.type)
      issues.push(...found)
      if (node) next.splice(leafIndex, leafIndex === items.length ? 0 : 1, node)
      else if (leafIndex < items.length) next.splice(leafIndex, 1)
    }
    return { ...parent, slots: { ...parent.slots, [leafSlot]: next.map((c, i) => repath(c, `${parent.path}/slots/${leafSlot}/${i}`)) } }
  }
  const walk = (node: SafeNode, rest: string[]): SafeNode | null => {
    if (!rest.length) return update(node)
    const [slot, indexText, ...more] = rest
    const items = node.slots[slot]
    const child = items?.[Number(indexText)]
    if (!child || typeof child === "string") return null
    const next = walk(child, more)
    return next && { ...node, slots: { ...node.slots, [slot]: items.map((c, i) => (i === Number(indexText) ? next : c)) } }
  }
  return walk(root, parentSegs)
}

export function reduce(r: Registry) {
  return function step(s: RuntimeState, a: Action): RuntimeState {
    if (a.kind === "input") return { ...s, values: { ...s.values, [a.path]: a.value } }
    const op = a.op
    if (op.seq <= s.lastSeq) return { ...s, issues: [...s.issues, { path: "", code: "stale-seq", detail: `seq ${op.seq} after ${s.lastSeq}` }] }
    const issues: Issue[] = []
    let next: RuntimeState = { ...s, lastSeq: op.seq }
    if (op.op === "render") {
      const v = validateTree(op.root, r)
      issues.push(...v.issues)
      next = { ...next, root: v.node }
    } else if (op.op === "patch") {
      const root = next.root ? applyPatch(next.root, op.at, op.node, r, issues) : null
      if (root) next = { ...next, root }
      else issues.push({ path: op.at, code: "bad-pointer", detail: `no slot position at ${op.at}` })
    } else if (op.op === "state") {
      const { error, value } = op.value
      if (typeof error === "string" && findMarkup(error)) issues.push({ path: op.path, code: "markup", detail: "error text contains markup" })
      else if (error === null) { const { [op.path]: _gone, ...errors } = next.errors; next = { ...next, errors } }
      else if (typeof error === "string") next = { ...next, errors: { ...next.errors, [op.path]: error } }
      if (typeof value === "string") next = { ...next, values: { ...next.values, [op.path]: value } }
    } else if (op.op === "ack") {
      next = { ...next, acks: [...next.acks, op.ack] }
    }
    const fallback = issues.some((i) => FALLBACK_CODES.has(i.code))
    return { ...next, issues: issues.length ? [...s.issues, ...issues] : s.issues, fallbackSeq: fallback ? op.seq : next.fallbackSeq }
  }
}
```

- [ ] **Step 4: Run.** Same command, then `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add packages/runtime && git commit -m "feat(runtime): sequenced reducer with structural-sharing patches (M4)"`

### Task 7: the renderer

**Files:**
- Create: `packages/runtime/src/Runtime.tsx`, `packages/runtime/src/runtime.css`, `packages/runtime/tests/render.test.tsx`
- Modify: `atlas/state/decisions.json` (DEC-084)

**Interfaces:**
- Consumes: `reduce` and `initialState` (Task 6), `fallbackFor` (Task 5), `componentMap` (`@atlas/registry/generated/componentMap`).
- Produces:
  - `<AtlasRuntime registry transport initial? onIssues? onRender? />`
  - `silentTransport: Transport`, a no-op used by tests.
  - DOM contract: every node is `[data-atlas-node][data-atlas-type][data-atlas-path]`, and the root container is
    `[data-atlas-runtime]`.

- [ ] **Step 1: Write the failing tests** (`packages/runtime/tests/render.test.tsx`):

```tsx
import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "jest-axe"
import { registry, without } from "@atlas/registry/lib"
import { AtlasRuntime, silentTransport } from "@atlas/runtime/Runtime"
import { Button } from "@atlas/ui-web/primitives/Button/Button"
import type { ProtocolNode, ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const renderOp = (root: unknown): ServerOp => ({ op: "render", seq: 1, root: root as ProtocolNode })
const mount = (root: unknown, r = registry) => render(<AtlasRuntime registry={r} transport={silentTransport} initial={renderOp(root)} />)

describe("runtime/render >", () => {
  it("every rendered node carries a registered data-atlas-type, with no raw style attributes", async () => {
    const { container } = mount(fixture.render.root)
    const nodes = [...container.querySelectorAll("[data-atlas-node]")]
    expect(nodes.length).toBe(6) // Form, 2 Field, 2 TextField, Button
    for (const n of nodes) expect(Object.keys(registry.entries)).toContain(n.getAttribute("data-atlas-type"))
    expect(container.querySelectorAll("[style]")).toHaveLength(0)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("Field hands its control id, aria-describedby and aria-required to the TextField", () => {
    mount(fixture.render.root)
    const input = screen.getByLabelText(/Work email/)
    expect(input.getAttribute("name")).toBe("email")
    expect(input.getAttribute("aria-required")).toBe("true")
    expect(input.getAttribute("aria-describedby")).toBeTruthy()
  })

  it("a missing variant renders exactly like the component default", () => {
    const { container } = mount({ type: "Form", slots: { children: [{ type: "Button", slots: { children: ["Go"] } }] } })
    const direct = render(<Button type="submit">Go</Button>).container.querySelector("button") as HTMLButtonElement
    expect(container.querySelector("button")?.className).toBe(direct.className)
  })

  it("a throwing component renders its fallback, not a blank page", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const throwing = { ...registry, entries: { ...registry.entries } }
    const { container } = render(
      <AtlasRuntime registry={throwing} transport={silentTransport} initial={renderOp(fixture.render.root)}
        components={{ Button: () => { throw new Error("boom") } }} />,
    )
    expect(screen.getByText("This content is unavailable")).toBeTruthy()
    expect(container.querySelectorAll('[data-atlas-type="Field"]')).toHaveLength(2)
    spy.mockRestore()
  })

  it("deleting the Alert entry renders the page without the Alert (DEC-082)", () => {
    const tree = { ...fixture.render.root, slots: { children: [...fixture.render.root.slots.children, fixture.responses.success[0].node] } }
    const { container } = mount(tree, without("Alert"))
    expect(container.querySelectorAll('[data-atlas-type="Alert"]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-atlas-type="Field"]')).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Request access" })).toBeTruthy()
  })
})

describe("runtime/validator >", () => {
  it("unregistered type never renders in the DOM", () => {
    const { container } = mount({ type: "Form", slots: { children: [{ type: "UnknownChart" }, { type: "Dialog" }] } })
    const types = [...container.querySelectorAll("[data-atlas-type]")].map((n) => n.getAttribute("data-atlas-type"))
    expect(types).toEqual(["Form", "Alert", "Alert"])
  })
})
```

  The `components` prop is a test seam that overrides `componentMap` entries. It is the only way to make a real
  component throw without editing `ui-web`.
- [ ] **Step 2: Run.** `npx vitest run packages/runtime/tests/render.test.tsx`. Expected: FAIL, module not found.
- [ ] **Step 3: Create `packages/runtime/src/runtime.css`:**

```css
/* The node wrapper carries data-atlas-type for components that take no extra attributes (decision 7). It is not
   a layout box: display: contents removes it from layout and leaves the accessibility tree to its child. */
.atlas-node { display: contents; }
```

- [ ] **Step 4: Implement `packages/runtime/src/Runtime.tsx`:**

```tsx
"use client"
// The renderer. Every node is a memoised NodeView inside its own error boundary; Form, Field and TextField are
// composed here because Form is structural and Field hands its control props to a render-prop child.
import * as React from "react"
import { componentMap } from "@atlas/registry/generated/componentMap"
import type { Registry } from "@atlas/registry/lib"
import { Field, type FieldControlProps } from "@atlas/ui-web/compositions/Field/Field"
import { Input } from "@atlas/ui-web/primitives/Input/Input"
import { fallbackFor } from "./fallback"
import { initialState, reduce, type RuntimeState } from "./store"
import type { Issue, SafeItem, SafeNode, ServerOp, Transport } from "./protocol"

type Components = Partial<Record<keyof typeof componentMap, React.ElementType>>
type Stable = {
  registry: Registry
  components: Record<string, React.ElementType>
  submit: (source: string) => void
  input: (path: string, value: string) => void
  report: (issue: Issue) => void
  onRender?: (path: string) => void
}
const StableContext = React.createContext<Stable | null>(null)
const FormContext = React.createContext<Pick<RuntimeState, "values" | "errors">>({ values: {}, errors: {} })
const useStable = () => React.useContext(StableContext) as Stable

export const silentTransport: Transport = { send: () => {}, subscribe: () => () => {} }

type Props = {
  registry: Registry
  transport: Transport
  initial?: ServerOp
  onIssues?: (issues: Issue[]) => void
  /** Called with a node's path each time it renders; the patch-scope test reads it. */
  onRender?: (path: string) => void
  /** Test seam: replaces componentMap entries (for example, a component that throws). */
  components?: Components
}

export function AtlasRuntime({ registry, transport, initial, onIssues, onRender, components }: Props) {
  const step = React.useMemo(() => reduce(registry), [registry])
  const [state, dispatch] = React.useReducer(step, initialState, (s) => (initial ? step(s, { kind: "server", op: initial }) : s))
  const seq = React.useRef(0)
  const values = React.useRef(state.values)
  values.current = state.values

  React.useEffect(() => transport.subscribe((op) => {
    performance.mark(`atlas:op:${op.seq}`)
    dispatch({ kind: "server", op })
  }), [transport])

  const stable = React.useMemo<Stable>(() => ({
    registry,
    components: { ...componentMap, ...components } as Record<string, React.ElementType>,
    submit: (source) => {
      seq.current += 1
      performance.mark(`atlas:send:${seq.current}`)
      transport.send({ kind: "event", seq: seq.current, type: "submit", source, values: { ...values.current } })
    },
    input: (path, value) => dispatch({ kind: "input", path, value }),
    report: (issue) => onIssues?.([issue]),
    onRender,
  }), [registry, components, transport, onIssues, onRender])

  React.useEffect(() => { if (state.issues.length) onIssues?.(state.issues) }, [state.issues, onIssues])

  const measured = React.useRef(0)
  React.useLayoutEffect(() => {
    for (const ack of state.acks.slice(measured.current)) {
      if (performance.getEntriesByName(`atlas:send:${ack}`).length) performance.measure("atlas:ack", `atlas:send:${ack}`)
    }
    measured.current = state.acks.length
  }, [state.acks])
  React.useLayoutEffect(() => {
    const f = state.fallbackSeq
    if (f !== null && performance.getEntriesByName(`atlas:op:${f}`).length) performance.measure("atlas:fallback", `atlas:op:${f}`)
  }, [state.fallbackSeq])

  const form = React.useMemo(() => ({ values: state.values, errors: state.errors }), [state.values, state.errors])
  return (
    <StableContext.Provider value={stable}>
      <FormContext.Provider value={form}>
        <div data-atlas-runtime="">{state.root && <NodeView node={state.root} parentType={null} />}</div>
      </FormContext.Provider>
    </StableContext.Provider>
  )
}

function Items({ items, parentType }: { items: SafeItem[] | undefined; parentType: string }) {
  return <>{(items ?? []).map((it, i) => (typeof it === "string" ? <React.Fragment key={`t${i}`}>{it}</React.Fragment> : <NodeView key={it.path} node={it} parentType={parentType} />))}</>
}
const slot = (items: SafeItem[] | undefined, parentType: string) => (items && items.length ? <Items items={items} parentType={parentType} /> : undefined)
const tag = (n: SafeNode) => ({ "data-atlas-node": "", "data-atlas-type": n.type, "data-atlas-path": n.path })

const NodeView = React.memo(function NodeView({ node, parentType }: { node: SafeNode; parentType: string | null }) {
  const s = useStable()
  s.onRender?.(node.path)
  return <NodeBoundary node={node} stable={s}>{renderNode(node, parentType, s)}</NodeBoundary>
})

function renderNode(node: SafeNode, parentType: string | null, s: Stable): React.ReactNode {
  if (s.registry.entries[node.type].kind === "structural") {
    return (
      <form {...tag(node)} noValidate onSubmit={(e) => { e.preventDefault(); s.submit(node.path) }}>
        <Items items={node.slots.children} parentType={node.type} />
      </form>
    )
  }
  if (node.type === "Field") return <div className="atlas-node" {...tag(node)}><FieldView node={node} /></div>
  if (node.type === "TextField") return <TextFieldView node={node} control={null} />
  const Component = s.components[node.type]
  const slots = Object.fromEntries(Object.entries(node.slots).map(([k, v]) => [k, slot(v, node.type)]))
  // DEC-084: a Button placed directly in a Form submits it.
  const submit = node.type === "Button" && parentType === "Form" ? { type: "submit" } : {}
  return <div className="atlas-node" {...tag(node)}><Component {...node.props} {...slots} {...submit} /></div>
}

function FieldView({ node }: { node: SafeNode }) {
  const { errors } = React.useContext(FormContext)
  const controls = node.slots.children ?? []
  const text = controls.find((c): c is SafeNode => typeof c !== "string" && c.type === "TextField")
  const key = text ? `form.${text.props.name as string}` : null
  const error = key && errors[key] ? errors[key] : slot(node.slots.error, "Field")
  return (
    <Field {...node.props} label={slot(node.slots.label, "Field")} helpText={slot(node.slots.helpText, "Field")}
      labelAction={slot(node.slots.labelAction, "Field")} error={error}>
      {(control) => <>{controls.map((c, i) => (typeof c === "string" ? <React.Fragment key={`t${i}`}>{c}</React.Fragment>
        : c.type === "TextField" ? <TextFieldView key={c.path} node={c} control={control} />
        : <NodeView key={c.path} node={c} parentType="Field" />))}</>}
    </Field>
  )
}

function TextFieldView({ node, control }: { node: SafeNode; control: FieldControlProps | null }) {
  const s = useStable()
  const { values } = React.useContext(FormContext)
  const key = `form.${node.props.name as string}`
  return (
    <div className="atlas-node" {...tag(node)}>
      <Input {...node.props} {...(control ?? {})} value={values[key] ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => s.input(key, e.target.value)} />
    </div>
  )
}

class NodeBoundary extends React.Component<{ node: SafeNode; stable: Stable; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) {
    this.props.stable.report({ path: this.props.node.path, code: "render-error", detail: String(error) })
  }
  render() {
    if (!this.state.failed) return this.props.children
    const { node, stable } = this.props
    const fb = fallbackFor(node.type, stable.registry, node.path)
    // The terminal (Alert) failing falls back to itself; rendering it again would loop, so it renders nothing.
    return fb && fb.type !== node.type ? <NodeView node={fb} parentType={null} /> : null
  }
}
```

  If `Field`'s `error` prop type is `React.ReactNode`, `error={error}` with `string | ReactNode | undefined`
  type-checks. Run `tsc` to confirm, and do not widen any `ui-web` type.
- [ ] **Step 5: Run.** `npx vitest run packages/runtime && npx tsc --noEmit`. Expected: PASS. If axe reports a
  violation, read it first. A violation inside a `ui-web` component is a `QA-REPORT.md` bug, not a runtime fix:
  log it and stop (the lanes rule).
- [ ] **Step 6: Record DEC-084** in `atlas/state/decisions.json`:

```json
{
  "id": "DEC-084",
  "topic": "M4 runtime composition rules",
  "decision": "2026-10-23, M4 plan. (1) Nesting is closed: a child node is allowed only when the parent's nesting.children or the child's nesting.parents declares the pair and neither contradicts it; fallback nodes are not nesting-checked. (2) A Button placed directly in a Form renders type=submit. (3) A fallback message goes in the target's description slot, else children. (4) data-atlas-type sits on a display: contents wrapper (.atlas-node), or on the <form> itself for the structural Form. (5) Patches address the rendered tree, (/slots/<name>/<index>)+, and keep untouched subtrees' identity. (6) State paths are form.<TextField name>. (7) Both Playwright projects share one web server on 3031 instead of the roadmap's 3032 (one CI build, no second next dev on one .next).",
  "date": "2026-10-23"
}
```

- [ ] **Step 7: Commit.** `git add packages/runtime atlas/state/decisions.json && git commit -m "feat(runtime): renderer with per-node boundaries and the Field handoff (M4, DEC-084)"`

### Task 8: the size metric

> **As built (2026-10-23, DEC-085):** the ratio is 0.308, over the gate. On the owner's decision the test is
> `packages/runtime/tests/size.metric.tsx`, report-only: `vitest.metrics.config.ts` (`npm run test:metrics`) runs it
> in CI's metrics job with `continue-on-error`, and `metrics-report` reads `.metrics/vitest-metrics.json`.

**Files:** Create `packages/runtime/tests/size.test.tsx`.

- [ ] **Step 1: Write the test:**

```tsx
import * as React from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { registry } from "@atlas/registry/lib"
import { AtlasRuntime, silentTransport } from "@atlas/runtime/Runtime"
import type { ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

describe("runtime/protocol >", () => {
  it("payload is at most 30% of rendered markup bytes", () => {
    const op = fixture.render as ServerOp
    const markup = renderToStaticMarkup(<AtlasRuntime registry={registry} transport={silentTransport} initial={op} />)
    const payload = Buffer.byteLength(JSON.stringify(op))
    const bytes = Buffer.byteLength(markup)
    console.info(`runtime/protocol size: payload ${payload} B, markup ${bytes} B, ratio ${(payload / bytes).toFixed(3)}`)
    expect(payload).toBeLessThanOrEqual(0.3 * bytes)
  })
})
```

- [ ] **Step 2: Run.** `npx vitest run packages/runtime/tests/size.test.tsx`. Expected: PASS, and the ratio is
  printed. A FAIL is a real metric result: record the ratio and report it. Do not shrink the fixture copy to pass.
- [ ] **Step 3: Commit.** `git add packages/runtime && git commit -m "test(runtime): protocol payload is at most 30% of rendered markup (M4)"`

### Task 9: seeded fuzz

**Files:** Create `packages/runtime/tests/fuzz.ts` and `packages/runtime/tests/fuzz.test.tsx`.

- [ ] **Step 1: Write the generator** (`packages/runtime/tests/fuzz.ts`):

```ts
// Schema-derived malformed payloads: start from the valid fixture and mutate it with values the protocol schemas
// forbid (wrong types, unknown types and props, markup, nesting the registry rejects, deep and huge values).
export const SEED = Number(process.env.FUZZ_SEED ?? 0xa71a5)

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TYPES = ["Form", "Field", "TextField", "Button", "Alert", "UnknownChart", "Dialog", "Modal", "", "form"]
const NASTY: unknown[] = [
  null, undefined, 0, -1, Number.NaN, true, "", "<div>x</div>", "color: red", "{alert(1)}", "javascript:alert(1)",
  "x".repeat(10_000), [], {}, [[[]]], { type: 42 }, { type: "UnknownChart" }, { type: "Form" },
  { type: "Button", slots: { children: [{ type: "Form" }] } }, { type: "TextField", props: {} },
  { type: "Field", slots: { children: [{ type: "Alert" }] } },
]
const KEYS = ["type", "props", "slots", "children", "variant", "name", "onClick", "style", "dangerouslySetInnerHTML", "__proto__"]

export function mutate(value: unknown, rand: () => number, depth = 0): unknown {
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
  if (rand() < 0.12 || depth > 8) return structuredClone(pick(NASTY))
  if (Array.isArray(value)) {
    const out = value.map((v) => mutate(v, rand, depth + 1))
    if (rand() < 0.2) out.push(mutate(pick(NASTY), rand, depth + 1))
    if (rand() < 0.1 && out.length) out.splice(Math.floor(rand() * out.length), 1)
    return out
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (rand() < 0.08) continue
      out[k] = k === "type" && rand() < 0.3 ? pick(TYPES) : mutate(v, rand, depth + 1)
    }
    if (rand() < 0.15) Object.defineProperty(out, pick(KEYS), { value: structuredClone(pick(NASTY)), enumerable: true, configurable: true, writable: true })
    return out
  }
  return rand() < 0.1 ? pick(NASTY) : value
}
```

- [ ] **Step 2: Write the failing test** (`packages/runtime/tests/fuzz.test.tsx`):

```tsx
import * as React from "react"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { registry } from "@atlas/registry/lib"
import { AtlasRuntime, silentTransport } from "@atlas/runtime/Runtime"
import { validateTree } from "@atlas/runtime/validate"
import type { ProtocolNode } from "@atlas/runtime/protocol"
import { SEED, mulberry32, mutate } from "./fuzz"
import fixture from "./fixtures/request-access.json"

const payloads = Array.from({ length: 1000 }, (_, i) => mutate(fixture.render.root, mulberry32(SEED + i)))
const outcomes: Array<{ threw: unknown; rendered: boolean }> = []

beforeAll(() => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {})
  for (const root of payloads) {
    try {
      validateTree(root, registry)
      const { container } = render(<AtlasRuntime registry={registry} transport={silentTransport} initial={{ op: "render", seq: 1, root: root as ProtocolNode }} />)
      outcomes.push({ threw: null, rendered: container.querySelector("[data-atlas-node]") !== null })
    } catch (error) {
      outcomes.push({ threw: error, rendered: false })
    } finally {
      cleanup()
    }
  }
  spy.mockRestore()
}, 120_000)
afterAll(() => console.info(`runtime/fuzz seed ${SEED}: ${outcomes.filter((o) => o.rendered).length}/1000 rendered`))

describe("runtime/fuzz >", () => {
  it("no payload throws", () => expect(outcomes.filter((o) => o.threw).map((o) => String(o.threw))).toEqual([]))
  it("1000 malformed payloads all render", () => {
    expect(outcomes).toHaveLength(1000)
    expect(outcomes.filter((o) => o.rendered)).toHaveLength(1000)
  })
})
```

- [ ] **Step 3: Run.** `npx vitest run packages/runtime/tests/fuzz.test.tsx`. Expected: either PASS, or FAIL with a
  list of thrown errors. Each error is a validator or renderer bug: fix it in `src/`, add the payload that produced
  it as a named case in `validate.test.ts`, and re-run. Never filter payloads.
- [ ] **Step 4: Run three more seeds locally** with `FUZZ_SEED=1`, `2` and `3`, prefixing the same command each
  time. Expected: PASS.
- [ ] **Step 5: Verify the session.** `npm run token-lint && npx tsc --noEmit && npm test && npm run test:scripts && npx eslint packages/runtime && npm run atlas:verify -- --scope "packages/runtime/**,packages/registry/**"`.
- [ ] **Step 6: Commit.** `git add packages/runtime && git commit -m "test(runtime): 1000 seeded malformed payloads render without throwing (M4)"`
- [ ] **Step 7: Session close.** Update the handoff progress table (M4 2.5 of 3.5) and report.

---

## Session 4

### Task 10: the stub agent and the route

**Files:**
- Create: `packages/runtime/src/stub-agent.ts`, `packages/runtime/tests/stub-agent.test.ts`
- Create: `app/runtime-demo/page.tsx`, `app/runtime-demo/RuntimeDemo.tsx`, `app/runtime-demo/runtime-demo.css`

**Interfaces:**
- Produces: `createStubAgent(fixture: Fixture, delayMs?: number): StubAgent`, where
  `StubAgent = Transport & { log: Array<ClientEvent | ServerOp>; inject(op: DistributiveOmit<ServerOp, "seq">): void }`.
- Produces: `window.__atlasRuntime = { types: string[]; log(): Array<ClientEvent | ServerOp>; nodeCount(): number; renders: string[]; inject(op): void }`.

- [ ] **Step 1: Write the failing test** (`packages/runtime/tests/stub-agent.test.ts`):

```ts
import { describe, expect, it } from "vitest"
import { createStubAgent } from "@atlas/runtime/stub-agent"
import type { Fixture, ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const collect = (agent: ReturnType<typeof createStubAgent>) => { const ops: ServerOp[] = []; agent.subscribe((op) => ops.push(op)); return ops }
const flush = () => new Promise((r) => setTimeout(r, 5))

describe("runtime/stub-agent >", () => {
  it("acks every event, then answers an invalid email with a state op, seq strictly increasing", async () => {
    const agent = createStubAgent(fixture as Fixture)
    const ops = collect(agent)
    agent.send({ kind: "event", seq: 1, type: "submit", source: "", values: { "form.email": "nope", "form.organisation": "Acme" } })
    await flush()
    expect(ops[0]).toEqual({ op: "ack", seq: 2, ack: 1 })
    expect(ops).toContainEqual(expect.objectContaining({ op: "state", path: "form.email", value: { error: "Enter a valid work email" } }))
    expect(ops.map((o) => o.seq)).toEqual([...ops.map((o) => o.seq)].sort((a, b) => a - b))
  })
  it("a valid submit clears both errors and patches in the success Alert", async () => {
    const agent = createStubAgent(fixture as Fixture)
    const ops = collect(agent)
    agent.send({ kind: "event", seq: 1, type: "submit", source: "", values: { "form.email": "a@b.co", "form.organisation": "Acme" } })
    await flush()
    expect(ops.at(-1)).toMatchObject({ op: "patch", at: "/slots/children/3", node: { type: "Alert" } })
  })
})
```

- [ ] **Step 2: Run.** `npx vitest run packages/runtime/tests/stub-agent.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** (`packages/runtime/src/stub-agent.ts`):

```ts
// The M4 stand-in for an agent: it answers submits from fixture ops and never calls a model. Its own seq starts
// after the fixture's render op. `log` is the wire as the client saw it; the Playwright tests read it.
import type { ClientEvent, Fixture, ServerOp, Transport } from "./protocol"

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
export type StubAgent = Transport & { log: Array<ClientEvent | ServerOp>; inject(op: DistributiveOmit<ServerOp, "seq">): void }

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function createStubAgent(fixture: Fixture, delayMs = 0): StubAgent {
  const listeners = new Set<(op: ServerOp) => void>()
  const log: Array<ClientEvent | ServerOp> = [fixture.render]
  let seq = fixture.render.seq
  let succeeded = false
  const emit = (ops: Array<DistributiveOmit<ServerOp, "seq">>) => setTimeout(() => {
    for (const op of ops) {
      const stamped = { ...op, seq: ++seq } as ServerOp
      log.push(stamped)
      for (const l of listeners) l(stamped)
    }
  }, delayMs)
  const responses = (key: string) => (fixture.responses[key] ?? []).map(({ seq: _s, ...op }) => op as DistributiveOmit<ServerOp, "seq">)

  return {
    log,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    inject(op) { emit([op]) },
    send(event) {
      log.push(event)
      const email = event.values["form.email"] ?? "", org = (event.values["form.organisation"] ?? "").trim()
      const ops = [{ op: "ack", ack: event.seq } as DistributiveOmit<ServerOp, "seq">,
        ...responses(EMAIL.test(email) ? "clear-email" : "invalid-email"),
        ...responses(org ? "clear-organisation" : "missing-organisation")]
      if (EMAIL.test(email) && org && !succeeded) { succeeded = true; ops.push(...responses("success")) }
      emit(ops)
    },
  }
}
```

- [ ] **Step 4: Run.** Same command. Expected: PASS.
- [ ] **Step 5: Create the route.** `app/runtime-demo/page.tsx`:

```tsx
import type { Metadata } from "next"
import { RuntimeDemo } from "./RuntimeDemo"

export const metadata: Metadata = { title: "Atlas runtime demo" }

export default function Page() {
  return <RuntimeDemo />
}
```

  `app/runtime-demo/RuntimeDemo.tsx`:

```tsx
"use client"
// M4: the Request access form rendered entirely from a JSON protocol tree through packages/registry and
// packages/runtime. The agent is the fixture stub; window.__atlasRuntime is the Playwright test surface.
import * as React from "react"
import { registry } from "@atlas/registry/lib"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { createStubAgent, type StubAgent } from "@atlas/runtime/stub-agent"
import type { Fixture, SafeNode } from "@atlas/runtime/protocol"
import fixture from "@atlas/runtime/../tests/fixtures/request-access.json"
import "@atlas/runtime/runtime.css"
import "./runtime-demo.css"

declare global { interface Window { __atlasRuntime?: { types: string[]; log(): unknown[]; nodeCount(): number; renders: string[]; inject: StubAgent["inject"] } } }

export function RuntimeDemo() {
  const agent = React.useMemo(() => createStubAgent(fixture as Fixture), [])
  const renders = React.useRef<string[]>([])
  React.useEffect(() => {
    window.__atlasRuntime = {
      types: Object.keys(registry.entries),
      log: () => agent.log,
      nodeCount: () => document.querySelectorAll("[data-atlas-runtime] [data-atlas-node]").length,
      renders: renders.current,
      inject: agent.inject,
    }
  }, [agent])
  const onRender = React.useCallback((path: string) => { renders.current.push(path) }, [])
  return (
    <main className="atlas-runtime-demo">
      <AtlasRuntime registry={registry} transport={agent} initial={(fixture as Fixture).render} onRender={onRender} />
    </main>
  )
}
```

  If Next does not resolve `@atlas/runtime/../tests/...`, add `"@atlas/runtime-fixtures/*": ["./packages/runtime/tests/fixtures/*"]`
  to `tsconfig.base.json` paths and import from it. `nodeCount` counts the DOM. The Playwright test compares that
  count with the number of nodes in the last `render` op after validation, so the two sides are independent.

  `app/runtime-demo/runtime-demo.css`:

```css
.atlas-runtime-demo {
  max-inline-size: var(--atlas-content-width-sm);
  margin-inline: auto;
  padding: var(--atlas-spacing-8);
}
```

- [ ] **Step 6: Look at it.** Start the `run` skill or `npm run dev`, open `http://localhost:3030/runtime-demo`, submit
  empty and then valid values, and screenshot both states. Expected: the field errors show under the inputs, and
  the success Alert appears below the button.
- [ ] **Step 7: Commit.** `git add packages/runtime app/runtime-demo tsconfig.base.json && git commit -m "feat(runtime-demo): the Request access route on the real packages, fixture-driven (M4)"`

### Task 11: Playwright, the six runtime-demo metrics and page-level axe

**Files:**
- Create: `tests/runtime/runtime-demo.spec.ts`
- Modify: `playwright.config.ts` and the scripts in `package.json`

- [ ] **Step 1: Split the config into two projects.** In `playwright.config.ts`:
  - Remove the top-level `testDir`.
  - Give the existing project `testDir: "tests/visual"`.
  - Add a second project:
    `{ name: "runtime-demo", testDir: "tests/runtime", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} } }`.
  - Change the CI web-server command to `"npx next start --port 3031"`. CI builds in its own step (Task 12).

  In the `package.json` scripts, set:
  - `"test:visual": "playwright test --project=chromium"`
  - `"test:visual:update": "playwright test --project=chromium --update-snapshots"`
  - `"test:runtime": "playwright test --project=runtime-demo"`
- [ ] **Step 2: Write the spec** (`tests/runtime/runtime-demo.spec.ts`):

```ts
import { createRequire } from "node:module"
import { expect, test, type Page } from "@playwright/test"

const require = createRequire(import.meta.url)
type Wire = { op?: string; kind?: string; seq: number; ack?: number; path?: string }
const wire = (page: Page) => page.evaluate(() => window.__atlasRuntime!.log() as unknown[]) as Promise<Wire[]>
const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.max(0, Math.ceil(xs.length * 0.95) - 1)]

test.beforeEach(async ({ page }) => {
  await page.goto("/runtime-demo")
  await page.waitForFunction(() => window.__atlasRuntime !== undefined)
})

test("runtime-demo > every node carries a registered data-atlas-type", async ({ page }) => {
  const types = await page.evaluate(() => window.__atlasRuntime!.types)
  const nodes = page.locator("[data-atlas-runtime] [data-atlas-node]")
  await expect(nodes).toHaveCount(6)
  for (const t of await nodes.evaluateAll((ns) => ns.map((n) => n.getAttribute("data-atlas-type")))) expect(types).toContain(t)
  await expect(page.locator("[data-atlas-runtime] [style]")).toHaveCount(0)
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") })
  const violations = await page.evaluate(async () => (await (window as unknown as { axe: { run(n: Element): Promise<{ violations: unknown[] }> } }).axe.run(document.querySelector("[data-atlas-runtime]")!)).violations)
  expect(violations).toEqual([])
})

test("runtime-demo > interaction sends a state delta, not a re-render", async ({ page }) => {
  await page.getByLabel(/Work email/).fill("nope")
  await page.getByLabel(/Organisation/).fill("Acme")
  await page.getByRole("button", { name: "Request access" }).click()
  const error = page.getByText("Enter a valid work email")
  await expect(error).toBeVisible()
  const ops = (await wire(page)).filter((m) => m.op)
  expect(ops.filter((m) => m.op === "render")).toHaveLength(1)
  expect(ops).toContainEqual(expect.objectContaining({ op: "state", path: "form.email" }))
  const describedBy = (await page.getByLabel(/Work email/).getAttribute("aria-describedby")) ?? ""
  const errorId = await error.evaluate((n) => n.closest("[id]")?.id ?? "")
  expect(describedBy.split(" ")).toContain(errorId)
  await expect(page.locator(`[id="${errorId}"]`).locator("xpath=ancestor-or-self::*[@role='alert' or @aria-live]")).not.toHaveCount(0)
})

test("runtime-demo > 50 rapid submits keep strictly increasing sequence", async ({ page }) => {
  await page.evaluate(() => { const f = document.querySelector("form")!; for (let i = 0; i < 50; i++) f.requestSubmit() })
  await page.waitForFunction(() => (window.__atlasRuntime!.log() as Array<{ op?: string }>).filter((m) => m.op === "ack").length === 50)
  const log = await wire(page)
  const events = log.filter((m) => m.kind === "event").map((m) => m.seq)
  expect(events).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
  const server = log.filter((m) => m.op).map((m) => m.seq)
  expect(server.every((s, i) => i === 0 || s > server[i - 1])).toBe(true)
  expect(log.filter((m) => m.op === "ack").map((m) => m.ack)).toEqual(events)
})

test("runtime-demo > patch updates only the addressed subtree", async ({ page }) => {
  await page.locator('[data-atlas-type="Field"]').evaluateAll((ns) => ns.forEach((n, i) => ((n as unknown as { __mark: number }).__mark = i + 1)))
  await page.evaluate(() => { window.__atlasRuntime!.renders.length = 0 })
  await page.evaluate(() => window.__atlasRuntime!.inject({ op: "patch", at: "/slots/children/3", node: { type: "Alert", props: { variant: "info" }, slots: { title: ["Patched"] } } }))
  await expect(page.getByText("Patched")).toBeVisible()
  const marks = await page.locator('[data-atlas-type="Field"]').evaluateAll((ns) => ns.map((n) => (n as unknown as { __mark?: number }).__mark))
  expect(marks).toEqual([1, 2])
  const rendered = new Set(await page.evaluate(() => window.__atlasRuntime!.renders))
  expect([...rendered].every((p) => p === "" || p === "/slots/children/3")).toBe(true)
})

test("runtime-demo > state ack p95", async ({ page }, info) => {
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => document.querySelector("form")!.requestSubmit())
    await page.waitForFunction((n) => performance.getEntriesByName("atlas:ack").length >= n, i + 1)
  }
  const ms = await page.evaluate(() => performance.getEntriesByName("atlas:ack").map((e) => e.duration))
  info.annotations.push({ type: "ack p95 ms", description: p95(ms).toFixed(1) })
  console.info(`runtime-demo ack p95 ${p95(ms).toFixed(1)} ms over ${ms.length}`)
  expect(p95(ms)).toBeLessThan(600) // gate = 2 × the 300 ms north-star target (roadmap M4)
})

test("runtime-demo > fallback render p95", async ({ page }, info) => {
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.__atlasRuntime!.inject({ op: "patch", at: "/slots/children/3", node: { type: "UnknownChart" } }))
    await page.waitForFunction((n) => performance.getEntriesByName("atlas:fallback").length >= n, i + 1)
  }
  await expect(page.getByText("This content is unavailable").first()).toBeVisible()
  await expect(page.locator('[data-atlas-type="Field"]')).toHaveCount(2)
  const ms = await page.evaluate(() => performance.getEntriesByName("atlas:fallback").map((e) => e.duration))
  info.annotations.push({ type: "fallback p95 ms", description: p95(ms).toFixed(1) })
  console.info(`runtime-demo fallback p95 ${p95(ms).toFixed(1)} ms over ${ms.length}`)
  expect(p95(ms)).toBeLessThan(200) // gate = 2 × the 100 ms north-star target
})
```

  The first injected patch inserts at index 3, and later ones replace it, so `/slots/children/3` exists after the
  first one. Next dev runs React in StrictMode, so `renders` can hold each path twice. The test compares sets,
  never counts.
- [ ] **Step 3: Run.** `npm run test:runtime`. Expected: 6 passed. When a latency test fails locally under `next dev`,
  re-run against a production build (`npm run build`, then `CI=1 npm run test:runtime`) before concluding anything,
  because CI measures the production build.
- [ ] **Step 4: Prove the names land.** Run
  `PLAYWRIGHT_JSON_OUTPUT_NAME=.metrics/playwright.json npx playwright test --project=runtime-demo --reporter=json && npx vitest run --reporter=json --outputFile=.metrics/vitest.json && npm run metrics:report`.
  Expected: the generated region shows all 12 M4 rows as passing or failing, none as not measurable. Record the
  two p95 values.
- [ ] **Step 5: Run the visual project as well.** `npm run test:visual`. Expected: still passing; only the script changed.
- [ ] **Step 6: Commit.** `git add tests/runtime playwright.config.ts package.json && git commit -m "test(runtime-demo): six runtime metrics and page-level axe in Playwright (M4)"`

### Task 12: CI

**Files:** Modify `.github/workflows/ci.yml` and `.github/workflows/visual-baseline.yml`, and create
`.github/workflows/fuzz-nightly.yml`.

- [ ] **Step 1: Add a blocking `runtime` job** to `ci.yml`, after `metrics`:

```yaml
  # ─── Runtime (M4): registry lookups, validator, renderer, size and seeded fuzz ───
  runtime:
    name: Runtime
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npx vitest run packages/registry packages/runtime
```

- [ ] **Step 2: Extend `visual`.** After `npx playwright install --with-deps chromium`, add a step
  `- if: steps.baselines.outputs.found != '0'` with `run: npm run build`. After `npm run test:visual`, add a step with
  the same `if` and `run: npm run test:runtime`. In `visual-baseline.yml`, add `- run: npm run build` before
  `npm run test:visual:update`.
- [ ] **Step 3: Create `fuzz-nightly.yml`.** It is non-blocking: it opens an issue and never fails a PR.

```yaml
name: Fuzz (nightly, random seed)
on:
  schedule: [{ cron: "17 3 * * *" }]
  workflow_dispatch:
permissions:
  contents: read
  issues: write
jobs:
  fuzz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci --legacy-peer-deps
      - id: seed
        run: echo "seed=$(( (RANDOM << 15) | RANDOM ))" >> "$GITHUB_OUTPUT"
      - id: run
        continue-on-error: true
        run: FUZZ_SEED=${{ steps.seed.outputs.seed }} npx vitest run packages/runtime/tests/fuzz.test.tsx
      - if: steps.run.outcome == 'failure'
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh issue create --title "runtime fuzz failed with seed ${{ steps.seed.outputs.seed }}" --body "Reproduce with FUZZ_SEED=${{ steps.seed.outputs.seed }} npx vitest run packages/runtime/tests/fuzz.test.tsx — run ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

- [ ] **Step 4: Lint the workflows.** `npx --yes actionlint` if it is available; otherwise
  `node -e 'for (const f of ["ci","visual-baseline","fuzz-nightly"]) require("yaml").parse(require("fs").readFileSync(`.github/workflows/${f}.yml`,"utf8"))'`.
  Expected: no errors.
- [ ] **Step 5: Commit.** `git add .github/workflows && git commit -m "ci: runtime job, runtime-demo Playwright project, nightly random-seed fuzz (M4)"`

### Task 13: drop the false `main`, the runtime skill, and the records

**Files:**
- Modify: `packages/ui-web/package.json`
- Create: `.agents/skills/atlas-runtime/SKILL.md`
- Modify: `AGENTS.md` §9
- Modify: `atlas/state/candidates.json`, the roadmap, the handoff and `claude.md`

- [ ] **Step 1: Check nothing imports the barrel.** `grep -rnE "from \"@atlas/ui-web\"|from '@atlas/ui-web'" app packages tests scripts`.
  Expected: no matches. If there is a match, stop and report it.
- [ ] **Step 2: Drop the fields.** In `packages/ui-web/package.json`, delete `"main"` and `"types"`, and set
  `"exports": { "./*": "./src/*" }`. Then run `npx tsc --noEmit && npm run build`. Expected: PASS.
- [ ] **Step 3: Write the skill.** Create `.agents/skills/atlas-runtime/SKILL.md`, with lane boundaries from roadmap R9:

```markdown
---
name: atlas-runtime
description: Change the Atlas runtime — packages/runtime (protocol, validator, fallback, reducer, renderer, stub agent) and app/runtime-demo. Use for "the runtime drops X", "add a protocol op", "fix the renderer", "the fuzz found a crash", "a runtime-demo test fails". Not for registry declarative fields (packages/registry/src, aliases — that lane is the registry's), not for a library component (atlas-component), not for a prototype (atlas-prototype). Never creates routes under app/prototypes.
---

# atlas-runtime

## Owns
`packages/runtime/**` and `app/runtime-demo/**`, plus `tests/runtime/**`.

## Must not
- Author registry declarative fields (protocolProps, slots, nesting, fallback…) — those are owner decisions in `packages/registry/src`.
- Change any component in `packages/ui-web/src`, or add a token or component.
- Create routes under `app/prototypes`.

## Contract (do not break)
- The validator never throws: unknown/malformed → fallback, bad nesting → dropped, bad prop → stripped, missing required → fallback (DEC-082/083/084).
- Every rendered node carries a registered `data-atlas-type`; no raw `style` attribute.
- Metric test names are exact strings from `metrics.manifest.json` (vitest: `describe("runtime/x >")` + `it("…")`; Playwright: top-level `test("runtime-demo > …")`).

## Verify
`npx vitest run packages/registry packages/runtime` → `npm run test:runtime` → `npm run atlas:verify -- --scope "packages/runtime/**,app/runtime-demo/**"`.
A fuzz failure: add the payload as a named case in `validate.test.ts`, fix `src/`, never filter payloads.
```

  In `AGENTS.md` §9, add the row `| Change the runtime, protocol or runtime demo | \`atlas-runtime\` skill |`.
- [ ] **Step 4: Log the Form gap.** Append CAND-056 to `atlas/state/candidates.json`. Copy the field set from the
  last candidate entry, and do not invent fields. Note: "Form is a registered structural type (DEC-080) composed by
  the runtime as an intrinsic <form>; there is no Form component in Figma or ui-web. A Form component (submit row
  layout, error summary) needs a Figma-first atlas-component session." Then run
  `npm run atlas:verify -- --scope "atlas/state/**" --skip tsc,tests`. Expected: `design/schemas` PASS.
- [ ] **Step 5: Regenerate the metrics region.** Run Task 11 Step 4 again, then `npm run metrics:report` to write
  the roadmap region and `npm run metrics:check`.
- [ ] **Step 6: Update the records.**
  - Roadmap §M4 heading: `— ✅ DONE <date> (<n> sessions)`, plus a short "as built" list (the deviations from
    decisions 3, 7 and 8).
  - Handoff progress row: M4 3.5 of 3.5. Move "Next" to Phase 4, and add the two measured p95 values and the size
    ratio.
  - `claude.md` "Current work" line.
- [ ] **Step 7: Commit.** `git add -A && git commit -m "docs(atlas): M4 done — runtime skill, Form candidate, metrics regenerated"`

### Task 14: full verification and the PR

- [ ] **Step 1: Run everything in order.** `npm run tokens:build && git diff --exit-code packages/tokens && npm run token-lint && npx tsc --noEmit && npm test && npm run test:scripts && npx eslint . && npm run registry:check && npm run metrics:check && npm run atlas:verify -- --base origin/main && npm run test:visual && npm run test:runtime`.
  Expected: everything passes. Report each command's actual result.
- [ ] **Step 2: Run the exit check by hand.** In a scratch copy of the repo, or a reverted change, move
  `packages/registry/src/Alert.registry.json` aside, run `npm run registry:build`, open `/runtime-demo`, and confirm
  the form renders without the success Alert. Then restore the file and run `npm run registry:build`, and confirm
  `git status` is clean. The automated equivalent is the `deleting the Alert entry` test in `render.test.tsx`.
- [ ] **Step 3: Ask before opening the PR.** When the user approves: run `gh pr create`, then `get_status`/`bind_pr`,
  then turn on auto-merge and auto-fix (standing preference).

---

## Self-review

**Spec coverage (roadmap §M4 table → task):**

| Roadmap stage | Covered by |
|---|---|
| Registry: resolve TextField/Modal, filter ⊆ 6 without Dialog | Task 2 |
| Protocol: fixture validates; size ≤ 30% | Tasks 3, 5 (per-node schema), 8 |
| Validator, all six table cases | Task 5 (unknown type, unknown prop, missing variant, Button ⊃ Form, missing name, markup) |
| Fallback: exact copy, rest intact, every entry has one, targets registered | Task 5 (copy per DEC-080, not `Card + Text`) |
| Renderer: data-atlas-type, zero style, axe, throwing → fallback | Tasks 7 (vitest), 11 (Playwright + axe) |
| State delta: state op `form.email`, aria-live and aria-describedby, 50 submits, ack p95, fallback p95 | Task 11 |
| Recovery: 1000 seeded payloads, 0 thrown | Task 9 |
| CI: runtime job, second Playwright project, fixed-seed fuzz, nightly random | Tasks 11, 12 (one shared port, decision 8) |
| componentMap generated, false `main` dropped | Already generated in M3; Task 13 drops `main` |
| Form gap logged | Task 13 |
| Exit: route renders from JSON; Alert deletion keeps the page | Tasks 10, 7, 14 |

**Deviations, with reasons:**
- Fallback copy is Alert (DEC-080), not `Card + Text`, because Text does not exist.
- One web server instead of port 3032 (decision 8, DEC-084).
- 12 metric rows instead of the prose's 11 (the manifest is authoritative).
- Deleting Alert drops the node instead of rendering a fallback (DEC-082). This is the owner's choice, since Alert
  is itself the terminal.

**Placeholder scan:** no TBD or TODO. Two steps branch on what the environment shows (the Next fixture import path
in Task 10, the orphan allow-list in Task 2), and each names the exact fallback edit.

**Name consistency:** `validateTree`, `fallbackFor`, `propValidator`/`nodeValidator`, `reduce`/`initialState`,
`AtlasRuntime`/`silentTransport`, `createStubAgent`/`StubAgent` and `window.__atlasRuntime` are spelled the same in
every task that uses them.

**Named open risks:**
1. The `css declaration` pattern rejects copy such as "Position: Manager". That is acceptable for M4's fixtures.
   Revisit it in Phase 6, when real agent copy arrives.
2. If a `ui-web` component fails page-level axe, that is a library bug the runtime lane may not fix. It goes to
   `QA-REPORT.md` and blocks the exit until an atlas-component session fixes it.
3. Ack latency is measured against an in-page stub, so it proves the client path only. Network latency is Phase 6's.
