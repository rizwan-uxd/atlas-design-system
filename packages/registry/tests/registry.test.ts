import { describe, expect, it } from "vitest"
import { filter, registry, resolve, without } from "@atlas/registry/lib"

describe("registry/resolve >", () => {
  it("TextField renders Input", () => expect(resolve("TextField")).toBe("Input"))
  it("Modal is an alias of Dialog", () => expect(resolve("Modal")).toBe("Dialog"))
  it("Form is structural", () => expect(resolve("Form")).toBe("structural"))
  it("Button renders Button", () => expect(resolve("Button")).toBe("Button"))
  it("an unknown name resolves to null", () => expect(resolve("UnknownChart")).toBeNull())
})

describe("registry/filter >", () => {
  it("a submit request gets at most 6 types, and never Dialog", () => {
    const types = filter(["submit"])
    expect(types).toEqual(["Alert", "Button", "Field", "Form", "TextField"])
    expect(types.length).toBeLessThanOrEqual(6)
    expect(types).not.toContain("Dialog")
  })
  it("a press request gets only Button", () => expect(filter(["press"])).toEqual(["Button"]))
  it("an unknown capability gets nothing", () => expect(filter(["chart"])).toEqual([]))
})

describe("registry/without >", () => {
  it("removes one entry and its schema and leaves the shared registry alone", () => {
    const r = without("Alert")
    expect(Object.keys(r.entries).sort()).toEqual(["Button", "Field", "Form", "TextField"])
    expect(r.schemas).not.toHaveProperty("Alert")
    expect(registry.entries).toHaveProperty("Alert")
  })
})
