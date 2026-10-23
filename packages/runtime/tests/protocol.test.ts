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
