// The protocol bench's model binding (Phase 6 PR-1, D-C amended by DEC-093): `claude -p --output-format stream-json`
// on the owner's subscription, no SDK. The agent sees only the request: the system prompt is replaced, tools,
// settings, MCP servers and slash commands are off, and the process runs in an empty directory so no CLAUDE.md loads.
// Time to first token therefore includes CLI startup; that is a property of this transport, not of the protocol.
import { spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import readline from "node:readline"
import type { TextStream } from "@atlas/runtime/model-agent"

export type StreamRecord = {
  firstTokenMs: number | null
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number }
  model: string; fallback: boolean; stopReason: string | null; costUsd: number
}

type CliLine = {
  type?: string
  event?: { type?: string; delta?: { type?: string; text?: string; stop_reason?: string | null }; message?: { model?: string; usage?: Usage } }
  total_cost_usd?: number; usage?: Usage; stop_reason?: string
}
type Usage = { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number }

const cwd = () => fs.mkdtempSync(path.join(os.tmpdir(), "atlas-p1-"))

function cliArgs(model: string, system: string, task: string): string[] {
  return ["-p", task, "--output-format", "stream-json", "--include-partial-messages", "--verbose", "--model", model,
    "--system-prompt", system, "--tools", "", "--no-session-persistence", "--setting-sources", "", "--strict-mcp-config",
    "--disable-slash-commands", "--effort", "low"]
}

/** A stream of the model's text, with a record of the run delivered to onDone. A non-zero exit throws. */
export function claudeCliTextStream(model: string, onDone: (r: StreamRecord) => void, t0: number): TextStream {
  return async function* (system, task) {
    const dir = cwd()
    const child = spawn("claude", cliArgs(model, system, task), { cwd: dir, stdio: ["ignore", "pipe", "pipe"] })
    let stderr = ""
    child.stderr.on("data", (d) => { stderr += d })
    const exited = new Promise<number | null>((resolve) => child.on("close", resolve))
    let firstTokenMs: number | null = null
    let started = model, stopReason: string | null = null, costUsd = 0
    let usage: Usage = {}
    try {
      for await (const line of readline.createInterface({ input: child.stdout })) {
        let e: CliLine
        try { e = JSON.parse(line) } catch { continue }
        const ev = e.type === "stream_event" ? e.event : null
        if (ev?.type === "message_start") started = ev.message?.model ?? started
        if (ev?.type === "content_block_delta" && ev.delta?.type === "text_delta") {
          if (firstTokenMs === null) firstTokenMs = performance.now() - t0
          yield ev.delta.text ?? ""
        }
        if (ev?.type === "message_delta") stopReason = ev.delta?.stop_reason ?? stopReason
        if (typeof e.total_cost_usd === "number") { costUsd = e.total_cost_usd; usage = e.usage ?? usage; stopReason = e.stop_reason ?? stopReason }
      }
      const code = await exited
      if (code !== 0) throw new Error(`claude -p exited ${code}: ${stderr.slice(0, 500)}`)
    } finally {
      child.kill()
      fs.rmSync(dir, { recursive: true, force: true })
    }
    onDone({
      firstTokenMs,
      usage: { input: usage.input_tokens ?? 0, output: usage.output_tokens ?? 0, cacheRead: usage.cache_read_input_tokens ?? 0, cacheWrite: usage.cache_creation_input_tokens ?? 0 },
      model: started, fallback: started !== model, stopReason, costUsd,
    })
  }
}

/** Input tokens (fresh + cache) the CLI reports for a prompt; the process is stopped at message_start. */
export async function cliInputTokens(model: string, system: string, task: string): Promise<number> {
  const dir = cwd()
  const child = spawn("claude", cliArgs(model, system, task), { cwd: dir, stdio: ["ignore", "pipe", "ignore"] })
  try {
    for await (const line of readline.createInterface({ input: child.stdout })) {
      let e: CliLine
      try { e = JSON.parse(line) } catch { continue }
      if (e.type === "stream_event" && e.event?.type === "message_start") {
        const u = e.event.message?.usage ?? {}
        return (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)
      }
    }
    throw new Error("claude -p produced no message_start")
  } finally {
    child.kill()
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
