// The registry as the runtime reads it: generated/runtimeRegistry.ts plus three lookups. Authored data lives in
// src/ and aliases.json; nothing here is hand-maintained per component.
import { aliasTable, entries, schemas } from "../generated/runtimeRegistry"

export type ProtocolPropSpec = { values?: string[]; narrowed?: string; required?: boolean }
export type Fallback = { type: string; props?: Record<string, unknown>; message: string }
export type Entry = {
  type: string
  aliasOf: string | null
  kind: "component" | "structural"
  element?: string
  protocolProps?: Record<string, ProtocolPropSpec>
  slots?: string[]
  events?: Record<string, { handler: string }>
  fallback?: Fallback
  nesting?: { parents?: string[]; children?: string[] }
  capabilities?: string[]
}
export type JsonSchema = Record<string, unknown>
export type Registry = { entries: Record<string, Entry>; schemas: Record<string, JsonSchema>; aliases: Record<string, string> }

export const registry: Registry = {
  entries: entries as unknown as Record<string, Entry>,
  schemas: schemas as unknown as Record<string, JsonSchema>,
  aliases: aliasTable,
}

/** The Atlas component a type name renders: an alias target, a registered entry's aliasOf, or "structural". */
export function resolve(name: string, r: Registry = registry): string | null {
  if (Object.hasOwn(r.aliases, name)) return r.aliases[name]
  if (Object.hasOwn(r.entries, name)) return r.entries[name].aliasOf ?? "structural"
  return null
}

/** Registered types for a request: every type with a requested capability, plus everything those may nest. */
export function filter(capabilities: string[], r: Registry = registry): string[] {
  const out = new Set<string>()
  const visit = (type: string) => {
    if (out.has(type) || !Object.hasOwn(r.entries, type)) return
    out.add(type)
    for (const child of r.entries[type].nesting?.children ?? []) visit(child)
  }
  for (const e of Object.values(r.entries)) if ((e.capabilities ?? []).some((c) => capabilities.includes(c))) visit(e.type)
  return [...out].sort()
}

/** A copy of the registry with one type removed, as if its entry were deleted (the M4 exit test). */
export function without(type: string, r: Registry = registry): Registry {
  const { [type]: _entry, ...entries } = r.entries
  const { [type]: _schema, ...schemas } = r.schemas
  return { ...r, entries, schemas }
}
