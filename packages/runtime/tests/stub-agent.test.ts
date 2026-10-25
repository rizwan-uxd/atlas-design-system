import { describe, expect, it } from "vitest"
import { createStubAgent } from "@atlas/runtime/stub-agent"
import { openSession } from "@atlas/runtime/session"
import type { Fixture, ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const { request } = openSession({ task: "Request access form", capabilities: ["submit"] })

const collect = (agent: ReturnType<typeof createStubAgent>) => { const ops: ServerOp[] = []; agent.subscribe((op) => ops.push(op)); return ops }
const flush = () => new Promise((r) => setTimeout(r, 5))

describe("runtime/stub-agent >", () => {
  it("acks every event, then answers an invalid email with a state op, seq strictly increasing", async () => {
    const agent = createStubAgent(fixture as Fixture, request)
    const ops = collect(agent)
    agent.send({ kind: "event", seq: 1, type: "submit", source: "", values: { "form.email": "nope", "form.organisation": "Acme" } })
    await flush()
    expect(ops[0]).toEqual({ op: "ack", seq: 2, ack: 1 })
    expect(ops).toContainEqual(expect.objectContaining({ op: "state", path: "form.email", value: { error: "Enter a valid work email" } }))
    expect(ops.map((o) => o.seq)).toEqual([...ops.map((o) => o.seq)].sort((a, b) => a - b))
  })
  it("a valid submit clears both errors and patches in the success Alert", async () => {
    const agent = createStubAgent(fixture as Fixture, request)
    const ops = collect(agent)
    agent.send({ kind: "event", seq: 1, type: "submit", source: "", values: { "form.email": "a@b.co", "form.organisation": "Acme" } })
    await flush()
    expect(ops.at(-1)).toMatchObject({ op: "patch", at: "/slots/children/3", node: { type: "Alert" } })
  })
})
