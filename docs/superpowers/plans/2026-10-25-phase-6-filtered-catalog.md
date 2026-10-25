# Phase 6 — Filtered agent catalog (PR-0: enforcement) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every agent request carries a filtered catalog built outside the agent. The runtime validates against a registry restricted to that catalog, so the validator rejects an out-of-catalog type even when the agent emits one. Three Context Containment rows become measurable (vitest): "every request carries a filtered catalog", "no request exposes the full catalog" and "catalog excludes out-of-task types".

**Architecture:**
- **`packages/registry/lib/filter.ts`** (roadmap Phase 6) holds four functions:
  - `filter(capabilities)`: the closure of capability matches, nesting children (both directions) and fallback targets.
  - `fullCatalog()`: every agent-visible name.
  - `catalogFor(request)`: the catalog for one request.
  - `restrict(registry, catalog)`: a registry holding only the catalog's types, with `withheld` listing every other agent-visible name.
- **`packages/runtime/src/session.ts`** has `openSession(request)`, the only way to build an `AgentRequest`. It returns the request (what the agent sees: task, catalog types and a prompt) and the restricted registry (what the runtime validates against). They come from one call, so they cannot disagree, and no server op carries a catalog, so the agent cannot widen it.
- **Validator:** a type that is not in `entries` but is in `withheld` reports the new issue code `out-of-catalog` instead of `unknown-type`. The behaviour is unchanged: the node falls back, as before (DEC-082).
- **Runtime demo** opens a session for the Request access task and gives `AtlasRuntime` the restricted registry.
- **PR-1 (separate plan, session 26):** a model-backed agent, a `protocol` bench type in `benchmarks/run.sh`, and the two bench rows `protocol.promptReduction` and `protocol.firstOpP95`. They are planned once PR-0 lands and decision **D-C** is taken (see "Decisions for the owner").

**Tech Stack:** TypeScript · vitest · Playwright (`npm run test:runtime`) · `scripts/registry-build.mjs` + `scripts/lib/registry.mjs` · `scripts/metrics-report.mjs`.

## Global Constraints

- **Roadmap Phase 6, verbatim:** "the agent receives a catalog subset, **and** the validator independently rejects any `type` outside the subset that produced the request. The filter is a prompt optimisation; the validator is the guarantee. Assertions: 100% of requests use a filtered catalog, 0 expose the full 47, and the *validator* rejects an out-of-catalog type even when the agent emits it."
- **Metric check names are exact strings from `metrics.manifest.json`:**
  - `registry/filter > every request carries a filtered catalog`
  - `registry/filter > no request exposes every registered type` (renamed under D-A, see below)
  - `registry/filter > catalog excludes out-of-task types`
  - vitest joins `describe("registry/filter >")` and `it("…")` with a space.
- **Validator contract unchanged (atlas-runtime skill):** it never throws. Unknown or out-of-catalog → fallback. A fallback target that is not registered → the node is dropped and its siblings stay (DEC-082).
- **No registry declarative field changes:** `packages/registry/src/*.registry.json` and `aliases.json` are owner decisions (DEC-080) and are not edited. `capabilities` stay as authored: Form `submit`, TextField `input`, Button `press`, Alert `dismiss`, Field none.
- **No new component, no new token, nothing under `packages/ui-web/src`, no Figma call.** Phase 6 touches no component, so the four gates' Figma steps do not apply. Gate 1 is this plan's approval.
- **Generated files** (`packages/registry/generated/**`) change only through `npm run registry:build`; `registry:check` must pass.
- **Kind A for visuals:** zero changed visual baselines. The demo renders the same tree: the submit closure is all 5 registered types.
- **Lanes (roadmap R9):** `packages/runtime/**`, `app/runtime-demo/**` and `tests/runtime/**` belong to atlas-runtime. `packages/registry/lib/**` and the generator belong to the registry lane, which has no skill yet, so use atlas-runtime's Verify steps for both.
- **Metric region:** refresh from the PR's own CI artifact before auto-merge can land it (handoff "Start here" 5).

## Decisions for the owner (gate 1: approved 2026-10-25, A1 + B1)

**D-A. What is "the full catalog"?** Today 5 types are registered (Alert, Button, Field, Form, TextField). The Request access task legitimately needs all 5, so "no request exposes every registered type" would fail on the M4 task for as long as only 5 are registered.
- **A1 (chosen 2026-10-25):** the full catalog is every agent-visible name: the 5 registered types, plus the 43 Atlas components with generated facts that no entry aliases, 48 in all. This matches the roadmap's "0 expose the full 47" and today's baseline, where agents read all 47 in `atlas/index.md`. The manifest check is renamed to `registry/filter > no request exposes the full catalog`, and the three rows gain a `why` that states the population: "5 of 48 agent-visible names are registered; a catalog can only contain registered types." Caveat: the row passes partly because 43 components are not runtime-renderable at all. The `why` says so; it is not a claim that filtering removed them.
- **A2:** the full catalog is the registered types only. The check name stays. The row reads **failing** until more types are registered, which is a registry-lane task outside Phase 6.

**D-B. Do fallback targets join every catalog?** Every type falls back to Alert (DEC-080). If Alert is not in the restricted registry, a fallback is dropped instead of rendered.
- **B1 (chosen 2026-10-25):** yes. `filter()` adds each included type's fallback target (without expanding that target's nesting). The set the agent sees is then exactly the set the validator accepts. The existing test "a press request gets only Button" becomes `["Alert", "Button"]`.
- **B2:** no. Catalogs stay as today, and out-of-catalog nodes in a press-only session are dropped rather than replaced by the "This content is unavailable" Alert.

**D-C (needed for PR-1 only, can wait):** the model agent's transport and model. Either the Anthropic API with streaming, which needs `@anthropic-ai/sdk` and an API key and measures first op from the request, or `claude -p --output-format stream-json`, which adds CLI startup to every first-op time and makes <250 ms unreachable. Also the model pin and a spend cap for the bench ledger. This is decided in session 26 before the PR-1 plan.

**Owner answer (2026-10-25):** A1 (the full catalog is 48 agent-visible names) and B1 (fallback targets join every catalog). The tasks below are written for **A1 + B1**. Under A2, Task 2 drops `components` and `fullCatalog` uses `Object.keys(r.entries)`, Task 6 keeps the manifest check name, and the "no request exposes…" test is expected to fail for `request-access`. Under B2, Task 2 drops the fallback step and the expected closures lose the added `Alert`.

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `scripts/lib/registry.mjs` | modify `runtimeRegistrySource` | also emit `components`: the sorted names of every generated facts file |
| `scripts/registry-build.mjs:126` | modify | pass `Object.keys(facts)` to `runtimeRegistrySource` |
| `packages/registry/generated/runtimeRegistry.ts` | regenerated | gains `export const components` |
| `packages/registry/lib/registry.ts` | create | the `Registry` types and the `registry` value, moved from `index.ts` unchanged, plus `components` and an optional `withheld` |
| `packages/registry/lib/filter.ts` | create | `filter`, `fullCatalog`, `catalogFor`, `restrict` |
| `packages/registry/lib/index.ts` | modify | re-export `registry.ts` and `filter.ts`; keep `resolve`, `without` |
| `packages/registry/tests/eval-tasks.json` | create | evaluation requests: capabilities, expected types, out-of-task types |
| `packages/registry/tests/registry.test.ts` | modify | update the press closure (B1) |
| `packages/registry/tests/filter.test.ts` | create | the three metric tests plus unit tests |
| `packages/runtime/src/protocol.ts` | modify | `out-of-catalog` issue code; `AgentRequest` type |
| `packages/runtime/src/validate.ts` | modify | report `out-of-catalog` for withheld types |
| `packages/runtime/src/session.ts` | create | `openSession`, `catalogPrompt` |
| `packages/runtime/src/stub-agent.ts` | modify | takes an `AgentRequest`; exposes it as `agent.request` |
| `packages/runtime/tests/session.test.ts` | create | session, prompt and independent-rejection tests |
| `packages/runtime/tests/stub-agent.test.ts`, `render.test.tsx`, `fuzz.test.tsx`, `size.metric.tsx` | modify only if they call `createStubAgent` | pass a session's request |
| `app/runtime-demo/RuntimeDemo.tsx` | modify | open a session; restricted registry; expose `request` |
| `tests/runtime/runtime-demo.spec.ts` | modify | request carries the catalog; withheld type falls back |
| `metrics.manifest.json` | modify | A1 rename and three `why` notes |
| `docs/ATLAS-DELIVERY-ROADMAP.md`, `docs/HANDOFF-next-session.md`, `claude.md` | modify | Phase 6 progress, generated metric region |
| `atlas/state/decisions.json` | append DEC-092 | D-A and D-B, as M5 stages appended theirs, then `npm run atlas:sync` |

---

### Task 1: Owner approval (gate 1)

- [x] **Step 1:** The owner answers D-A and D-B, and approves this plan. Done 2026-10-25: A1 + B1, recorded under "Decisions for the owner".
- [x] **Step 2:** Commit the plan on `claude/session-24-phase6`.

```bash
git add docs/superpowers/plans/2026-10-25-phase-6-filtered-catalog.md
git commit -m "docs(atlas): Phase 6 plan — filtered agent catalog, PR-0 enforcement"
```

No code before this step.

---

### Task 2: The catalog functions (`packages/registry/lib/filter.ts`)

**Files:**
- Modify: `scripts/lib/registry.mjs:778-795`, `scripts/registry-build.mjs:126`
- Create: `packages/registry/lib/registry.ts`, `packages/registry/lib/filter.ts`, `packages/registry/tests/eval-tasks.json`, `packages/registry/tests/filter.test.ts`
- Modify: `packages/registry/lib/index.ts`, `packages/registry/tests/registry.test.ts`

**Interfaces:**
- Produces:
  - `filter(capabilities: string[], r?: Registry): string[]`
  - `fullCatalog(r?: Registry): string[]`
  - `catalogFor(req: CatalogRequest, r?: Registry): Catalog`
  - `restrict(r: Registry, catalog: Catalog): Registry`
  - types `CatalogRequest = { task: string; capabilities: string[] }`, `Catalog = { task: string; capabilities: string[]; types: string[] }`
  - `Registry` gains `components: string[]` and `withheld?: string[]`
  - all of these exported from `@atlas/registry/lib`

- [ ] **Step 1: Generator emits `components`.** In `scripts/lib/registry.mjs`, change the signature to `runtimeRegistrySource(entries, components)` and append after the `aliasTable` line in the template:

```js
/** Every Atlas component with generated facts, registered or not: the agent-visible universe (Phase 6, D-A). */
export const components: string[] = ${JSON.stringify([...components].sort())}
```

In `scripts/registry-build.mjs:126`:

```js
  written[`${GEN}/runtimeRegistry.ts`] = runtimeRegistrySource(entries, Object.keys(facts))
```

Run `npm run registry:build && npm run registry:check`. Expected: the build writes `runtimeRegistry.ts` with a 47-name `components` array, and the check exits 0. If `facts` keys are not the 47 component names (for example, keyed by file), use `Object.values(facts).map((f) => f.name)`.

- [ ] **Step 2: Split the registry value out of `index.ts`.** Create `packages/registry/lib/registry.ts` holding the type block and the `registry` const now in `index.ts` lines 1–26, unchanged except for the following:

```ts
import { aliasTable, components, entries, schemas } from "../generated/runtimeRegistry"
// …Entry, ProtocolPropSpec, Fallback, JsonSchema unchanged…
export type Registry = {
  entries: Record<string, Entry>
  schemas: Record<string, JsonSchema>
  aliases: Record<string, string>
  /** Every Atlas component with facts (generated). fullCatalog reads it. */
  components: string[]
  /** Agent-visible names outside the catalog; set only by restrict(). The validator reports them as out-of-catalog. */
  withheld?: string[]
}

export const registry: Registry = {
  entries: entries as unknown as Record<string, Entry>,
  schemas: schemas as unknown as Record<string, JsonSchema>,
  aliases: aliasTable,
  components,
}
```

`index.ts` keeps `resolve` and `without`, imports `registry` and `Registry` from `./registry`, deletes its old `filter`, and ends with:

```ts
export * from "./registry"
export { catalogFor, filter, fullCatalog, restrict, type Catalog, type CatalogRequest } from "./filter"
```

- [ ] **Step 3: Write the evaluation set.** Create `packages/registry/tests/eval-tasks.json`. `expected` is the B1 closure, and `outOfTask` lists names that must never appear:

```json
{
  "_note": "AUTHORED. Phase 6 evaluation requests. expected is the catalog filter() must return (D-B: B1, fallback targets included); outOfTask are agent-visible names irrelevant to the task. Add a row when a capability is authored.",
  "tasks": [
    { "id": "request-access", "task": "Request access form", "capabilities": ["submit"],
      "expected": ["Alert", "Button", "Field", "Form", "TextField"],
      "outOfTask": ["Dialog", "Tabs", "Table", "Chart", "NavBar", "DatePicker"] },
    { "id": "confirm", "task": "A single confirm action", "capabilities": ["press"],
      "expected": ["Alert", "Button"],
      "outOfTask": ["Form", "Field", "TextField", "Dialog", "Select"] },
    { "id": "notice", "task": "A dismissible notice", "capabilities": ["dismiss"],
      "expected": ["Alert", "Button"],
      "outOfTask": ["Form", "Field", "TextField", "Toast", "Dialog"] },
    { "id": "text-entry", "task": "A single text entry", "capabilities": ["input"],
      "expected": ["Alert", "TextField"],
      "outOfTask": ["Form", "Button", "Field", "Textarea", "Select"] }
  ]
}
```

Closure check against the authored nesting:
- Form's children are Alert, Button and Field; Field's child is TextField; Alert's child is Button.
- No entry lists Button or TextField as a parent.
- Alert's capability `dismiss` pulls in its child Button.
- `input` matches TextField only, plus its fallback target Alert. A fallback target's nesting is not expanded, so Button is not added.

- [ ] **Step 4: Write the failing tests.** Create `packages/registry/tests/filter.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { catalogFor, filter, fullCatalog, registry, restrict } from "@atlas/registry/lib"
import evalSet from "./eval-tasks.json"

const tasks = evalSet.tasks
const requests = tasks.map((t) => ({ t, catalog: catalogFor({ task: t.task, capabilities: t.capabilities }) }))

describe("registry/filter >", () => {
  it("every request carries a filtered catalog", () => {
    for (const { t, catalog } of requests) {
      expect(catalog.types, t.id).toEqual(t.expected)
      expect(catalog.types.length, t.id).toBeGreaterThan(0)
      for (const type of catalog.types) expect(Object.hasOwn(registry.entries, type), `${t.id}: ${type}`).toBe(true)
    }
  })
  it("no request exposes the full catalog", () => {
    const full = fullCatalog()
    for (const { t, catalog } of requests) {
      expect(catalog.types.length, t.id).toBeLessThan(full.length)
      expect(full.every((n) => catalog.types.includes(n)), t.id).toBe(false)
    }
  })
  it("catalog excludes out-of-task types", () => {
    for (const { t, catalog } of requests) for (const n of t.outOfTask) expect(catalog.types, `${t.id}: ${n}`).not.toContain(n)
  })
})

describe("registry/fullCatalog >", () => {
  it("is every registered type plus every unaliased component (48 today)", () => {
    const full = fullCatalog()
    expect(full).toEqual([...full].sort())
    for (const type of Object.keys(registry.entries)) expect(full).toContain(type)
    expect(full).not.toContain("Input")
    expect(full).toContain("Dialog")
    expect(full.length).toBe(48)
  })
})

describe("registry/restrict >", () => {
  it("keeps only the catalog's entries and schemas and withholds every other agent-visible name", () => {
    const r = restrict(registry, catalogFor({ task: "confirm", capabilities: ["press"] }))
    expect(Object.keys(r.entries)).toEqual(["Alert", "Button"])
    expect(Object.keys(r.schemas).sort()).toEqual(["Alert", "Button"])
    expect(r.withheld).toContain("Form")
    expect(r.withheld).toContain("Dialog")
    expect(r.withheld).not.toContain("Button")
    expect(registry.entries).toHaveProperty("Form")
  })
  it("an unknown capability gets an empty catalog, never the full one", () => {
    expect(filter(["chart"])).toEqual([])
    expect(Object.keys(restrict(registry, catalogFor({ task: "x", capabilities: ["chart"] })).entries)).toEqual([])
  })
})
```

In `registry.test.ts`, change the press test to:

```ts
  it("a press request gets Button and its fallback target", () => expect(filter(["press"])).toEqual(["Alert", "Button"]))
```

Run `npx vitest run packages/registry`. Expected: FAIL, because `catalogFor`, `fullCatalog` and `restrict` are not exported.

- [ ] **Step 5: Implement `filter.ts`.**

```ts
// Phase 6: the catalog an agent request carries, built outside the agent. filter() is the prompt optimisation;
// restrict() is the guarantee: the runtime validates against the restricted registry, so a type outside the
// catalog falls back however the agent spells it.
import { registry, type Registry } from "./registry"

export type CatalogRequest = { task: string; capabilities: string[] }
export type Catalog = { task: string; capabilities: string[]; types: string[] }

/** Registered types for a request: capability matches, what they may nest (either side declaring), and their fallback targets (D-B). */
export function filter(capabilities: string[], r: Registry = registry): string[] {
  const out = new Set<string>()
  const all = Object.values(r.entries)
  const visit = (type: string) => {
    if (out.has(type) || !Object.hasOwn(r.entries, type)) return
    out.add(type)
    for (const child of r.entries[type].nesting?.children ?? []) visit(child)
    for (const e of all) if ((e.nesting?.parents ?? []).includes(type)) visit(e.type)
  }
  for (const e of all) if ((e.capabilities ?? []).some((c) => capabilities.includes(c))) visit(e.type)
  for (const type of [...out]) {
    const target = r.entries[type].fallback?.type
    if (target && Object.hasOwn(r.entries, target)) out.add(target)
  }
  return [...out].sort()
}

/** Every agent-visible name: registered types, plus each Atlas component no entry aliases (D-A). */
export function fullCatalog(r: Registry = registry): string[] {
  const aliased = new Set(Object.values(r.entries).map((e) => e.aliasOf).filter((a): a is string => !!a))
  return [...new Set([...Object.keys(r.entries), ...r.components.filter((c) => !aliased.has(c))])].sort()
}

export function catalogFor(req: CatalogRequest, r: Registry = registry): Catalog {
  return { task: req.task, capabilities: [...req.capabilities].sort(), types: filter(req.capabilities, r) }
}

/** The registry a session validates against: the catalog's entries only; every other agent-visible name is withheld. */
export function restrict(r: Registry, catalog: Catalog): Registry {
  const keep = new Set(catalog.types)
  const pick = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).filter(([k]) => keep.has(k)))
  return {
    ...r,
    entries: pick(r.entries),
    schemas: pick(r.schemas),
    aliases: pick(r.aliases),
    withheld: fullCatalog(r).filter((n) => !keep.has(n)),
  }
}
```

The parents-direction walk changes no closure in the eval set, because TextField is already reached through Field. It is there because the validator accepts a pair when either side declares it (DEC-084 (1)), so the filter has to see the same pairs.

- [ ] **Step 6: Run the tests.** Run `npx vitest run packages/registry`. Expected: PASS, including the existing `resolve` and `without` tests. Then run `npx tsc --noEmit`: expect no errors (`without` spreads `...r`, so `components` is carried).

- [ ] **Step 7: Commit.**

```bash
git add scripts/lib/registry.mjs scripts/registry-build.mjs packages/registry
git commit -m "feat(registry): Phase 6 catalog — filter.ts, fullCatalog, catalogFor, restrict"
```

---

### Task 3: The validator rejects out-of-catalog types independently

**Files:**
- Modify: `packages/runtime/src/protocol.ts`, `packages/runtime/src/validate.ts:32-35`
- Test: `packages/runtime/tests/validate.test.ts`

**Interfaces:**
- Consumes: `restrict`, `catalogFor`, `Registry.withheld` (Task 2)
- Produces: `IssueCode` gains `"out-of-catalog"`

- [ ] **Step 1: Write the failing test.** Append to `validate.test.ts`, matching its imports (add `catalogFor` and `restrict` from `@atlas/registry/lib`):

```ts
describe("runtime/validator > catalog", () => {
  const confirm = restrict(registry, catalogFor({ task: "confirm", capabilities: ["press"] }))
  it("rejects a registered type outside the catalog even when the agent emits it", () => {
    const { node, issues } = validateTree({ type: "Form", slots: { children: [] } }, confirm)
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog", path: "" }))
    expect(node).toMatchObject({ type: "Alert", fallback: true })
  })
  it("reports a withheld unregistered component as out-of-catalog too", () => {
    const { issues } = validateTree({ type: "Dialog" }, confirm)
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
  it("still reports a name nobody knows as unknown-type", () => {
    const { issues } = validateTree({ type: "Hologram" }, confirm)
    expect(issues).toContainEqual(expect.objectContaining({ code: "unknown-type" }))
  })
  it("accepts the catalog's own types", () => {
    const { node, issues } = validateTree({ type: "Button", props: {}, slots: { children: ["OK"] } }, confirm)
    expect(issues.filter((i) => i.code === "out-of-catalog" || i.code === "unknown-type")).toEqual([])
    expect(node).toMatchObject({ type: "Button" })
  })
})
```

If Button's authored `protocolProps` requires a prop, add it to the last payload. Read `packages/registry/src/Button.registry.json` before running.

Run `npx vitest run packages/runtime/tests/validate.test.ts`. Expected: FAIL. The first two tests see `unknown-type`, and the type check fails because `"out-of-catalog"` is not an `IssueCode`.

- [ ] **Step 2: Implement.** In `protocol.ts`, add `| "out-of-catalog"` to `IssueCode` after `"unknown-type"`. In `validate.ts`, replace the unknown-type branch:

```ts
  if (!Object.hasOwn(r.entries, type)) {
    // Phase 6: a withheld name is real but outside this session's catalog; both fall back the same way.
    const withheld = r.withheld?.includes(type) ?? false
    issues.push({ path, code: withheld ? "out-of-catalog" : "unknown-type", detail: withheld ? `${type} is outside this request's catalog` : `${type} is not a registered type` })
    return fallbackFor(null, r, path)
  }
```

Also update the header comment's first sentence to read: "Unknown, out-of-catalog or malformed → fallback;".

- [ ] **Step 3: Run.** Run `npx vitest run packages/runtime`. Expected: PASS, including the fuzz suite (an unrestricted registry has no `withheld`, so existing behaviour is identical).

- [ ] **Step 4: Commit.**

```bash
git add packages/runtime/src/protocol.ts packages/runtime/src/validate.ts packages/runtime/tests/validate.test.ts
git commit -m "feat(runtime): out-of-catalog issue — the validator rejects types outside the session catalog"
```

---

### Task 4: Sessions — the only way to build an agent request

**Files:**
- Create: `packages/runtime/src/session.ts`, `packages/runtime/tests/session.test.ts`
- Modify: `packages/runtime/src/protocol.ts`, `packages/runtime/src/stub-agent.ts`, and every test that calls `createStubAgent` (find them with `graft grep "createStubAgent"`)

**Interfaces:**
- Consumes: `catalogFor`, `restrict`, `Catalog`, `CatalogRequest`, `Registry` (Task 2)
- Produces:
  - `type AgentRequest = { task: string; catalog: { types: string[]; prompt: string } }` (in `protocol.ts`)
  - `openSession(req: CatalogRequest, r?: Registry): { request: AgentRequest; registry: Registry }`
  - `catalogPrompt(r: Registry): string`
  - `createStubAgent(fixture: Fixture, request: AgentRequest, delayMs?: number): StubAgent`, with `StubAgent` gaining `request: AgentRequest`

- [ ] **Step 1: Write the failing test.** Create `packages/runtime/tests/session.test.ts`:

```tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { fullCatalog, registry } from "@atlas/registry/lib"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { catalogPrompt, openSession } from "@atlas/runtime/session"
import type { Issue, ServerOp, Transport } from "@atlas/runtime/protocol"

describe("runtime/session >", () => {
  it("the request and the runtime registry come from one catalog", () => {
    const s = openSession({ task: "A single confirm action", capabilities: ["press"] })
    expect(s.request.catalog.types).toEqual(["Alert", "Button"])
    expect(Object.keys(s.registry.entries)).toEqual(s.request.catalog.types)
  })
  it("the prompt names only catalog types", () => {
    const { request } = openSession({ task: "A single confirm action", capabilities: ["press"] })
    for (const n of fullCatalog()) {
      const named = request.catalog.prompt.includes(`"type":"${n}"`)
      expect(named, n).toBe(request.catalog.types.includes(n))
    }
  })
  it("the prompt is deterministic and smaller than the full registry's", () => {
    const a = openSession({ task: "t", capabilities: ["press"] }).request.catalog.prompt
    expect(openSession({ task: "t", capabilities: ["press"] }).request.catalog.prompt).toBe(a)
    expect(a.length).toBeLessThan(catalogPrompt(registry).length)
  })
  it("an agent cannot widen its catalog: an emitted out-of-catalog type renders the fallback", () => {
    const s = openSession({ task: "A single confirm action", capabilities: ["press"] })
    const issues: Issue[] = []
    const root = { type: "Form", slots: { children: [{ type: "Button", slots: { children: ["Go"] } }] } }
    const initial: ServerOp = { op: "render", seq: 1, root }
    const transport: Transport = { send: () => {}, subscribe: () => () => {} }
    render(<AtlasRuntime registry={s.registry} transport={transport} initial={initial} onIssues={(i) => issues.push(...i)} />)
    expect(document.querySelector('[data-atlas-type="Form"]')).toBeNull()
    expect(document.querySelector('[data-atlas-type="Alert"]')).not.toBeNull()
    expect(screen.getByText("This content is unavailable")).toBeTruthy()
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
})
```

Before running:
- Check how `render.test.tsx` imports `render`, and match it.
- If the fallback message string differs, copy it from Alert's `fallback.message` in `packages/registry/src/Alert.registry.json`.

Run `npx vitest run packages/runtime/tests/session.test.ts`. Expected: FAIL, because `@atlas/runtime/session` does not exist.

- [ ] **Step 2: Add the type.** In `protocol.ts`, after `Transport`:

```ts
/** What an agent receives (Phase 6): the task and its filtered catalog. Built only by openSession; no server op carries one. */
export type AgentRequest = { task: string; catalog: { types: string[]; prompt: string } }
```

- [ ] **Step 3: Implement `session.ts`.**

```ts
// Phase 6: a session pairs what the agent sees with what the runtime accepts. Both come from one catalog, built
// here and never from agent output, so the validator's registry is fixed before the agent says anything.
import { catalogFor, registry as fullRegistry, restrict, type CatalogRequest, type Registry } from "@atlas/registry/lib"
import type { AgentRequest } from "./protocol"

/** The catalog as the agent reads it: one JSON line per type, protocol fields only, sorted. */
export function catalogPrompt(r: Registry): string {
  return Object.keys(r.entries).sort().map((type) => {
    const e = r.entries[type]
    return JSON.stringify({ type, props: e.protocolProps ?? {}, slots: e.slots ?? [], nesting: e.nesting ?? {}, events: Object.keys(e.events ?? {}) })
  }).join("\n")
}

export function openSession(req: CatalogRequest, r: Registry = fullRegistry): { request: AgentRequest; registry: Registry } {
  const catalog = catalogFor(req, r)
  const registry = restrict(r, catalog)
  return { request: { task: catalog.task, catalog: { types: catalog.types, prompt: catalogPrompt(registry) } }, registry }
}
```

Check the `@atlas/runtime/*` path alias in `tsconfig.json` (`Runtime`, `stub-agent` and `protocol` resolve through it already), so `@atlas/runtime/session` needs no config change. Check also that `packages/runtime/package.json` `exports`, if present, lists subpaths. If it does, add `./session`.

- [ ] **Step 4: The stub agent takes the request.** In `stub-agent.ts`:

```ts
import type { AgentRequest, ClientEvent, Fixture, ServerOp, Transport } from "./protocol"
// …
export type StubAgent = Transport & { request: AgentRequest; log: Array<ClientEvent | ServerOp>; inject(op: UnsequencedOp): void }
// …
export function createStubAgent(fixture: Fixture, request: AgentRequest, delayMs = 0): StubAgent {
  // …unchanged…
  return {
    request,
    log,
    // …unchanged…
```

Update the header comment's first line: "The M4 stand-in for an agent, given its Phase 6 request: it answers submits from fixture ops and never calls a model."

Then update every existing `createStubAgent(fixture …)` call in `packages/runtime/tests/*` to `createStubAgent(fixture, openSession({ task: "Request access form", capabilities: ["submit"] }).request …)`, keeping any `delayMs` argument in third position.

- [ ] **Step 5: Run.** Run `npx vitest run packages/registry packages/runtime && npx tsc --noEmit`. Expected: all pass, no type errors. `npm run test:metrics` is report-only, and its exit 1 is expected while the size metric reads failing (atlas-runtime skill).

- [ ] **Step 6: Commit.**

```bash
git add packages/runtime
git commit -m "feat(runtime): openSession — the agent request and the runtime registry share one catalog"
```

---

### Task 5: The runtime demo runs inside a session

**Files:**
- Modify: `app/runtime-demo/RuntimeDemo.tsx`, `tests/runtime/runtime-demo.spec.ts`

**Interfaces:**
- Consumes: `openSession` (Task 4), `createStubAgent(fixture, request)` (Task 4)
- Produces: `window.__atlasRuntime.request: AgentRequest`; `types` now lists the session's registry

- [ ] **Step 1: Write the failing Playwright tests.** Read `tests/runtime/runtime-demo.spec.ts` first and reuse its `goto`/`beforeEach` and its existing `inject` helper pattern. Add:

```ts
test("runtime-demo > the agent request carries the filtered catalog", async ({ page }) => {
  await page.goto("/runtime-demo")
  const req = await page.evaluate(() => window.__atlasRuntime!.request)
  expect(req.catalog.types).toEqual(["Alert", "Button", "Field", "Form", "TextField"])
  expect(req.catalog.prompt).not.toContain('"type":"Dialog"')
})

test("runtime-demo > an out-of-catalog type falls back", async ({ page }) => {
  await page.goto("/runtime-demo")
  await page.evaluate(() => window.__atlasRuntime!.inject({ op: "patch", at: "/slots/children/0", node: { type: "Dialog" } }))
  await expect(page.locator('[data-atlas-path="/slots/children/0"][data-atlas-type="Alert"]')).toBeVisible()
  await expect(page.locator('[data-atlas-type="Dialog"]')).toHaveCount(0)
})
```

The patch pointer must address an existing node in `packages/runtime/tests/fixtures/request-access.json`. Copy the pointer used by an existing patch test in the spec rather than inventing one. Add `request: AgentRequest` to the `Window` declaration first so the spec type-checks.

Run `npm run test:runtime -- -g "catalog"`. Expected: FAIL, because `request` is undefined.

- [ ] **Step 2: Implement.** In `RuntimeDemo.tsx`:

```tsx
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { openSession } from "@atlas/runtime/session"
import { createStubAgent, type StubAgent } from "@atlas/runtime/stub-agent"
import type { AgentRequest, Fixture } from "@atlas/runtime/protocol"
// …
declare global {
  interface Window {
    __atlasRuntime?: { types: string[]; request: AgentRequest; log(): unknown[]; nodeCount(): number; renders: string[]; inject: StubAgent["inject"] }
  }
}

export function RuntimeDemo() {
  // Phase 6: the agent sees only this session's catalog; the runtime validates against the same subset.
  const session = React.useMemo(() => openSession({ task: "Request access form", capabilities: ["submit"] }), [])
  const agent = React.useMemo(() => createStubAgent(fixture as Fixture, session.request), [session])
  // …
      types: Object.keys(session.registry.entries),
      request: session.request,
  // …
      <AtlasRuntime registry={session.registry} transport={agent} initial={(fixture as Fixture).render} onRender={onRender} />
```

Remove the now-unused `registry` import. Update the header comment: "…through packages/registry and packages/runtime, inside a Phase 6 session (filtered catalog)."

- [ ] **Step 3: Run.** Run `npm run test:runtime`. Expected: all runtime-demo tests pass, old and new; the tree is unchanged because the submit closure is all 5 types. Then run `npm run test:visual`. Expected: zero changed baselines (Kind A).

- [ ] **Step 4: Commit.**

```bash
git add app/runtime-demo tests/runtime
git commit -m "feat(runtime-demo): run the Request access form inside a filtered-catalog session"
```

---

### Task 6: Manifest, metric region, records and verification

**Files:**
- Modify: `metrics.manifest.json`, `docs/ATLAS-DELIVERY-ROADMAP.md` (Phase 6 section + generated region), `docs/HANDOFF-next-session.md`, `claude.md`, `atlas/state/decisions.json`

- [ ] **Step 1: Manifest (A1).** For the three vitest Context Containment rows:
  - Rename the second row's `check` to `registry/filter > no request exposes the full catalog`.
  - Add to each row: `"why": "Phase 6 (DEC-092): 5 of 48 agent-visible names are registered, and a catalog can only hold registered types; the full catalog counts the 43 unregistered components too, so this row is not evidence that filtering removed them."`
  - Leave `milestone` as "Phase 6".
  - Check that `scripts/metrics-report.mjs` derives row text from the manifest only (no hard-coded check string) with `graft grep "no request exposes"`. If a test or fixture under `scripts/` carries the old string, update it too.
- [ ] **Step 2: Decision record.** Append to `atlas/state/decisions.json` (same shape as DEC-091):

```json
{ "id": "DEC-092", "topic": "Phase 6: the full catalog, and fallback targets in every catalog", "decision": "Owner-chosen 2026-10-25: (D-A) the full catalog is every agent-visible name: registered types plus each Atlas component with facts that no entry aliases (48 today); a request's catalog must be strictly smaller. (D-B) filter() adds each included type's fallback target (not expanding its nesting), so the set the agent sees is the set the validator accepts. The validator reports a withheld name as out-of-catalog and falls back as for unknown-type." }
```

Write the actual chosen options if they differ from A1/B1. Then run `npm run atlas:sync` (state stamps only, no `--pull`).
- [ ] **Step 3: Full verification, in house order.**

```bash
npm run tokens:build && git diff --exit-code packages/tokens   # no token change
npm run token-lint
npx tsc --noEmit
npx vitest run
npm run lint
npm run test:scripts
npm run registry:check
npm run atlas:verify -- --scope "packages/registry/**,packages/runtime/**,app/runtime-demo/**,tests/runtime/**,scripts/lib/registry.mjs,scripts/registry-build.mjs,metrics.manifest.json"
npm run test:runtime
npm run test:visual                                            # zero changed baselines
```

Expected: every command exits 0, `test:visual` reports no changed snapshots, and `atlas:verify` reports its checks passing in scope. Fix any failure and re-run from the failing step. If `npm run lint` is not the ESLint script name, use the one in `package.json`.
- [ ] **Step 4: Docs.**
  - Roadmap Phase 6 section: add "PR-0 ✅ (date, PR #)", with a short "what landed" list as M5 stages do.
  - Handoff: "Start here" for session 26 = PR-1 planning, which needs D-C first; progress row Phase 6 at 1 of 2.5; latest ids DEC-092.
  - `claude.md` Status line: Phase 6 PR-0 done.
- [ ] **Step 5: Commit, then ask the owner before opening the PR.**

```bash
git add -A
git commit -m "feat(atlas): Phase 6 PR-0 — filtered agent catalog enforced by the validator (DEC-092)"
```

After the owner approves: open the PR, turn on Auto-fix and auto-merge, and refresh the metric region from the PR's own CI artifact before the required checks finish:

```bash
gh run download <run> -n metrics -D <scratch>
node scripts/metrics-report.mjs --results <scratch>/metrics-input
```

Expected region: **27 passing · 3 failing · 6 not measurable** of 36. The three Phase 6 vitest rows move to passing, and `protocol.promptReduction` and `protocol.firstOpP95` stay not measurable until PR-1.

---

## Self-review

- **Spec coverage:**
  - "Agent receives a catalog subset": Tasks 2 and 4 (`openSession`, `request.catalog`).
  - "Validator independently rejects any type outside the subset": Task 3 (validator), Task 4 (render test with an agent-emitted Form), Task 5 (Playwright inject).
  - "100% of requests use a filtered catalog": the `openSession`-only constructor, the required `request` argument to `createStubAgent`, and metric test 1.
  - "0 expose the full 47": metric test 2, under A1.
  - "Irrelevant components exposed: 0 in evaluation tests": metric test 3 over `eval-tasks.json`.
  - Model-dependent rows (streaming <250 ms p95, ≥50% prompt reduction, agent compliance) are deliberately deferred to PR-1 behind D-C. `catalogPrompt` lands now, so PR-1 measures reduction against `catalogPrompt` of the full catalog.
- **Deviations, with reasons:**
  - `filter.ts` sits in `packages/registry/lib/`, not the registry root, because `@atlas/registry/lib` is the existing import path.
  - The registry value moves to `lib/registry.ts` to avoid an `index.ts` ↔ `filter.ts` import cycle.
  - One manifest check is renamed (A1), because "every registered type" is unsatisfiable with 5 registered types.
- **Placeholder scan:** the only deferred items are D-C and the PR-1 plan, stated as such. `<run>` and `<scratch>` in Task 6 are runtime values.
- **Name consistency:** `filter`, `fullCatalog`, `catalogFor`, `restrict`, `Catalog`, `CatalogRequest`, `Registry.components`, `Registry.withheld`, `openSession`, `catalogPrompt`, `AgentRequest` and `"out-of-catalog"` are used identically in Tasks 2–6.
- **Named open risk:** with 5 registered types, the submit catalog equals the whole runtime registry, so for the M4 task filtering protects only against the 43 unregistered names. The guarantee is exercised for real only by the press, dismiss and input sessions. It becomes meaningful for forms once more types are registered, which is registry-lane work and an owner decision per entry, not Phase 6.
