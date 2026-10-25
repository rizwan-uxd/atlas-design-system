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
