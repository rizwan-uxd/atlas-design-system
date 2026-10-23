import { describe, expect, it } from "vitest"
import { registry, without } from "@atlas/registry/lib"
import { validateTree } from "@atlas/runtime/validate"
import { fallbackFor } from "@atlas/runtime/fallback"
import type { SafeNode } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const FALLBACK = { type: "Alert", props: { variant: "neutral" }, slots: { description: ["This content is unavailable"] }, fallback: true }
const kids = (n: SafeNode | null) => (n as SafeNode).slots.children
const form = (...children: unknown[]) => ({ type: "Form", slots: { children } })
const button = (props: Record<string, unknown> = {}) => ({ type: "Button", props, slots: { children: ["Go"] } })

describe("runtime/validator >", () => {
  it("unknown type replaced by fallback", () => {
    const { node, issues } = validateTree(form({ type: "UnknownChart" }, button()), registry)
    expect(kids(node)[0]).toMatchObject(FALLBACK)
    expect(kids(node)[1]).toMatchObject({ type: "Button" })
    expect(issues).toContainEqual(expect.objectContaining({ code: "unknown-type", path: "/slots/children/0" }))
  })

  it("unregistered type never renders", () => {
    const { node } = validateTree(form({ type: "UnknownChart" }, { type: "Dialog" }, { type: "Modal" }), registry)
    const types = JSON.stringify(node).match(/"type":"[A-Za-z]+"/g) as string[]
    expect(types.every((t) => /"(Form|Alert|Button|Field|TextField)"/.test(t))).toBe(true)
  })

  describe("rejects markup in prop values", () => {
    it.each(["<div>hi</div>", "color: red"])("%s", (bad) => {
      const { node, issues } = validateTree(form({ type: "Field", slots: { label: ["Email"], children: [{ type: "TextField", props: { name: "email", placeholder: bad } }] } }), registry)
      const field = kids(node)[0] as SafeNode
      expect((field.slots.children[0] as SafeNode).props).not.toHaveProperty("placeholder")
      expect(issues).toContainEqual(expect.objectContaining({ code: "markup" }))
    })
    it("in slot text too", () => {
      const { node } = validateTree(form({ type: "Button", slots: { children: ["<script>x</script>"] } }), registry)
      expect((kids(node)[0] as SafeNode).slots.children).toEqual([])
    })
  })

  it("strips an unknown prop and keeps the node", () => {
    const { node, issues } = validateTree(form(button({ variant: "primary", onClick: "alert(1)", style: { color: "red" } })), registry)
    expect((kids(node)[0] as SafeNode).props).toEqual({ variant: "primary" })
    expect(issues.filter((i) => i.code === "unknown-prop")).toHaveLength(2)
  })

  it("drops an invalid variant so the component default applies", () => {
    const { node, issues } = validateTree(form(button({ variant: "sparkly" })), registry)
    expect((kids(node)[0] as SafeNode).props).not.toHaveProperty("variant")
    expect(issues).toContainEqual(expect.objectContaining({ code: "invalid-prop" }))
  })

  it("drops a Form inside a Button and keeps the Button", () => {
    const { node, issues } = validateTree(form({ type: "Button", slots: { children: ["Go", form()] } }), registry)
    expect((kids(node)[0] as SafeNode).slots.children).toEqual(["Go"])
    expect(issues).toContainEqual(expect.objectContaining({ code: "nesting" }))
  })

  it("sends a TextField with no name to its fallback instead of throwing", () => {
    const raw = form({ type: "Field", slots: { label: ["Email"], children: [{ type: "TextField", props: { placeholder: "x" } }] } })
    expect(() => validateTree(raw, registry)).not.toThrow()
    const field = kids(validateTree(raw, registry).node)[0] as SafeNode
    expect(field.slots.children[0]).toMatchObject(FALLBACK)
  })

  it("repairs a malformed root into the fallback", () => {
    for (const raw of [null, 42, "x", [], { type: 7 }, {}]) expect(validateTree(raw, registry).node).toMatchObject(FALLBACK)
  })

  it("keeps the request-access fixture whole, with no issues", () => {
    const { node, issues } = validateTree(fixture.render.root, registry)
    expect(issues).toEqual([])
    expect(kids(node).map((c) => (c as SafeNode).type)).toEqual(["Field", "Field", "Button"])
  })
})

describe("runtime/fallback >", () => {
  it("every registered type has a fallback whose target is registered", () => {
    for (const e of Object.values(registry.entries)) {
      expect(e.fallback, `${e.type} fallback`).toBeDefined()
      expect(Object.hasOwn(registry.entries, (e.fallback as { type: string }).type), `${e.type} → ${e.fallback?.type}`).toBe(true)
    }
  })
  it("copy is exact", () => expect(fallbackFor("Button", registry, "/x")).toMatchObject({ ...FALLBACK, path: "/x" }))
  it("renders nothing when the target is not registered (DEC-082)", () => {
    const r = without("Alert")
    expect(fallbackFor("Button", r, "/x")).toBeNull()
    expect(fallbackFor(null, r, "/x")).toBeNull()
  })
  it("deleting Alert keeps the rest of the tree", () => {
    const { node } = validateTree(form({ type: "Alert", slots: { title: ["Hi"] } }, button()), without("Alert"))
    expect(kids(node).map((c) => (c as SafeNode).type)).toEqual(["Button"])
  })
})
