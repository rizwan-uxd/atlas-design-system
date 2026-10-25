"use client"
// M4: the Request access form rendered entirely from a JSON protocol tree through packages/registry and
// packages/runtime, inside a Phase 6 session (filtered catalog). The agent is the fixture stub;
// window.__atlasRuntime is the Playwright test surface.
import * as React from "react"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { openSession } from "@atlas/runtime/session"
import { createStubAgent, type StubAgent } from "@atlas/runtime/stub-agent"
import type { AgentRequest, Fixture } from "@atlas/runtime/protocol"
import fixture from "@/packages/runtime/tests/fixtures/request-access.json"
import "@atlas/runtime/runtime.css"
import "./runtime-demo.css"

declare global {
  interface Window {
    __atlasRuntime?: { types: string[]; request: AgentRequest; log(): unknown[]; nodeCount(): number; renders: string[]; inject: StubAgent["inject"] }
  }
}

export function RuntimeDemo() {
  // Phase 6: the agent sees only this session's catalog; the runtime validates against the same subset.
  const session = React.useMemo(() => openSession({ task: "Request access form", capabilities: ["submit"] }), [])
  const agent = React.useMemo(() => createStubAgent(fixture as Fixture, session.request), [session])
  const renders = React.useRef<string[]>([])
  React.useEffect(() => {
    window.__atlasRuntime = {
      types: Object.keys(session.registry.entries),
      request: session.request,
      log: () => agent.log,
      nodeCount: () => document.querySelectorAll("[data-atlas-runtime] [data-atlas-node]").length,
      renders: renders.current,
      inject: agent.inject,
    }
  }, [agent, session])
  const onRender = React.useCallback((path: string) => { renders.current.push(path) }, [])
  return (
    <main className="atlas-runtime-demo">
      <AtlasRuntime registry={session.registry} transport={agent} initial={(fixture as Fixture).render} onRender={onRender} />
    </main>
  )
}
