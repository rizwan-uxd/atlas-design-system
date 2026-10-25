// The registry as the runtime reads it: the registry value (registry.ts), the Phase 6 catalog (filter.ts) and
// two lookups.
import { registry, type Registry } from "./registry"

export * from "./registry"
export { catalogFor, filter, fullCatalog, restrict, type Catalog, type CatalogRequest, type FilterOptions } from "./filter"

/** The Atlas component a type name renders: an alias target, a registered entry's aliasOf, or "structural". */
export function resolve(name: string, r: Registry = registry): string | null {
  if (Object.hasOwn(r.aliases, name)) return r.aliases[name]
  if (Object.hasOwn(r.entries, name)) return r.entries[name].aliasOf ?? "structural"
  return null
}

/** A copy of the registry with one type removed, as if its entry were deleted (the M4 exit test). */
export function without(type: string, r: Registry = registry): Registry {
  const drop = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== type))
  return { ...r, entries: drop(r.entries), schemas: drop(r.schemas) }
}
