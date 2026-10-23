// The validator repairs or drops; it never throws. Unknown or malformed → fallback; disallowed nesting → dropped;
// unknown, invalid or markup props → stripped (the component default applies); missing required → fallback.
import type { Registry } from "@atlas/registry/lib"
import { fallbackFor } from "./fallback"
import { findMarkup } from "./markup"
import { propValidator } from "./schema"
import type { Issue, SafeItem, SafeNode } from "./protocol"

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

export function validateTree(raw: unknown, r: Registry, at = "", parent: string | null = null): { node: SafeNode | null; issues: Issue[] } {
  const issues: Issue[] = []
  const node = validateNode(raw, r, at, parent, issues)
  return { node, issues }
}

/** DEC-084 (1), nesting is closed: one side must declare the pair and neither may contradict it. */
function nests(r: Registry, parent: string, child: string): boolean {
  const p = r.entries[parent].nesting?.children, c = r.entries[child].nesting?.parents
  const byParent = p ? p.includes(child) : undefined
  const byChild = c ? c.includes(parent) : undefined
  if (byParent === undefined && byChild === undefined) return false
  return byParent !== false && byChild !== false
}

function validateNode(raw: unknown, r: Registry, path: string, parent: string | null, issues: Issue[]): SafeNode | null {
  if (!isObject(raw) || typeof raw.type !== "string") {
    issues.push({ path, code: "malformed", detail: "a node must be an object with a string type" })
    return fallbackFor(null, r, path)
  }
  const type = raw.type
  if (!Object.hasOwn(r.entries, type)) {
    issues.push({ path, code: "unknown-type", detail: `${type} is not a registered type` })
    return fallbackFor(null, r, path)
  }
  if (parent !== null && !nests(r, parent, type)) {
    issues.push({ path, code: "nesting", detail: `${type} may not be placed in ${parent}` })
    return null
  }
  const entry = r.entries[type]

  const props: Record<string, unknown> = {}
  if (raw.props !== undefined && !isObject(raw.props)) issues.push({ path, code: "malformed", detail: `${type}.props must be an object` })
  for (const [name, value] of Object.entries(isObject(raw.props) ? raw.props : {})) {
    const check = propValidator(r, type, name)
    if (!check) { issues.push({ path, code: "unknown-prop", detail: `${type}.${name} is not a protocol prop` }); continue }
    const markup = typeof value === "string" ? findMarkup(value) : null
    if (markup) { issues.push({ path, code: "markup", detail: `${type}.${name} contains ${markup}` }); continue }
    if (!check(value)) { issues.push({ path, code: "invalid-prop", detail: `${type}.${name} is invalid; the component default applies` }); continue }
    props[name] = value
  }
  const missing = Object.entries(entry.protocolProps ?? {}).filter(([n, s]) => s.required && !Object.hasOwn(props, n)).map(([n]) => n)
  if (missing.length) {
    issues.push({ path, code: "missing-required", detail: `${type} needs ${missing.join(", ")}` })
    return fallbackFor(type, r, path)
  }

  const slots: Record<string, SafeItem[]> = {}
  if (raw.slots !== undefined && !isObject(raw.slots)) issues.push({ path, code: "malformed", detail: `${type}.slots must be an object` })
  for (const [name, items] of Object.entries(isObject(raw.slots) ? raw.slots : {})) {
    if (!(entry.slots ?? []).includes(name)) { issues.push({ path, code: "unknown-slot", detail: `${type} has no ${name} slot` }); continue }
    if (!Array.isArray(items)) { issues.push({ path, code: "malformed", detail: `${type}.slots.${name} must be an array` }); continue }
    const out: SafeItem[] = []
    for (const item of items) {
      const at = `${path}/slots/${name}/${out.length}`
      if (typeof item === "string") {
        const markup = findMarkup(item)
        if (markup) issues.push({ path: at, code: "markup", detail: `text contains ${markup}` })
        else out.push(item)
        continue
      }
      const child = validateNode(item, r, at, type, issues)
      if (child) out.push(child)
    }
    slots[name] = out
  }
  return { type, props, slots, path }
}
