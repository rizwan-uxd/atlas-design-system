# Phase 6 PR-1 — Model agent and protocol bench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A model-backed agent receives only `openSession().request` and streams protocol ops. A `protocol` bench type measures the two remaining Phase 6 rows: `protocol.promptReduction` (≥50%) and `protocol.firstOpP95` (<250 ms p95).

**Architecture:**
- **`packages/runtime/src/op-stream.ts`:** a pure incremental JSONL parser. Text chunks go in; whole unsequenced ops come out.
- **`packages/runtime/src/agent-prompt.ts`:** `agentSystemPrompt(request)` builds the system prompt from the grammar (static) plus the request's catalog prompt. It is deterministic, so the prefix caches.
- **`packages/runtime/src/model-agent.ts`:** `createModelAgent(request, textStream)`, a `Transport` that stamps `seq` on parsed ops. `textStream` is injected, so `packages/runtime` never imports the SDK and the Next bundle stays SDK-free.
- **`benchmarks/protocol/`:**
  - the SDK binding (`anthropic-stream.ts`)
  - the full-catalog baseline prompt (`full-catalog.ts`, which reads the generated facts)
  - the bench itself (`protocol.bench.ts`), run through `vitest.protocol.config.ts`
- **`benchmarks/run.sh`** gains a `protocol` type that runs that vitest config under the bench ledger. It does not copy a workspace or call `claude -p`.
- **Results:** `bench.json` lands in `benchmarks/results/<label>/P1/`. With D-D, the latest one is copied into CI's `.metrics/`, so the region shows the recorded reading.

**Tech Stack:** TypeScript · `@anthropic-ai/sdk` 1.3.0 (new devDependency) · vitest · `benchmarks/run.sh` + `benchmarks/phase-9/budget.mjs` · `scripts/metrics-report.mjs`.

## Global Constraints

- **D-C (owner, 2026-10-25):** the Anthropic API with streaming; model pinned to `claude-sonnet-5-5`; spend cap **$3 per batch**.
- **Roadmap Phase 6:** model-dependent metrics are Tier 3, bench-only and never a hard gate (Phase 7 makes them trend gates). The bench runs locally on demand and never in CI.
- **The agent sees only the request.** `createModelAgent` takes an `AgentRequest` and nothing else from the registry. The runtime still validates against `session.registry`. The validator remains the guarantee.
- **No SDK in `packages/runtime` or `app/`.** The SDK is imported only under `benchmarks/protocol/`. `atlas:verify` scope and `tsc` cover both.
- **Request shape (claude-api skill, Sonnet 5.5):**
  - `client.beta.messages.stream` with `thinking: { type: "between_tools" }`. This is thinking off, accepted only at effort ≤ high and with no other thinking field. Thinking would sit before the first text and is not needed to emit ops.
  - `output_config: { effort: "low" }`, `max_tokens: 4096`.
  - System prompt as one text block with `cache_control: { type: "ephemeral" }`.
  - Server-side refusal fallback on by default (`betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"`). A rep served by a fallback model is a different model, so it is **excluded** from the measurement and counted in `excluded`. Check `stop_reason` before reading content.
  - No `temperature`/`top_p`/`top_k`, which 400 from 2026-10-21.
- **Credentials:** the SDK resolves `ANTHROPIC_API_KEY` or an `ant auth login` profile. The owner provides them; the agent never enters a key. No live call happens without the owner's go-ahead in chat (the spend in Task 7).
- **Honest readings:** neither metric is tuned to pass.
  - `firstOpP95` is measured from the request being sent, so it includes time to first token. Expect it to read **failing**: hosted time to first token alone is typically above 250 ms.
  - `promptReduction` compares against the A1 full catalog (48 names), so most of the reduction comes from 43 unregistered components. Its `why` says so (DEC-092).
- **Validator contract unchanged; no registry declarative fields; no component, token or Figma change.**
- **Metric region:** refresh from the PR's own CI artifact before auto-merge (handoff "Start here" 5).

## Decisions for the owner (gate 1: approved 2026-10-25, D1 + E1)

**D-D. How does a bench reading reach the CI-derived region?** CI never runs the bench, so without a path the two rows stay not measurable forever.
- **D1 (chosen 2026-10-25):** commit the latest batch's `bench.json` as `benchmarks/results/protocol-latest/bench.json`. CI's metrics job copies it into `.metrics/`. Each row's `why` names the label, date and model of the recorded run. A new reading lands only by committing a new batch.
- **D2:** keep bench readings out of the region. The two rows read not measurable, and readings live only in `benchmarks/results/`.

**D-E. Add an agent-compliance row?** The roadmap pairs the vitest CSS/HTML/JSX row (the validator's enforcement) with a bench row (the agent's own compliance), but the manifest has no bench row for it.
- **E1 (chosen 2026-10-25):** add `{ principle: "Catalog Over Code", metric: "Agent outputs containing CSS, HTML, JSX, or markup (agent compliance)", target: "0", source: "bench", check: "protocol.agentCompliance", milestone: "Phase 6" }`. It passes when no streamed op carries a `markup` issue. The region becomes 37 rows.
- **E2:** no new row. The bench records markup counts as a diagnostic only.

**Owner answer (2026-10-25):** D1 (commit the latest `bench.json`; CI copies it into `.metrics/`) and E1 (add the agent-compliance bench row). The tasks are written for **D1 + E1**:
- Under D2, drop Task 6 Step 2 and the `why` edits.
- Under E2, drop the manifest row and keep the `agentCompliance` key out of `bench.json`.

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `packages/runtime/src/store.ts` | modify | `out-of-catalog` joins `FALLBACK_CODES` (PR-0 gap: the fallback latency mark missed it) |
| `packages/runtime/src/op-stream.ts` | create | incremental JSONL op parser |
| `packages/runtime/src/agent-prompt.ts` | create | `PROTOCOL_GRAMMAR`, `agentSystemPrompt(request)` |
| `packages/runtime/src/model-agent.ts` | create | `createModelAgent(request, textStream)`: a Transport over a text stream |
| `packages/runtime/tests/op-stream.test.ts`, `agent-prompt.test.ts`, `model-agent.test.ts`, `store.test.ts` | create / modify | unit tests with a fake stream, no network |
| `benchmarks/protocol/anthropic-stream.ts` | create | `anthropicTextStream(client, model)`: SDK binding, usage, fallback detection |
| `benchmarks/protocol/full-catalog.ts` | create | `fullCatalogPrompt()`: the A1 baseline from registry entries plus facts |
| `benchmarks/protocol/protocol.bench.ts` | create | the bench: count_tokens arms, streamed reps, `bench.json` |
| `benchmarks/protocol/stats.ts` + `stats.test.ts` | create | `p95`, `reduction`, `summarise` (pure, unit-tested) |
| `vitest.protocol.config.ts` | create | runs only `benchmarks/protocol/*.bench.ts`, node env |
| `benchmarks/tasks/P1/meta.json`, `prompt.md` | create | `type: "protocol"`; the task set is `packages/registry/tests/eval-tasks.json` |
| `benchmarks/run.sh` | modify | `protocol` branch: budget pre, vitest config, budget post |
| `benchmarks/phase-9/budget.mjs` | modify | `BENCH_FLOOR` env (the protocol batch ceiling is cents, not $1.50) |
| `package.json` | modify | devDependency `@anthropic-ai/sdk@1.3.0`; script `bench:protocol` |
| `.github/workflows/ci.yml` | modify (D1) | copy `benchmarks/results/protocol-latest/bench.json` into `.metrics/` |
| `metrics.manifest.json` | modify | `why` on the two bench rows; E1 row |
| `benchmarks/results/<label>/P1/*`, `benchmarks/results/protocol-latest/bench.json` | create | the recorded batch |
| docs: roadmap Phase 6, handoff, `claude.md`, `atlas/state/decisions.json` (DEC-093) | modify | records |

---

### Task 1: Owner approval (gate 1)

- [x] **Step 1:** The owner answers D-D and D-E and approves. Done 2026-10-25: D1 + E1, recorded under "Decisions for the owner".
- [x] **Step 2:** Commit the plan on `claude/session-26-phase6-pr1`.

---

### Task 2: Fallback latency covers out-of-catalog (PR-0 gap)

**Files:** Modify `packages/runtime/src/store.ts:22`; Test `packages/runtime/tests/store.test.ts`

- [ ] **Step 1: Failing test.** Append to `store.test.ts`, matching its imports (add `catalogFor` and `restrict` from `@atlas/registry/lib` if absent):

```ts
describe("runtime/store > catalog", () => {
  it("an out-of-catalog render records the fallback seq", () => {
    const r = restrict(registry, catalogFor({ task: "confirm", capabilities: ["press"] }))
    const s = reduce(r)(initialState, { kind: "server", op: { op: "render", seq: 1, root: { type: "Form" } } })
    expect(s.fallbackSeq).toBe(1)
  })
})
```

Run `npx vitest run packages/runtime/tests/store.test.ts`. Expected: FAIL, because `fallbackSeq` is `null`.
- [ ] **Step 2: Fix.** `const FALLBACK_CODES = new Set(["malformed", "unknown-type", "out-of-catalog", "missing-required"])`
- [ ] **Step 3:** Run `npx vitest run packages/runtime`. Expected: PASS.

```bash
git add packages/runtime/src/store.ts packages/runtime/tests/store.test.ts
git commit -m "fix(runtime): out-of-catalog fallbacks drive the fallback latency mark"
```

---

### Task 3: Incremental op parser (`op-stream.ts`)

**Interfaces — Produces:**
- `type OpParser = { push(chunk: string): UnsequencedOp[]; end(): UnsequencedOp[]; rejected: string[] }`
- `createOpParser(): OpParser`
- `UnsequencedOp` is imported from `./stub-agent`.

- [ ] **Step 1: Failing tests.** `packages/runtime/tests/op-stream.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { createOpParser } from "@atlas/runtime/op-stream"

describe("runtime/op-stream >", () => {
  it("emits an op only once its line is complete, across arbitrary chunk boundaries", () => {
    const p = createOpParser()
    expect(p.push('{"op":"render","root":{"type":"Fo')).toEqual([])
    expect(p.push('rm","slots":{"children":[]}}}\n{"op":"patch","at":"/slots/children/0",')).toEqual([
      { op: "render", root: { type: "Form", slots: { children: [] } } },
    ])
    expect(p.push('"node":{"type":"Button","slots":{"children":["Go"]}}}\n')).toEqual([
      { op: "patch", at: "/slots/children/0", node: { type: "Button", slots: { children: ["Go"] } } },
    ])
  })
  it("flushes a final line without a newline on end()", () => {
    const p = createOpParser()
    p.push('{"op":"render","root":{"type":"Alert"}}')
    expect(p.end()).toEqual([{ op: "render", root: { type: "Alert" } }])
  })
  it("ignores blank lines and code fences, and records lines that are not ops", () => {
    const p = createOpParser()
    expect(p.push('```jsonl\n\n<div style="color:red">hi</div>\n{"op":"nope"}\n{"op":"ack","ack":1}\n```\n')).toEqual([])
    expect(p.rejected).toEqual(['<div style="color:red">hi</div>', '{"op":"nope"}', '{"op":"ack","ack":1}'])
  })
})
```

The agent may emit only `render` and `patch`. `ack` and `state` belong to the server's reply path, so an agent-sent one is rejected. Run it and expect FAIL (module missing).
- [ ] **Step 2: Implement.**

```ts
// Phase 6 PR-1: the agent streams one protocol op per line (JSONL). Ops are emitted as soon as their line is
// whole; anything that is not a render or patch op is recorded and dropped. The validator still checks every node.
import type { UnsequencedOp } from "./stub-agent"

export type OpParser = { push(chunk: string): UnsequencedOp[]; end(): UnsequencedOp[]; rejected: string[] }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function toOp(line: string): UnsequencedOp | null {
  let v: unknown
  try { v = JSON.parse(line) } catch { return null }
  if (!isObject(v)) return null
  if (v.op === "render" && isObject(v.root)) return { op: "render", root: v.root as never }
  if (v.op === "patch" && typeof v.at === "string" && (v.node === null || isObject(v.node))) return { op: "patch", at: v.at, node: v.node as never }
  return null
}

export function createOpParser(): OpParser {
  let buffer = ""
  const rejected: string[] = []
  const take = (line: string, out: UnsequencedOp[]) => {
    const t = line.trim()
    if (!t || t.startsWith("```")) return
    const op = toOp(t)
    if (op) out.push(op)
    else rejected.push(t)
  }
  return {
    rejected,
    push(chunk) {
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      const out: UnsequencedOp[] = []
      for (const l of lines) take(l, out)
      return out
    },
    end() { const out: UnsequencedOp[] = []; take(buffer, out); buffer = ""; return out },
  }
}
```

- [ ] **Step 3:** Run `npx vitest run packages/runtime/tests/op-stream.test.ts`. Expected: PASS.

```bash
git add packages/runtime/src/op-stream.ts packages/runtime/tests/op-stream.test.ts
git commit -m "feat(runtime): incremental JSONL op parser for streamed agent output"
```

---

### Task 4: Agent system prompt and model agent

**Interfaces:**
- Consumes: `AgentRequest` (PR-0), `createOpParser` (Task 3), `UnsequencedOp`.
- Produces:
  - `PROTOCOL_GRAMMAR: string`
  - `agentSystemPrompt(request: AgentRequest): string`
  - `type TextStream = (system: string, task: string) => AsyncIterable<string>`
  - `type ModelAgent = Transport & { request: AgentRequest; log: Array<ClientEvent | ServerOp>; rejected: string[]; done: Promise<void>; start(): void }`
  - `createModelAgent(request: AgentRequest, textStream: TextStream): ModelAgent`

- [ ] **Step 1: Failing tests.** `packages/runtime/tests/agent-prompt.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { fullCatalog } from "@atlas/registry/lib"
import { agentSystemPrompt, PROTOCOL_GRAMMAR } from "@atlas/runtime/agent-prompt"
import { openSession } from "@atlas/runtime/session"

describe("runtime/agent-prompt >", () => {
  const { request } = openSession({ task: "A single confirm action", capabilities: ["press"] })
  it("is the grammar, then the request's catalog, byte-stable", () => {
    const p = agentSystemPrompt(request)
    expect(p.startsWith(PROTOCOL_GRAMMAR)).toBe(true)
    expect(p.endsWith(request.catalog.prompt)).toBe(true)
    expect(agentSystemPrompt(request)).toBe(p)
  })
  it("names no withheld type", () => {
    const p = agentSystemPrompt(request)
    for (const n of fullCatalog().filter((n) => !request.catalog.types.includes(n))) expect(p).not.toContain(`"type":"${n}"`)
  })
})
```

`packages/runtime/tests/model-agent.test.tsx`:

```tsx
import * as React from "react"
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { agentSystemPrompt } from "@atlas/runtime/agent-prompt"
import { createModelAgent } from "@atlas/runtime/model-agent"
import { openSession } from "@atlas/runtime/session"
import type { Issue, ServerOp } from "@atlas/runtime/protocol"

async function* chunks(...parts: string[]) { for (const p of parts) { await Promise.resolve(); yield p } }

describe("runtime/model-agent >", () => {
  it("passes only the request's system prompt and the task to the model", async () => {
    const s = openSession({ task: "A single confirm action", capabilities: ["press"] })
    const seen: string[][] = []
    const agent = createModelAgent(s.request, (system, task) => { seen.push([system, task]); return chunks("") })
    agent.start(); await agent.done
    expect(seen).toEqual([[agentSystemPrompt(s.request), "A single confirm action"]])
  })
  it("stamps strictly increasing seq on parsed ops and records rejected lines", async () => {
    const s = openSession({ task: "A single confirm action", capabilities: ["press"] })
    const agent = createModelAgent(s.request, () => chunks(
      '{"op":"render","root":{"type":"Alert","slots":{"actions":[]}}}\n<b>x</b>\n',
      '{"op":"patch","at":"/slots/actions/0","node":{"type":"Button","slots":{"children":["OK"]}}}\n'))
    const ops: ServerOp[] = []
    agent.subscribe((op) => ops.push(op))
    agent.start(); await agent.done
    expect(ops.map((o) => [o.op, o.seq])).toEqual([["render", 1], ["patch", 2]])
    expect(agent.rejected).toEqual(["<b>x</b>"])
  })
  it("an agent-emitted out-of-catalog type still falls back in the runtime", async () => {
    const s = openSession({ task: "A single confirm action", capabilities: ["press"] })
    const agent = createModelAgent(s.request, () => chunks('{"op":"render","root":{"type":"Form","slots":{"children":[]}}}\n'))
    const issues: Issue[] = []
    render(<AtlasRuntime registry={s.registry} transport={agent} onIssues={(i) => { issues.push(...i) }} />)
    agent.start(); await agent.done
    await new Promise((r) => setTimeout(r, 0))
    expect(document.querySelector('[data-atlas-type="Form"]')).toBeNull()
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
})
```

Run both and expect FAIL (modules missing).
- [ ] **Step 2: Implement `agent-prompt.ts`.**

```ts
// Phase 6 PR-1: what a model agent is told. The grammar is static and first, the catalog second, so the prefix is
// byte-stable per catalog and caches. The catalog comes only from the request (openSession).
import type { AgentRequest } from "./protocol"

export const PROTOCOL_GRAMMAR = `You build user interfaces by emitting Atlas protocol operations, one JSON object per line (JSONL), and nothing else: no prose, no code fences, no HTML, CSS or JSX.
Operations:
{"op":"render","root":NODE} — exactly once, first, with a small root (its slots may start empty).
{"op":"patch","at":POINTER,"node":NODE} — then append children one at a time. POINTER is the parent's path plus /slots/<slot>/<index>; the root's path is "" and index equals the slot's current length to append.
NODE is {"type":TYPE,"props":{...},"slots":{"<slot>":[NODE or "text", ...]}}.
Use only the types below, only their listed props and slots, and only nest where their nesting allows. Text is plain words.
Catalog (one type per line):
`

export function agentSystemPrompt(request: AgentRequest): string {
  return PROTOCOL_GRAMMAR + request.catalog.prompt
}
```

- [ ] **Step 3: Implement `model-agent.ts`.**

```ts
// Phase 6 PR-1: a Transport over a model's text stream. It is given the agent request and nothing else; the stream
// function is injected, so this package never imports an SDK. Submits are not answered yet (the bench is one-shot).
import { agentSystemPrompt } from "./agent-prompt"
import { createOpParser } from "./op-stream"
import type { AgentRequest, ClientEvent, ServerOp, Transport } from "./protocol"
import type { UnsequencedOp } from "./stub-agent"

export type TextStream = (system: string, task: string) => AsyncIterable<string>
export type ModelAgent = Transport & { request: AgentRequest; log: Array<ClientEvent | ServerOp>; rejected: string[]; done: Promise<void>; start(): void }

export function createModelAgent(request: AgentRequest, textStream: TextStream): ModelAgent {
  const listeners = new Set<(op: ServerOp) => void>()
  const log: Array<ClientEvent | ServerOp> = []
  const parser = createOpParser()
  let seq = 0
  let resolve!: () => void
  const done = new Promise<void>((r) => { resolve = r })
  const emit = (ops: UnsequencedOp[]) => {
    for (const op of ops) {
      const stamped = { ...op, seq: ++seq } as ServerOp
      log.push(stamped)
      for (const l of listeners) l(stamped)
    }
  }
  return {
    request,
    log,
    rejected: parser.rejected,
    done,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    send(event) { log.push(event) },
    start() {
      void (async () => {
        try { for await (const chunk of textStream(agentSystemPrompt(request), request.task)) emit(parser.push(chunk)) }
        finally { emit(parser.end()); resolve() }
      })()
    },
  }
}
```

- [ ] **Step 4:** Run `npx vitest run packages/runtime && npx tsc --noEmit`. Expected: PASS, no type errors.

```bash
git add packages/runtime
git commit -m "feat(runtime): model agent — a Transport over a streamed model, given only the agent request"
```

---

### Task 5: Bench pieces (stats, full-catalog baseline, SDK binding)

**Files:** Create `benchmarks/protocol/stats.ts`, `stats.test.ts`, `full-catalog.ts`, `anthropic-stream.ts`, `vitest.protocol.config.ts`; Modify `package.json`, `vitest.config.ts` (include `benchmarks/protocol/**/*.test.ts`)

**Interfaces — Produces:**
- `p95(xs: number[]): number`
- `reduction(filtered: number, full: number): number`
- `fullCatalogPrompt(): string`
- `type StreamRecord = { firstTokenMs: number | null; usage: { input: number; output: number; cacheRead: number; cacheWrite: number }; model: string; fallback: boolean; stopReason: string | null }`
- `anthropicTextStream(client: Anthropic, model: string, onDone: (r: StreamRecord) => void, t0: number): TextStream`

- [ ] **Step 1: Install.** Run `npm install --save-dev --save-exact @anthropic-ai/sdk@1.3.0`. Expected: `package.json` and `package-lock.json` change. Do not touch any other dependency.
- [ ] **Step 2: Stats (TDD).** `stats.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { p95, reduction } from "./stats"

describe("bench/protocol stats >", () => {
  it("p95 is the nearest-rank 95th percentile (same rule as runtime-demo.spec.ts)", () => {
    expect(p95([5, 1, 3, 2, 4])).toBe(5)
    expect(p95(Array.from({ length: 20 }, (_, i) => i + 1))).toBe(19)
  })
  it("reduction is 1 - filtered / full", () => expect(reduction(250, 1000)).toBe(0.75))
})
```

`stats.ts`:

```ts
// Pure helpers for the protocol bench; p95 matches tests/runtime/runtime-demo.spec.ts (nearest rank).
export const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.max(0, Math.ceil(xs.length * 0.95) - 1)]
export const reduction = (filtered: number, full: number) => 1 - filtered / full
```

Add `"benchmarks/protocol/**/*.test.ts"` to `vitest.config.ts` `include`. Run `npx vitest run benchmarks/protocol`: FAIL first (module missing), then PASS after `stats.ts`.
- [ ] **Step 3: Full-catalog baseline.** `full-catalog.ts`:

```ts
// The A1 baseline (DEC-092): the prompt an agent would get with no filter — every registered type as catalogPrompt
// writes it, plus one line per facts-only component (its prop names). Bench-only: it reads generated facts from disk.
import fs from "node:fs"
import path from "node:path"
import { fullCatalog, registry } from "@atlas/registry/lib"
import { catalogPrompt } from "@atlas/runtime/session"

const GEN = path.resolve(process.cwd(), "packages/registry/generated")

export function fullCatalogPrompt(): string {
  const lines = catalogPrompt(registry).split("\n")
  for (const name of fullCatalog().filter((n) => !Object.hasOwn(registry.entries, n))) {
    const facts = JSON.parse(fs.readFileSync(path.join(GEN, `${name}.facts.json`), "utf8")) as { props?: Array<{ name: string }> }
    const props = (facts.props ?? []).map((p) => p.name).filter((n) => n !== "className")
    lines.push(JSON.stringify({ type: name, props }))
  }
  return lines.sort().join("\n")
}
```

- [ ] **Step 4: SDK binding.** Before writing, read `typescript/claude-api/streaming.md` from the claude-api skill. Then `anthropic-stream.ts`:

```ts
// The only SDK import in the repo's TypeScript (Phase 6 PR-1, D-C): Sonnet 5.5 pinned, streaming, thinking off,
// refusal fallback on (a fallback-served rep is excluded by the bench, never measured).
import Anthropic from "@anthropic-ai/sdk"
import type { TextStream } from "@atlas/runtime/model-agent"

export type StreamRecord = {
  firstTokenMs: number | null
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number }
  model: string; fallback: boolean; stopReason: string | null
}

export function anthropicTextStream(client: Anthropic, model: string, onDone: (r: StreamRecord) => void, t0: number): TextStream {
  return async function* (system, task) {
    const stream = client.beta.messages.stream({
      model,
      max_tokens: 4096,
      thinking: { type: "between_tools" },
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: task }],
    })
    let firstTokenMs: number | null = null
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        if (firstTokenMs === null) firstTokenMs = performance.now() - t0
        yield event.delta.text
      }
    }
    const m = await stream.finalMessage()
    const fallback = (m.usage.iterations ?? []).some((e) => e.type === "fallback_message")
    onDone({
      firstTokenMs,
      usage: { input: m.usage.input_tokens, output: m.usage.output_tokens, cacheRead: m.usage.cache_read_input_tokens ?? 0, cacheWrite: m.usage.cache_creation_input_tokens ?? 0 },
      model: m.model, fallback, stopReason: m.stop_reason,
    })
  }
}
```

If `tsc` rejects a field name (`between_tools`, `fallbacks`, `iterations`) against SDK 1.3.0's types, fix it from the compiler message and the skill's `typescript/` files. Do not cast to `any` to silence it.
- [ ] **Step 5: Config + script.** `vitest.protocol.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import base from "./vitest.config"

// Phase 6 protocol bench (Tier 3, bench-only, never CI): live model calls. Run via benchmarks/run.sh <label> P1.
export default defineConfig({
  ...base,
  test: { ...base.test, environment: "node", include: ["benchmarks/protocol/**/*.bench.ts"], testTimeout: 600_000, setupFiles: [] },
})
```

In `package.json` scripts: `"bench:protocol": "vitest run --config vitest.protocol.config.ts"`.
- [ ] **Step 6:** Run `npx tsc --noEmit && npx vitest run benchmarks/protocol packages/runtime`. Expected: PASS. Then `grep -rn "@anthropic-ai/sdk" packages app` should find nothing.

```bash
git add benchmarks/protocol vitest.protocol.config.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(bench): protocol bench pieces — stats, full-catalog baseline, Sonnet 5.5 stream binding"
```

---

### Task 6: The bench, `run.sh` type, CI copy and manifest

**Files:** Create `benchmarks/protocol/protocol.bench.ts`, `benchmarks/tasks/P1/meta.json`, `benchmarks/tasks/P1/prompt.md`; Modify `benchmarks/run.sh`, `benchmarks/phase-9/budget.mjs`, `.github/workflows/ci.yml`, `metrics.manifest.json`

- [ ] **Step 1: The bench.** `protocol.bench.ts`. It reads `BENCH_OUT`, `BENCH_REPS` (default 5) and `BENCH_MODEL` (default `claude-sonnet-5-5`):

```ts
// Phase 6 protocol bench. Arm 1 (free): count_tokens for each eval task's filtered prompt vs the full-catalog
// prompt → promptReduction. Arm 2 (spend): BENCH_REPS streamed runs per task → first valid op latency and agent
// markup. A rep served by a fallback model is excluded. Writes run.json (every rep) and bench.json (the metrics).
import fs from "node:fs"
import path from "node:path"
import Anthropic from "@anthropic-ai/sdk"
import { it } from "vitest"
import evalSet from "@/packages/registry/tests/eval-tasks.json"
import { agentSystemPrompt } from "@atlas/runtime/agent-prompt"
import { createModelAgent } from "@atlas/runtime/model-agent"
import { openSession } from "@atlas/runtime/session"
import { validateTree } from "@atlas/runtime/validate"
import { anthropicTextStream, type StreamRecord } from "./anthropic-stream"
import { fullCatalogPrompt } from "./full-catalog"
import { p95, reduction } from "./stats"

const OUT = process.env.BENCH_OUT ?? "benchmarks/results/local/P1"
const REPS = Number(process.env.BENCH_REPS ?? 5)
const MODEL = process.env.BENCH_MODEL ?? "claude-sonnet-5-5"
const PRICE = { input: 2 / 1e6, output: 10 / 1e6, cacheRead: 0.2 / 1e6, cacheWrite: 2.5 / 1e6 } // Sonnet 5.5, $/token
const BAD = new Set(["malformed", "unknown-type", "out-of-catalog", "missing-required"])

it("protocol bench", async () => {
  const client = new Anthropic()
  const full = fullCatalogPrompt()
  const count = async (system: string, task: string) =>
    (await client.messages.countTokens({ model: MODEL, system, messages: [{ role: "user", content: task }] })).input_tokens
  const perTask: Record<string, { filtered: number; full: number; reduction: number }> = {}
  for (const t of evalSet.tasks) {
    const { request } = openSession({ task: t.task, capabilities: t.capabilities })
    const filtered = await count(agentSystemPrompt(request), t.task)
    const whole = await count(agentSystemPrompt({ ...request, catalog: { ...request.catalog, prompt: full } }), t.task)
    perTask[t.id] = { filtered, full: whole, reduction: reduction(filtered, whole) }
  }

  const reps: Array<Record<string, unknown>> = []
  let costUsd = 0
  for (const t of evalSet.tasks) for (let i = 1; i <= REPS; i++) {
    const s = openSession({ task: t.task, capabilities: t.capabilities })
    let record: StreamRecord | null = null
    let firstValidMs: number | null = null, markup = 0
    const t0 = performance.now()
    const agent = createModelAgent(s.request, anthropicTextStream(client, MODEL, (r) => { record = r }, t0))
    agent.subscribe((op) => {
      if (op.op !== "render" && op.op !== "patch") return
      const raw = op.op === "render" ? op.root : op.node
      const { issues } = validateTree(raw, s.registry)
      markup += issues.filter((x) => x.code === "markup").length
      if (firstValidMs === null && op.op === "render" && !issues.some((x) => BAD.has(x.code))) firstValidMs = performance.now() - t0
    })
    agent.start(); await agent.done
    const r = record as StreamRecord | null
    if (r) costUsd += r.usage.input * PRICE.input + r.usage.output * PRICE.output + r.usage.cacheRead * PRICE.cacheRead + r.usage.cacheWrite * PRICE.cacheWrite
    reps.push({ task: t.id, rep: i, firstValidMs, markup, rejected: agent.rejected.length, ...r, excluded: !r || r.fallback || r.stopReason === "refusal" })
  }

  const kept = reps.filter((r) => !r.excluded)
  const latencies = kept.map((r) => r.firstValidMs).filter((x): x is number => typeof x === "number")
  const reductions = Object.values(perTask).map((x) => x.reduction)
  const bench = {
    "protocol.promptReduction": { pass: Math.min(...reductions) >= 0.5, min: Math.min(...reductions), mean: reductions.reduce((a, b) => a + b, 0) / reductions.length, perTask },
    "protocol.firstOpP95": { pass: latencies.length === kept.length && kept.length > 0 && p95(latencies) < 250, p95Ms: latencies.length ? p95(latencies) : null, n: kept.length, noValidOp: kept.length - latencies.length, excluded: reps.length - kept.length },
    "protocol.agentCompliance": { pass: kept.length > 0 && kept.every((r) => r.markup === 0 && r.rejected === 0), markupReps: kept.filter((r) => (r.markup as number) > 0 || (r.rejected as number) > 0).length, n: kept.length },
  }
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, "run.json"), JSON.stringify({ model: MODEL, reps: REPS, costUsd, date: new Date().toISOString(), runs: reps }, null, 2) + "\n")
  fs.writeFileSync(path.join(OUT, "bench.json"), JSON.stringify(bench, null, 2) + "\n")
})
```

A rep whose model never produces a valid render op counts against `firstOpP95` (`noValidOp`), not as excluded. A missing op is a failure, not a missing reading.
- [ ] **Step 2: `run.sh` protocol type.** After the `TYPE=` line, before the workspace logic:

```bash
# Phase 6 protocol bench (P1): live API calls through vitest, no workspace copy and no claude -p.
if [ "$TYPE" = "protocol" ]; then
  export BENCH_LEDGER="${BENCH_LEDGER:-$ROOT/benchmarks/results/protocol-spend.json}" BENCH_CAP="${BENCH_CAP:-3}" BENCH_FLOOR="${BENCH_FLOOR:-0.5}"
  node "$ROOT/benchmarks/phase-9/budget.mjs" pre "$TASK" 1 || exit 1
  { echo "date: $(date -u +%FT%TZ)"; echo "model: $MODEL"; echo "git HEAD: $(git -C "$ROOT" rev-parse --short HEAD)"; } > "$OUT/env.txt"
  ( cd "$ROOT" && BENCH_OUT="$OUT" BENCH_REPS="$REPS" BENCH_MODEL="$MODEL" npm run -s bench:protocol ) || { echo "✗ protocol bench failed"; exit 1; }
  node "$ROOT/benchmarks/phase-9/budget.mjs" post "$LABEL" "$TASK" 1 "$OUT/run.json"
  exit $?
fi
```

`run.sh` requires `command -v claude` before this point. Move the protocol branch above that check, which comes right after `OUT=`: `TYPE` needs only `TDIR`, so compute `TYPE` first. In `budget.mjs`, change `FLOOR = 1.5` to `FLOOR = Number(process.env.BENCH_FLOOR) || 1.5`.

`benchmarks/tasks/P1/meta.json`: `{ "type": "protocol", "_note": "Phase 6 PR-1: the task set is packages/registry/tests/eval-tasks.json; see benchmarks/protocol/protocol.bench.ts." }`

`benchmarks/tasks/P1/prompt.md`: one paragraph saying the prompt is built per task by `agentSystemPrompt(openSession(task).request)` and is never written by hand.

- [ ] **Step 3: Dry check, no spend.** Run `BENCH_LEDGER=/tmp/x.json node benchmarks/phase-9/budget.mjs status`, then `bash -n benchmarks/run.sh`. Expected: no syntax error.
- [ ] **Step 4: CI copy (D1).** In `.github/workflows/ci.yml` metrics job, after "Prepare .metrics":

```yaml
      # Phase 6 (D-D: D1): bench rows read the last recorded protocol batch, committed by hand; CI never calls a model.
      - name: Collect the recorded protocol bench
        run: if [ -f benchmarks/results/protocol-latest/bench.json ]; then cp benchmarks/results/protocol-latest/bench.json .metrics/bench.json; fi
```

- [ ] **Step 5: Manifest.**
  - Add E1's row after the vitest "Agent outputs containing CSS…" row.
  - Give each of the three bench rows a `why`: "Tier 3, bench-only (DEC-093): the reading is the committed batch in benchmarks/results/protocol-latest (label, date and model in its run.json); claude-sonnet-5-5, streaming, thinking off, fallback-served reps excluded."
  - promptReduction's `why` adds the DEC-092 caveat: most of the reduction is the 43 unregistered components.
  - firstOpP95's `why` adds: "measured from request send, so it includes time to first token."
- [ ] **Step 6:** Run `npx tsc --noEmit && npx vitest run && npm run test:scripts`. Expected: PASS. The bench file is not in the default include, so the blocking suite never calls the API.

```bash
git add benchmarks .github/workflows/ci.yml metrics.manifest.json
git commit -m "feat(bench): protocol bench type (P1) — prompt reduction, first valid op, agent compliance"
```

---

### Task 7: The recorded batch (owner go-ahead, spend)

- [ ] **Step 1: Ask the owner in chat:** "Run the P1 protocol batch now? 4 tasks × 5 reps of claude-sonnet-5-5 (estimated ≈ $0.25; cap $3) plus 8 free count_tokens calls. Credentials: ANTHROPIC_API_KEY exported, or `ant auth login`." Stop until they answer yes. Never enter a key.
- [ ] **Step 2: Run:**

```bash
benchmarks/run.sh protocol-v1 P1 5 claude-sonnet-5-5
```

Expected:
- `benchmarks/results/protocol-v1/P1/{env.txt,run.json,bench.json}` written.
- The budget line shows spend well under $3.
- An auth error is an infrastructure failure: fix credentials and re-run. It is not a reading.
- [ ] **Step 3: Read the results honestly.**
  - Report `promptReduction.min/mean`, `firstOpP95.p95Ms`, `noValidOp`, `excluded`, `agentCompliance.markupReps` and `costUsd` as recorded.
  - Do not re-run to get a better number. A second batch is allowed only for an infrastructure failure (the budget rules).
- [ ] **Step 4:** `mkdir -p benchmarks/results/protocol-latest && cp benchmarks/results/protocol-v1/P1/bench.json benchmarks/results/protocol-latest/bench.json`, then commit the batch with the spend ledger:

```bash
git add benchmarks/results/protocol-v1 benchmarks/results/protocol-latest benchmarks/results/protocol-spend.json
git commit -m "bench(protocol): P1 batch protocol-v1 — claude-sonnet-5-5, 4 tasks × 5 reps"
```

---

### Task 8: Records, verification, PR

- [ ] **Step 1: DEC-093** appended to `atlas/state/decisions.json`: D-C (API streaming, `claude-sonnet-5-5`, $3/batch, thinking `between_tools`, effort low, fallbacks default with fallback reps excluded), D-D and D-E as chosen. Then run `npm run atlas:sync`.
- [ ] **Step 2: Verification in house order:**

```bash
npm run tokens:build && git diff --exit-code packages/tokens
npm run token-lint
npx tsc --noEmit
npx vitest run
npx eslint packages/runtime benchmarks/protocol vitest.protocol.config.ts
npm run test:scripts
npm run registry:check
npm run atlas:verify -- --scope "packages/runtime/**,benchmarks/**,vitest.protocol.config.ts,vitest.config.ts,package.json,package-lock.json,.github/workflows/ci.yml,metrics.manifest.json,atlas/state/decisions.json"
npm run test:runtime
npm run test:visual
node scripts/metrics-report.mjs --results <dir with the committed bench.json copied in> --check
```

Expected:
- All exit 0, and zero changed baselines.
- `grep -rn "@anthropic-ai/sdk" packages app` is empty.
- If `atlas:verify` flags the new devDependency or `.github/` scope, read its message before widening anything.
- [ ] **Step 3: Docs.**
  - Roadmap Phase 6: "PR-1 ✅", with the readings.
  - Handoff: progress 26–27 of ~28; "Start here" = Phase 7.
  - `claude.md`: the Status line.
- [ ] **Step 4:** Commit, then ask the owner before opening the PR. After approval:
  1. Open the PR and turn on Auto-fix.
  2. Wait for the CI `metrics` artifact and run `node scripts/metrics-report.mjs --results <scratch>/metrics-input`. Expected region (D1 + E1): 37 rows, with the three bench rows measured as recorded.
  3. Push that refresh, then turn on auto-merge.

---

## Self-review

- **Spec coverage:**
  - "Model-dependent metrics become real": first streamed op (Task 6, `firstOpP95`), ≥50% prompt reduction (Task 6, `promptReduction`), and agent-side CSS/HTML/JSX compliance (E1, `agentCompliance`).
  - The agent gets only the filtered request: Task 4 tests the exact `(system, task)` pair.
  - The validator stays the guarantee: Task 4's runtime test with an agent-emitted Form.
  - `protocol` is a new `run.sh` type, not a new harness: Task 6 Step 2 reuses `budget.mjs`.
  - The bench never gates CI: separate vitest config and D1's committed reading.
- **Deviations, with reasons:**
  - The bench runs as a vitest file, because the repo has no `tsx`/`esbuild` runner and vitest already resolves the `@atlas/*` aliases.
  - The SDK binding lives in `benchmarks/`, to keep the runtime SDK-free.
  - `run.sh` checks for the `claude` CLI before the protocol branch; the branch moves above that check.
  - The pins check (`pins.mjs`) is not reused, because it pins Claude Code and MCP versions. The model pin is recorded in `run.json` and `env.txt` instead.
- **Placeholder scan:** `<dir…>` and `<scratch>` in Task 8 are runtime paths. The readings are deliberately unknown until Task 7.
- **Name consistency:** `createOpParser`, `OpParser.rejected`, `PROTOCOL_GRAMMAR`, `agentSystemPrompt`, `TextStream`, `createModelAgent`, `ModelAgent.done/start`, `anthropicTextStream`, `StreamRecord`, `fullCatalogPrompt`, `p95`, `reduction` and the bench keys `protocol.promptReduction|firstOpP95|agentCompliance` are used identically throughout.
- **Named open risks:**
  - (1) `firstOpP95` will very likely read failing: hosted time to first token alone usually exceeds 250 ms. The reading is honest, and the target is a Phase 7 trend-gate question, not something to tune here.
  - (2) SDK 1.3.0 type names for `between_tools`, `fallbacks` and `usage.iterations` are taken from the claude-api skill, and `tsc` is the check (Task 5 Step 4).
  - (3) `promptReduction` passes mostly on unregistered components (DEC-092).
