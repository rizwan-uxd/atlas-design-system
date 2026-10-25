// Phase 6 PR-1: a Transport over a model's text stream. It is given the agent request and nothing else; the stream
// function is injected, so this package never imports an SDK. Submits are not answered yet (the bench is one-shot).
// A stream that throws resolves `done` with `error` set, never an unhandled rejection.
// Phase 7: with a registry, every attempt's validator issues are recorded in `diagnostics`, and an attempt that drew any
// is repaired at most `maxRepairs` times (default 1): the agent is re-asked with the issues, then the runtime's
// fallback takes whatever is still invalid. Unbounded repair would turn a 250 ms budget into seconds. Non-op lines
// are not issues (they stay in `rejected`).
import type { Registry } from "@atlas/registry/lib"
import { agentSystemPrompt } from "./agent-prompt"
import { createOpParser } from "./op-stream"
import type { AgentRequest, ClientEvent, Issue, ServerOp, Transport } from "./protocol"
import type { UnsequencedOp } from "./stub-agent"
import { validateTree } from "./validate"

export type TextStream = (system: string, task: string) => AsyncIterable<string>
export type Diagnostics = { attempt: number; issues: Issue[] }
export type ModelAgent = Transport & {
  request: AgentRequest; log: Array<ClientEvent | ServerOp>; rejected: string[]; diagnostics: Diagnostics[]; repairs: number
  done: Promise<void>; error: unknown; start(): void
}
export type ModelAgentOptions = { registry?: Registry; maxRepairs?: number }

/** The repair ask: the original task plus what the validator rejected, nothing else. */
export function repairTask(task: string, issues: Issue[]): string {
  const lines = issues.slice(0, 10).map((i) => `- ${i.path || "/"} ${i.code}: ${i.detail}`)
  return `${task}\n\nYour previous operations were rejected by the validator:\n${lines.join("\n")}\nEmit the corrected operations only.`
}

export function createModelAgent(request: AgentRequest, textStream: TextStream, options: ModelAgentOptions = {}): ModelAgent {
  const { registry, maxRepairs = 1 } = options
  const listeners = new Set<(op: ServerOp) => void>()
  const log: Array<ClientEvent | ServerOp> = []
  const parser = createOpParser()
  let seq = 0
  let resolve!: () => void
  const done = new Promise<void>((r) => { resolve = r })
  const emit = (ops: UnsequencedOp[]) => {
    for (const op of ops) {
      const stamped = { ...op, seq: ++seq } as ServerOp
      log.push(stamped)
      for (const l of listeners) l(stamped)
    }
  }
  const agent: ModelAgent = {
    request,
    log,
    rejected: parser.rejected,
    diagnostics: [],
    repairs: 0,
    done,
    error: null,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    send(event) { log.push(event) },
    start() {
      void (async () => {
        try {
          let task = request.task
          for (let attempt = 0; ; attempt++) {
            const issues: Issue[] = []
            const check = (ops: UnsequencedOp[]) => {
              if (registry) for (const op of ops) {
                if (op.op === "render") issues.push(...validateTree(op.root, registry).issues)
                else if (op.op === "patch" && op.node !== null) issues.push(...validateTree(op.node, registry).issues)
              }
              return ops
            }
            for await (const chunk of textStream(agentSystemPrompt(request), task)) emit(check(parser.push(chunk)))
            emit(check(parser.end()))
            if (registry) agent.diagnostics.push({ attempt, issues })
            if (issues.length === 0 || attempt >= maxRepairs) break
            agent.repairs++
            task = repairTask(request.task, issues)
          }
        } catch (e) { agent.error = e }
        finally { emit(parser.end()); resolve() }
      })()
    },
  }
  return agent
}
