// Phase 6 PR-1: what a model agent is told. The grammar is static and first, the catalog second, so the prefix is
// byte-stable per catalog and caches. The catalog comes only from the request (openSession).
import type { AgentRequest } from "./protocol"

export const PROTOCOL_GRAMMAR = `You build user interfaces by emitting Atlas protocol operations, one JSON object per line (JSONL), and nothing else: no prose, no code fences, no HTML, CSS or JSX.
Operations:
{"op":"render","root":NODE} — exactly once, first, with a small root (its slots may start empty).
{"op":"patch","at":POINTER,"node":NODE} — then append children one at a time. POINTER is the parent's path plus /slots/<slot>/<index>; the root's path is "" and index equals the slot's current length to append.
NODE is {"type":TYPE,"props":{...},"slots":{"<slot>":[NODE or "text", ...]}}.
Use only the types below, only their listed props and slots, and only nest where their nesting allows. Text is plain words.
Catalog (one type per line):
`

export function agentSystemPrompt(request: AgentRequest): string {
  return PROTOCOL_GRAMMAR + request.catalog.prompt
}
