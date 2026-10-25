// The M4 protocol. A server op is sequenced (`seq` strictly increasing); a client event carries its own seq.
// Nodes are `{ type, props, slots }`, the shape of each generated schema in packages/registry/generated/schemas.

export type ProtocolNode = { type: string; props?: Record<string, unknown>; slots?: Record<string, Array<ProtocolNode | string>> }

/** A node after validation: registered type, known props only, every slot checked. `path` is its pointer. */
export type SafeNode = { type: string; props: Record<string, unknown>; slots: Record<string, SafeItem[]>; path: string; fallback?: true }
export type SafeItem = SafeNode | string

export type IssueCode =
  | "malformed" | "unknown-type" | "out-of-catalog" | "nesting" | "unknown-prop" | "invalid-prop" | "markup"
  | "missing-required" | "unknown-slot" | "stale-seq" | "bad-pointer" | "render-error" | "no-fallback"
export type Issue = { path: string; code: IssueCode; detail: string }

export type StateValue = { error?: string | null; value?: string }

export type ServerOp =
  | { op: "render"; seq: number; root: ProtocolNode }
  | { op: "patch"; seq: number; at: string; node: ProtocolNode | null }
  | { op: "state"; seq: number; path: string; value: StateValue }
  | { op: "ack"; seq: number; ack: number }

export type ClientEvent = { kind: "event"; seq: number; type: "submit"; source: string; values: Record<string, string> }

export type Transport = { send(event: ClientEvent): void; subscribe(listener: (op: ServerOp) => void): () => void }

/** What an agent receives (Phase 6): the task and its filtered catalog. Built only by openSession; no server op carries one. */
export type AgentRequest = { task: string; catalog: { types: string[]; prompt: string } }

export type Fixture = { _note: string; render: Extract<ServerOp, { op: "render" }>; responses: Record<string, ServerOp[]> }
