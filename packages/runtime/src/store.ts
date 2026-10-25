// One reducer over sequenced server ops. Patches copy only the nodes on the pointer's path (structural sharing),
// so a memoised renderer skips every untouched subtree; that is "patch updates only the addressed subtree".
import type { Registry } from "@atlas/registry/lib"
import { findMarkup } from "./markup"
import { validateTree } from "./validate"
import type { Issue, SafeItem, SafeNode, ServerOp } from "./protocol"

export type RuntimeState = {
  root: SafeNode | null
  values: Record<string, string>
  errors: Record<string, string>
  lastSeq: number
  issues: Issue[]
  acks: number[]
  /** seq of the last op whose validation produced a fallback node; drives the fallback latency mark. */
  fallbackSeq: number | null
}
export type Action = { kind: "server"; op: ServerOp } | { kind: "input"; path: string; value: string }

export const initialState: RuntimeState = { root: null, values: {}, errors: {}, lastSeq: 0, issues: [], acks: [], fallbackSeq: null }

const FALLBACK_CODES = new Set(["malformed", "unknown-type", "out-of-catalog", "missing-required"])

function repath(item: SafeItem, path: string): SafeItem {
  if (typeof item === "string" || item.path === path) return item
  const slots = Object.fromEntries(Object.entries(item.slots).map(([k, v]) => [k, v.map((c, i) => repath(c, `${path}/slots/${k}/${i}`))]))
  return { ...item, path, slots }
}

/** Replace, insert (index === length) or remove (node null) at a pointer; null when the pointer misses. */
function applyPatch(root: SafeNode, at: string, raw: unknown, r: Registry, issues: Issue[]): SafeNode | null {
  const segs = at.split("/").filter(Boolean).filter((s, i) => !(i % 3 === 0 && s === "slots"))
  const leafSlot = segs[segs.length - 2], leafIndex = Number(segs[segs.length - 1])
  const update = (parent: SafeNode): SafeNode | null => {
    const items = parent.slots[leafSlot] ?? []
    if (!(r.entries[parent.type].slots ?? []).includes(leafSlot) || !Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex > items.length) return null
    const path = `${parent.path}/slots/${leafSlot}/${leafIndex}`
    const next = [...items]
    if (raw === null) next.splice(leafIndex, 1)
    else {
      const { node, issues: found } = validateTree(raw, r, path, parent.type)
      issues.push(...found)
      if (node) next.splice(leafIndex, leafIndex === items.length ? 0 : 1, node)
      else if (leafIndex < items.length) next.splice(leafIndex, 1)
    }
    return { ...parent, slots: { ...parent.slots, [leafSlot]: next.map((c, i) => repath(c, `${parent.path}/slots/${leafSlot}/${i}`)) } }
  }
  const walk = (node: SafeNode, rest: string[]): SafeNode | null => {
    if (!rest.length) return update(node)
    const [slot, indexText, ...more] = rest
    const items = node.slots[slot]
    const child = items?.[Number(indexText)]
    if (!child || typeof child === "string") return null
    const next = walk(child, more)
    return next && { ...node, slots: { ...node.slots, [slot]: items.map((c, i) => (i === Number(indexText) ? next : c)) } }
  }
  return walk(root, segs.slice(0, -2))
}

export function reduce(r: Registry) {
  return function step(s: RuntimeState, a: Action): RuntimeState {
    if (a.kind === "input") return { ...s, values: { ...s.values, [a.path]: a.value } }
    const op = a.op
    if (op.seq <= s.lastSeq) return { ...s, issues: [...s.issues, { path: "", code: "stale-seq", detail: `seq ${op.seq} after ${s.lastSeq}` }] }
    const issues: Issue[] = []
    let next: RuntimeState = { ...s, lastSeq: op.seq }
    if (op.op === "render") {
      const v = validateTree(op.root, r)
      issues.push(...v.issues)
      next = { ...next, root: v.node }
    } else if (op.op === "patch") {
      const root = next.root ? applyPatch(next.root, op.at, op.node, r, issues) : null
      if (root) next = { ...next, root }
      else issues.push({ path: op.at, code: "bad-pointer", detail: `no slot position at ${op.at}` })
    } else if (op.op === "state") {
      const { error, value } = op.value
      if (typeof error === "string" && findMarkup(error)) issues.push({ path: op.path, code: "markup", detail: "error text contains markup" })
      else if (error === null) next = { ...next, errors: Object.fromEntries(Object.entries(next.errors).filter(([k]) => k !== op.path)) }
      else if (typeof error === "string") next = { ...next, errors: { ...next.errors, [op.path]: error } }
      if (typeof value === "string") next = { ...next, values: { ...next.values, [op.path]: value } }
    } else if (op.op === "ack") {
      next = { ...next, acks: [...next.acks, op.ack] }
    }
    const fallback = issues.some((i) => FALLBACK_CODES.has(i.code))
    return { ...next, issues: issues.length ? [...s.issues, ...issues] : s.issues, fallbackSeq: fallback ? op.seq : next.fallbackSeq }
  }
}
