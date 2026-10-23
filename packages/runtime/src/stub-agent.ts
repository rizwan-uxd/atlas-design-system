// The M4 stand-in for an agent: it answers submits from fixture ops and never calls a model. Its own seq starts
// after the fixture's render op. `log` is the wire as the client saw it; the Playwright tests read it.
import type { ClientEvent, Fixture, ServerOp, Transport } from "./protocol"

export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
export type UnsequencedOp = DistributiveOmit<ServerOp, "seq">
export type StubAgent = Transport & { log: Array<ClientEvent | ServerOp>; inject(op: UnsequencedOp): void }

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function createStubAgent(fixture: Fixture, delayMs = 0): StubAgent {
  const listeners = new Set<(op: ServerOp) => void>()
  const log: Array<ClientEvent | ServerOp> = [fixture.render]
  let seq = fixture.render.seq
  let succeeded = false
  const emit = (ops: UnsequencedOp[]) => setTimeout(() => {
    for (const op of ops) {
      const stamped = { ...op, seq: ++seq } as ServerOp
      log.push(stamped)
      for (const l of listeners) l(stamped)
    }
  }, delayMs)
  const responses = (key: string): UnsequencedOp[] =>
    (fixture.responses[key] ?? []).map((op) => Object.fromEntries(Object.entries(op).filter(([k]) => k !== "seq")) as UnsequencedOp)

  return {
    log,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    inject(op) { emit([op]) },
    send(event) {
      log.push(event)
      const email = event.values["form.email"] ?? "", org = (event.values["form.organisation"] ?? "").trim()
      const ops: UnsequencedOp[] = [{ op: "ack", ack: event.seq },
        ...responses(EMAIL.test(email) ? "clear-email" : "invalid-email"),
        ...responses(org ? "clear-organisation" : "missing-organisation")]
      if (EMAIL.test(email) && org && !succeeded) { succeeded = true; ops.push(...responses("success")) }
      emit(ops)
    },
  }
}
