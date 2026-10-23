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
    const { container } = render(
      <AtlasRuntime registry={registry} transport={silentTransport} initial={renderOp(fixture.render.root)}
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
