// Phase 6 PR-1: a Transport over a model's text stream. It is given the agent request and nothing else; the stream
// function is injected, so this package never imports an SDK. Submits are not answered yet (the bench is one-shot).
// A stream that throws resolves `done` with `error` set, never an unhandled rejection.
import { agentSystemPrompt } from "./agent-prompt"
import { createOpParser } from "./op-stream"
import type { AgentRequest, ClientEvent, ServerOp, Transport } from "./protocol"
import type { UnsequencedOp } from "./stub-agent"

export type TextStream = (system: string, task: string) => AsyncIterable<string>
export type ModelAgent = Transport & { request: AgentRequest; log: Array<ClientEvent | ServerOp>; rejected: string[]; done: Promise<void>; error: unknown; start(): void }

export function createModelAgent(request: AgentRequest, textStream: TextStream): ModelAgent {
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
    done,
    error: null,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    send(event) { log.push(event) },
    start() {
      void (async () => {
        try { for await (const chunk of textStream(agentSystemPrompt(request), request.task)) emit(parser.push(chunk)) }
        catch (e) { agent.error = e }
        finally { emit(parser.end()); resolve() }
      })()
    },
  }
  return agent
}
