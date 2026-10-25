// Phase 6 PR-1: the agent streams one protocol op per line (JSONL). Ops are emitted as soon as their line is
// whole; anything that is not a render or patch op is recorded and dropped. The validator still checks every node.
import type { ProtocolNode } from "./protocol"
import type { UnsequencedOp } from "./stub-agent"

export type OpParser = { push(chunk: string): UnsequencedOp[]; end(): UnsequencedOp[]; rejected: string[] }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function toOp(line: string): UnsequencedOp | null {
  let v: unknown
  try { v = JSON.parse(line) } catch { return null }
  if (!isObject(v)) return null
  if (v.op === "render" && isObject(v.root)) return { op: "render", root: v.root as ProtocolNode }
  if (v.op === "patch" && typeof v.at === "string" && (v.node === null || isObject(v.node))) return { op: "patch", at: v.at, node: v.node as ProtocolNode | null }
  return null
}

export function createOpParser(): OpParser {
  let buffer = ""
  const rejected: string[] = []
  const take = (line: string, out: UnsequencedOp[]) => {
    const t = line.trim()
    if (!t || t.startsWith("```")) return
    const op = toOp(t)
    if (op) out.push(op)
    else rejected.push(t)
  }
  return {
    rejected,
    push(chunk) {
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      const out: UnsequencedOp[] = []
      for (const l of lines) take(l, out)
      return out
    },
    end() {
      const out: UnsequencedOp[] = []
      take(buffer, out)
      buffer = ""
      return out
    },
  }
}
