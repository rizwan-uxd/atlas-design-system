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
