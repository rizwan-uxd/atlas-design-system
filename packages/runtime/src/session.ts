// Phase 6: a session pairs what the agent sees with what the runtime accepts. Both come from one catalog, built
// here and never from agent output, so the validator's registry is fixed before the agent says anything.
import { catalogFor, registry as fullRegistry, restrict, type CatalogRequest, type Registry } from "@atlas/registry/lib"
import type { AgentRequest } from "./protocol"

/** The catalog as the agent reads it: one JSON line per type, protocol fields only, sorted. */
export function catalogPrompt(r: Registry): string {
  return Object.keys(r.entries).sort().map((type) => {
    const e = r.entries[type]
    return JSON.stringify({ type, props: e.protocolProps ?? {}, slots: e.slots ?? [], nesting: e.nesting ?? {}, events: Object.keys(e.events ?? {}) })
  }).join("\n")
}

export function openSession(req: CatalogRequest, r: Registry = fullRegistry): { request: AgentRequest; registry: Registry } {
  const catalog = catalogFor(req, r)
  const registry = restrict(r, catalog)
  return { request: { task: catalog.task, catalog: { types: catalog.types, prompt: catalogPrompt(registry) } }, registry }
}
