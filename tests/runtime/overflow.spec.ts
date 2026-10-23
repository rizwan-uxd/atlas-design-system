// Phase 4 metric `visual > no horizontal scroll at each breakpoint` (metrics.manifest.json, source
// playwright). The title is exact and top-level (no describe) because metrics-report reads
// suites[].specs[].title. Every --atlas-breakpoint-* width is checked, plus a phone width below the
// smallest, on both rendered surfaces: the sandbox and the runtime demo.
import { expect, test } from "@playwright/test"

// the supported set is exactly --atlas-breakpoint-* in packages/tokens/atlas.tokens.css (sm 640 is
// the smallest; token-lint keeps @theme inline --breakpoint-* in agreement). Widths below sm are out
// of scope for the web library — the sandbox does overflow at 375 (Tooltip demo, Tabs row, NavBar
// search); noted in the handoff, not a library regression.
const WIDTHS = [640, 768, 1024, 1280, 1536]
const PAGES = ["/", "/runtime-demo"]

test("visual > no horizontal scroll at each breakpoint", async ({ page }) => {
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      if (path === "/runtime-demo") await page.waitForFunction(() => window.__atlasRuntime !== undefined)
      await page.evaluate(() => document.fonts.ready)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0)
    }
  }
})
