import { describe, expect, it } from "vitest"
import { catalogFor, filter, fullCatalog, registry, restrict } from "@atlas/registry/lib"
import evalSet from "./eval-tasks.json"

const requests = evalSet.tasks.map((t) => ({ t, catalog: catalogFor({ task: t.task, capabilities: t.capabilities }) }))

describe("registry/filter >", () => {
  it("every request carries a filtered catalog", () => {
    for (const { t, catalog } of requests) {
      expect(catalog.types, t.id).toEqual(t.expected)
      expect(catalog.types.length, t.id).toBeGreaterThan(0)
      for (const type of catalog.types) expect(Object.hasOwn(registry.entries, type), `${t.id}: ${type}`).toBe(true)
    }
  })
  it("no request exposes the full catalog", () => {
    const full = fullCatalog()
    for (const { t, catalog } of requests) {
      expect(catalog.types.length, t.id).toBeLessThan(full.length)
      expect(full.every((n) => catalog.types.includes(n)), t.id).toBe(false)
    }
  })
  it("catalog excludes out-of-task types", () => {
    for (const { t, catalog } of requests) for (const n of t.outOfTask) expect(catalog.types, `${t.id}: ${n}`).not.toContain(n)
  })
})

describe("registry/fullCatalog >", () => {
  it("is every registered type plus every unaliased component (48 today)", () => {
    const full = fullCatalog()
    expect(full).toEqual([...full].sort())
    for (const type of Object.keys(registry.entries)) expect(full).toContain(type)
    expect(full).not.toContain("Input")
    expect(full).toContain("Dialog")
    expect(full.length).toBe(48)
  })
})

describe("registry/restrict >", () => {
  it("keeps only the catalog's entries and schemas and withholds every other agent-visible name", () => {
    const r = restrict(registry, catalogFor({ task: "confirm", capabilities: ["press"] }))
    expect(Object.keys(r.entries)).toEqual(["Alert", "Button"])
    expect(Object.keys(r.schemas).sort()).toEqual(["Alert", "Button"])
    expect(r.withheld).toContain("Form")
    expect(r.withheld).toContain("Dialog")
    expect(r.withheld).not.toContain("Button")
    expect(registry.entries).toHaveProperty("Form")
  })
  it("an unknown capability gets an empty catalog, never the full one", () => {
    expect(filter(["chart"])).toEqual([])
    expect(Object.keys(restrict(registry, catalogFor({ task: "x", capabilities: ["chart"] })).entries)).toEqual([])
  })
})
