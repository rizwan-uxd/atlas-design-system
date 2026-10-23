// DEC-080: every type falls back to Alert (neutral, "This content is unavailable"); Alert is the one terminal.
// DEC-082: a target that is not registered renders nothing, so the node is dropped and its siblings stay.
import type { Entry, Registry } from "@atlas/registry/lib"
import type { SafeNode } from "./protocol"

const terminal = (r: Registry): Entry | null => Object.values(r.entries).find((e) => e.fallback?.type === e.type) ?? null

export function fallbackFor(type: string | null, r: Registry, path: string): SafeNode | null {
  const from = type !== null && Object.hasOwn(r.entries, type) ? r.entries[type] : terminal(r)
  if (!from || !from.fallback) return null
  const target = from.fallback.type
  if (!Object.hasOwn(r.entries, target)) return null
  const slots = r.entries[target].slots ?? []
  const slot = slots.includes("description") ? "description" : slots.includes("children") ? "children" : null
  return { type: target, props: { ...(from.fallback.props ?? {}) }, slots: slot ? { [slot]: [from.fallback.message] } : {}, path, fallback: true }
}
