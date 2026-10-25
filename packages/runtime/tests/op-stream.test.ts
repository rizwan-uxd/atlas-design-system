import { describe, expect, it } from "vitest"
import { createOpParser } from "@atlas/runtime/op-stream"

describe("runtime/op-stream >", () => {
  it("emits an op only once its line is complete, across arbitrary chunk boundaries", () => {
    const p = createOpParser()
    expect(p.push('{"op":"render","root":{"type":"Fo')).toEqual([])
    expect(p.push('rm","slots":{"children":[]}}}\n{"op":"patch","at":"/slots/children/0",')).toEqual([
      { op: "render", root: { type: "Form", slots: { children: [] } } },
    ])
    expect(p.push('"node":{"type":"Button","slots":{"children":["Go"]}}}\n')).toEqual([
      { op: "patch", at: "/slots/children/0", node: { type: "Button", slots: { children: ["Go"] } } },
    ])
  })
  it("flushes a final line without a newline on end()", () => {
    const p = createOpParser()
    p.push('{"op":"render","root":{"type":"Alert"}}')
    expect(p.end()).toEqual([{ op: "render", root: { type: "Alert" } }])
  })
  it("ignores blank lines and code fences, and records lines that are not ops", () => {
    const p = createOpParser()
    expect(p.push('```jsonl\n\n<div style="color:red">hi</div>\n{"op":"nope"}\n{"op":"ack","ack":1}\n```\n')).toEqual([])
    expect(p.rejected).toEqual(['<div style="color:red">hi</div>', '{"op":"nope"}', '{"op":"ack","ack":1}'])
  })
})
