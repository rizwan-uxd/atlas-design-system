import { describe, expect, it } from "vitest"
import { catalogFor, registry, restrict } from "@atlas/registry/lib"
import { initialState, reduce } from "@atlas/runtime/store"
import type { SafeNode, ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

const step = reduce(registry)
const run = (...ops: ServerOp[]) => ops.reduce((s, op) => step(s, { kind: "server", op }), initialState)
const rendered = () => run(fixture.render as ServerOp)
const kids = (s: { root: SafeNode | null }) => (s.root as SafeNode).slots.children as SafeNode[]

describe("runtime/store >", () => {
  it("render validates the tree", () => expect(kids(rendered()).map((k) => k.type)).toEqual(["Field", "Field", "Button"]))

  it("a stale or repeated seq is ignored and reported", () => {
    const s = run(fixture.render as ServerOp, { op: "ack", seq: 1, ack: 1 })
    expect(s.acks).toEqual([])
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "stale-seq" }))
  })

  it("state sets and clears an error by path", () => {
    const s1 = run(fixture.render as ServerOp, { op: "state", seq: 2, path: "form.email", value: { error: "Bad" } })
    expect(s1.errors).toEqual({ "form.email": "Bad" })
    const s2 = step(s1, { kind: "server", op: { op: "state", seq: 3, path: "form.email", value: { error: null } } })
    expect(s2.errors).toEqual({})
  })

  it("state rejects error text that is markup", () => {
    const s = run(fixture.render as ServerOp, { op: "state", seq: 2, path: "form.email", value: { error: "<b>x</b>" } })
    expect(s.errors).toEqual({})
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "markup" }))
  })

  it("patch appends and keeps the identity of every untouched subtree", () => {
    const before = rendered()
    const after = step(before, { kind: "server", op: { ...(fixture.responses.success[0] as ServerOp), seq: 2 } })
    expect(kids(after)[3]).toMatchObject({ type: "Alert", path: "/slots/children/3" })
    expect(kids(after)[0]).toBe(kids(before)[0])
    expect(kids(after)[2]).toBe(kids(before)[2])
    expect(after.root).not.toBe(before.root)
  })

  it("patch with node null removes, and later siblings are re-pathed", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/0", node: null })
    expect(kids(s).map((k) => k.path)).toEqual(["/slots/children/0", "/slots/children/1"])
  })

  it("patch validates the node in its parent's context", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/3", node: { type: "UnknownChart" } })
    expect(kids(s)[3]).toMatchObject({ type: "Alert", fallback: true })
    expect(s.fallbackSeq).toBe(2)
  })

  it("a pointer past the end is reported, not thrown", () => {
    const s = run(fixture.render as ServerOp, { op: "patch", seq: 2, at: "/slots/children/9", node: { type: "Button" } })
    expect(s.issues).toContainEqual(expect.objectContaining({ code: "bad-pointer" }))
  })

  it("input stores a value locally and emits nothing", () => {
    const s = step(rendered(), { kind: "input", path: "form.email", value: "a@b.co" })
    expect(s.values).toEqual({ "form.email": "a@b.co" })
  })
})

describe("runtime/store > catalog", () => {
  it("an out-of-catalog render records the fallback seq", () => {
    const r = restrict(registry, catalogFor({ task: "confirm", capabilities: ["press"] }))
    const s = reduce(r)(initialState, { kind: "server", op: { op: "render", seq: 1, root: { type: "Form" } } })
    expect(s.fallbackSeq).toBe(1)
  })
})
