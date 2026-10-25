// Phase 6: the catalog an agent request carries, built outside the agent. filter() is the prompt optimisation;
// restrict() is the guarantee: the runtime validates against the restricted registry, so a type outside the
// catalog falls back however the agent spells it.
import { isProvisional, registry, type Registry } from "./registry"

export type CatalogRequest = { task: string; capabilities: string[] }
export type Catalog = { task: string; capabilities: string[]; types: string[] }

export type FilterOptions = {
  /**
   * "development" (the default) keeps every registered entry, provisional ones included, so the demo, the eval tasks,
   * the fixtures and the benchmarks read as before. "production" leaves provisional entries out of capability
   * matches, nesting and fallback targets (DEC-097): a production catalog holds production-ready types only.
   */
  mode?: "development" | "production"
}

/** Registered types for a request: capability matches, what they may nest (either side declaring), and their fallback targets (DEC-092). */
export function filter(capabilities: string[], r: Registry = registry, { mode = "development" }: FilterOptions = {}): string[] {
  const out = new Set<string>()
  const all = Object.values(r.entries).filter((e) => mode === "development" || !isProvisional(e))
  const usable = (type: string) => Object.hasOwn(r.entries, type) && (mode === "development" || !isProvisional(r.entries[type]))
  const visit = (type: string) => {
    if (out.has(type) || !usable(type)) return
    out.add(type)
    for (const child of r.entries[type].nesting?.children ?? []) visit(child)
    for (const e of all) if ((e.nesting?.parents ?? []).includes(type)) visit(e.type)
  }
  for (const e of all) if ((e.capabilities ?? []).some((c) => capabilities.includes(c))) visit(e.type)
  for (const type of [...out]) {
    const target = r.entries[type].fallback?.type
    if (target && usable(target)) out.add(target)
  }
  return [...out].sort()
}

/** Every agent-visible name: registered types, plus each Atlas component no entry aliases (DEC-092). */
export function fullCatalog(r: Registry = registry): string[] {
  const aliased = new Set(Object.values(r.entries).map((e) => e.aliasOf).filter((a): a is string => !!a))
  return [...new Set([...Object.keys(r.entries), ...r.components.filter((c) => !aliased.has(c))])].sort()
}

export function catalogFor(req: CatalogRequest, r: Registry = registry, options: FilterOptions = {}): Catalog {
  return { task: req.task, capabilities: [...req.capabilities].sort(), types: filter(req.capabilities, r, options) }
}

/** The registry a session validates against: the catalog's entries only; every other agent-visible name is withheld. */
export function restrict(r: Registry, catalog: Catalog): Registry {
  const keep = new Set(catalog.types)
  const pick = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).filter(([k]) => keep.has(k)))
  return {
    ...r,
    entries: pick(r.entries),
    schemas: pick(r.schemas),
    aliases: pick(r.aliases),
    withheld: fullCatalog(r).filter((n) => !keep.has(n)),
  }
}
