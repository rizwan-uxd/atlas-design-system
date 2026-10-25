// The only SDK import in the repo's TypeScript (Phase 6 PR-1, D-C): Sonnet 5.5 pinned, streaming, thinking off,
// refusal fallback on (a fallback-served rep is excluded by the bench, never measured).
import Anthropic from "@anthropic-ai/sdk"
import type { TextStream } from "@atlas/runtime/model-agent"

export type StreamRecord = {
  firstTokenMs: number | null
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number }
  model: string; fallback: boolean; stopReason: string | null
}

export function anthropicTextStream(client: Anthropic, model: string, onDone: (r: StreamRecord) => void, t0: number): TextStream {
  return async function* (system, task) {
    const stream = client.beta.messages.stream({
      model,
      max_tokens: 4096,
      thinking: { type: "between_tools" },
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: task }],
    })
    let firstTokenMs: number | null = null
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        if (firstTokenMs === null) firstTokenMs = performance.now() - t0
        yield event.delta.text
      }
    }
    const m = await stream.finalMessage()
    const fallback = (m.usage.iterations ?? []).some((e) => e.type === "fallback_message")
    onDone({
      firstTokenMs,
      usage: { input: m.usage.input_tokens, output: m.usage.output_tokens, cacheRead: m.usage.cache_read_input_tokens ?? 0, cacheWrite: m.usage.cache_creation_input_tokens ?? 0 },
      model: m.model, fallback, stopReason: m.stop_reason,
    })
  }
}
