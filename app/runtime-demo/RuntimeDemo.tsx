"use client"
// M4: the Request access form rendered entirely from a JSON protocol tree through packages/registry and
// packages/runtime. The agent is the fixture stub; window.__atlasRuntime is the Playwright test surface.
import * as React from "react"
import { registry } from "@atlas/registry/lib"
import { AtlasRuntime } from "@atlas/runtime/Runtime"
import { createStubAgent, type StubAgent } from "@atlas/runtime/stub-agent"
import type { Fixture } from "@atlas/runtime/protocol"
import fixture from "@/packages/runtime/tests/fixtures/request-access.json"
import "@atlas/runtime/runtime.css"
import "./runtime-demo.css"

declare global {
  interface Window {
    __atlasRuntime?: { types: string[]; log(): unknown[]; nodeCount(): number; renders: string[]; inject: StubAgent["inject"] }
  }
}

export function RuntimeDemo() {
  const agent = React.useMemo(() => createStubAgent(fixture as Fixture), [])
  const renders = React.useRef<string[]>([])
  React.useEffect(() => {
    window.__atlasRuntime = {
      types: Object.keys(registry.entries),
      log: () => agent.log,
      nodeCount: () => document.querySelectorAll("[data-atlas-runtime] [data-atlas-node]").length,
      renders: renders.current,
      inject: agent.inject,
    }
  }, [agent])
  const onRender = React.useCallback((path: string) => { renders.current.push(path) }, [])
  return (
    <main className="atlas-runtime-demo">
      <AtlasRuntime registry={registry} transport={agent} initial={(fixture as Fixture).render} onRender={onRender} />
    </main>
  )
}
