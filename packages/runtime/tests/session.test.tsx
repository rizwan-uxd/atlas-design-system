import * as React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { fullCatalog, registry } from "@atlas/registry/lib"
import { AtlasRuntime, silentTransport } from "@atlas/runtime/Runtime"
import { catalogPrompt, openSession } from "@atlas/runtime/session"
import type { Issue, ProtocolNode, ServerOp } from "@atlas/runtime/protocol"

const confirm = () => openSession({ task: "A single confirm action", capabilities: ["press"] })

describe("runtime/session >", () => {
  it("the request and the runtime registry come from one catalog", () => {
    const s = confirm()
    expect(s.request.catalog.types).toEqual(["Alert", "Button"])
    expect(Object.keys(s.registry.entries)).toEqual(s.request.catalog.types)
  })
  it("the prompt names only catalog types", () => {
    const { request } = confirm()
    for (const n of fullCatalog()) expect(request.catalog.prompt.includes(`"type":"${n}"`), n).toBe(request.catalog.types.includes(n))
  })
  it("the prompt is deterministic and smaller than the full registry's", () => {
    const a = confirm().request.catalog.prompt
    expect(confirm().request.catalog.prompt).toBe(a)
    expect(a.length).toBeLessThan(catalogPrompt(registry).length)
  })
  it("an agent cannot widen its catalog: an emitted out-of-catalog type renders the fallback", () => {
    const s = confirm()
    const issues: Issue[] = []
    const root = { type: "Form", slots: { children: [{ type: "Button", slots: { children: ["Go"] } }] } }
    const initial: ServerOp = { op: "render", seq: 1, root: root as ProtocolNode }
    const onIssues = (i: Issue[]) => { issues.push(...i) }
    render(<AtlasRuntime registry={s.registry} transport={silentTransport} initial={initial} onIssues={onIssues} />)
    expect(document.querySelector('[data-atlas-type="Form"]')).toBeNull()
    expect(document.querySelector('[data-atlas-type="Alert"]')).not.toBeNull()
    expect(screen.getByText("This content is unavailable")).toBeTruthy()
    expect(issues).toContainEqual(expect.objectContaining({ code: "out-of-catalog" }))
  })
})
