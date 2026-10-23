// REPORT-ONLY metric (owner decision 2026-10-23): runs from vitest.metrics.config.ts in CI's non-blocking metrics
// step, never in the blocking vitest job. A failure here is a metric reading (metrics-report shows it failing),
// not a broken build. Measured 2026-10-23: payload 513 B / markup 1663 B = 0.308, over the 0.30 gate; 521 B of the
// markup is the runtime's own data-atlas-* tagging, so against component markup alone the ratio is about 0.45.
import * as React from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { registry } from "@atlas/registry/lib"
import { AtlasRuntime, silentTransport } from "@atlas/runtime/Runtime"
import type { ServerOp } from "@atlas/runtime/protocol"
import fixture from "./fixtures/request-access.json"

describe("runtime/protocol >", () => {
  it("payload is at most 30% of rendered markup bytes", () => {
    const op = fixture.render as ServerOp
    const markup = renderToStaticMarkup(<AtlasRuntime registry={registry} transport={silentTransport} initial={op} />)
    const payload = Buffer.byteLength(JSON.stringify(op))
    const bytes = Buffer.byteLength(markup)
    console.info(`runtime/protocol size: payload ${payload} B, markup ${bytes} B, ratio ${(payload / bytes).toFixed(3)}`)
    expect(payload).toBeLessThanOrEqual(0.3 * bytes)
  })
})
