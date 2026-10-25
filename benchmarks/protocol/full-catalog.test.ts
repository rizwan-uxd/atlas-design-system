import { describe, expect, it } from "vitest"
import { fullCatalog } from "@atlas/registry/lib"
import { openSession } from "@atlas/runtime/session"
import { fullCatalogPrompt } from "./full-catalog"

describe("bench/protocol full catalog >", () => {
  it("is one sorted line per agent-visible name (48), byte-stable", () => {
    const p = fullCatalogPrompt()
    const types = p.split("\n").map((l) => (JSON.parse(l) as { type: string }).type)
    expect(types).toEqual(fullCatalog())
    expect(fullCatalogPrompt()).toBe(p)
  })
  it("contains every filtered catalog line, so a filtered prompt is a strict subset", () => {
    const full = fullCatalogPrompt().split("\n")
    const { request } = openSession({ task: "Request access form", capabilities: ["submit"] })
    for (const line of request.catalog.prompt.split("\n")) expect(full).toContain(line)
  })
})
