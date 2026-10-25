import * as React from "react"
import { describe, expect, it } from "vitest"
import { act, render } from "@testing-library/react"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { agentSystemPrompt } from "@atlas/runtime/agent-prompt"
import { createModelAgent } from "@atlas/runtime/model-agent"
import { openSession } from "@atlas/runtime/session"
import type { Issue, ServerOp } from "@atlas/runtime/protocol"

async function* chunks(...parts: string[]) { for (const p of parts) { await Promise.resolve(); yield p } }
const confirm = () => openSession({ task: "A single confirm action", capabilities: ["press"] })

describe("runtime/model-agent >", () => {
  it("passes only the request's system prompt and the task to the model", async () => {
    const s = confirm()
    const seen: string[][] = []
    const agent = createModelAgent(s.request, (system, task) => { seen.push([system, task]); return chunks("") })
    agent.start(); await agent.done
    expect(seen).toEqual([[agentSystemPrompt(s.request), "A single confirm action"]])
  })
  it("stamps strictly increasing seq on parsed ops and records rejected lines", async () => {
    const s = confirm()
    const agent = createModelAgent(s.request, () => chunks(
      '{"op":"render","root":{"type":"Alert","slots":{"actions":[]}}}\n<b>x</b>\n',
      '{"op":"patch","at":"/slots/actions/0","node":{"type":"Button","slots":{"children":["OK"]}}}\n'))
    const ops: ServerOp[] = []
    agent.subscribe((op) => { ops.push(op) })
    agent.start(); await agent.done
    expect(ops.map((o) => [o.op, o.seq])).toEqual([["render", 1], ["patch", 2]])
    expect(agent.rejected).toEqual(["<b>x</b>"])
  })
  it("a stream that throws resolves done with the error, keeping ops already emitted", async () => {
    async function* broken() { yield '{"op":"render","root":{"type":"Alert"}}\n'; throw new Error("network") }
    const agent = createModelAgent(confirm().request, () => broken())
    agent.start(); await agent.done
    expect(String(agent.error)).toContain("network")
    expect(agent.log).toHaveLength(1)
  })
  it("an agent-emitted out-of-catalog type still falls back in the runtime", async () => {
    const s = confirm()
    const agent = createModelAgent(s.request, () => chunks('{"op":"render","root":{"type":"Form","slots":{"children":[]}}}\n'))
    const issues: Issue[] = []
    const onIssues = (i: Issue[]) => { issues.push(...i) }
    render(<AtlasRuntime registry={s.registry} transport={agent} onIssues={onIssues} />)
    await act(async () => { agent.start(); await agent.done })
    expect(document.querySelector('[data-atlas-type="Form"]')).toBeNull()
    expect(document.querySelector('[data-atlas-type="Alert"]')).not.toBeNull()
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
})

describe("runtime/model-agent repair >", () => {
  const bad = '{"op":"render","root":{"type":"Form","slots":{"children":[]}}}\n'
  const good = '{"op":"render","root":{"type":"Alert","slots":{"actions":[]}}}\n'
  it("records diagnostics per attempt and re-asks once with the issues, then stops", async () => {
    const s = confirm()
    const tasks: string[] = []
    const agent = createModelAgent(s.request, (_sys, task) => { tasks.push(task); return chunks(bad) }, { registry: s.registry })
    agent.start(); await agent.done
    expect(tasks).toHaveLength(2)
    expect(tasks[1]).toContain("out-of-catalog")
    expect(tasks[1]).toContain("A single confirm action")
    expect(agent.repairs).toBe(1)
    expect(agent.diagnostics.map((d) => d.attempt)).toEqual([0, 1])
    expect(agent.diagnostics[1].issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
  it("a clean first attempt is not repaired", async () => {
    const s = confirm()
    let calls = 0
    const agent = createModelAgent(s.request, () => { calls++; return chunks(good) }, { registry: s.registry })
    agent.start(); await agent.done
    expect(calls).toBe(1)
    expect(agent.repairs).toBe(0)
    expect(agent.diagnostics).toEqual([{ attempt: 0, issues: [] }])
  })
  it("a repair that succeeds streams its ops after the first attempt's, with increasing seq", async () => {
    const s = confirm()
    let n = 0
    const agent = createModelAgent(s.request, () => chunks(n++ === 0 ? bad : good), { registry: s.registry })
    agent.start(); await agent.done
    const ops = agent.log.filter((x): x is ServerOp => "op" in x)
    expect(ops.map((o) => o.seq)).toEqual([1, 2])
    expect(agent.diagnostics.at(-1)?.issues).toEqual([])
  })
  it("maxRepairs 0 never re-asks, and without a registry nothing is validated", async () => {
    const s = confirm()
    let calls = 0
    const a = createModelAgent(s.request, () => { calls++; return chunks(bad) }, { registry: s.registry, maxRepairs: 0 })
    a.start(); await a.done
    const b = createModelAgent(s.request, () => { calls++; return chunks(bad) })
    b.start(); await b.done
    expect(calls).toBe(2)
    expect(b.diagnostics).toEqual([])
  })
  it("non-op lines are not issues and do not trigger a repair", async () => {
    const s = confirm()
    let calls = 0
    const agent = createModelAgent(s.request, () => { calls++; return chunks("Sure!\n", good) }, { registry: s.registry })
    agent.start(); await agent.done
    expect(calls).toBe(1)
    expect(agent.rejected).toEqual(["Sure!"])
  })
})
