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
  it("is every registered type plus every unaliased component (49 today)", () => {
    const full = fullCatalog()
    expect(full).toEqual([...full].sort())
    for (const type of Object.keys(registry.entries)) expect(full).toContain(type)
    expect(full).not.toContain("Input")
    expect(full).toContain("Dialog")
    expect(full.length).toBe(49)
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

describe("registry/provisional >", () => {
  it("Alert, TextField and Form are provisional, each waiting on a scaffolded component", () => {
    const waiting = (t: string) => registry.entries[t].provisional?.waitingOn
    expect(waiting("Alert")).toEqual(["Alert"])
    expect(waiting("TextField")).toEqual(["Input"])
    expect(waiting("Form")).toEqual(["Alert", "Input"])
    for (const t of ["Button", "Field", "Text"]) expect(registry.entries[t].provisional, t).toBeUndefined()
  })
  it("development filtering is unchanged: provisional entries load for every task", () => {
    expect(filter(["submit"])).toEqual(["Alert", "Button", "Field", "Form", "TextField"])
    expect(filter(["dismiss"])).toEqual(["Alert", "Button"])
  })
  it("production filtering leaves provisional entries out of matches, nesting and fallback targets", () => {
    const production = (caps: string[]) => filter(caps, registry, { mode: "production" })
    expect(production(["submit"])).toEqual([])
    expect(production(["dismiss"])).toEqual([])
    expect(production(["input"])).toEqual([])
    expect(production(["press"])).toEqual(["Button"])
    for (const caps of [["submit"], ["press"], ["input"], ["dismiss"], ["display"]])
      for (const t of production(caps)) expect(registry.entries[t].provisional, t).toBeUndefined()
  })
  it("catalogFor passes the mode through", () => {
    expect(catalogFor({ task: "confirm", capabilities: ["press"] }, registry, { mode: "production" }).types).toEqual(["Button"])
    expect(catalogFor({ task: "confirm", capabilities: ["press"] }).types).toEqual(["Alert", "Button"])
  })
})
