// Phase 4: app/runtime-demo joins the visual-regression surface. One screenshot per theme of the
// whole rendered runtime tree. Baselines are linux screenshots made by the "Visual baseline"
// workflow and committed under tests/visual/ (see playwright.config.ts and docs/HARNESS.md).
import { expect, test } from "@playwright/test"

for (const theme of ["light", "dark"] as const) {
  test.describe(theme, () => {
    test("runtime demo", async ({ page }) => {
      await page.goto("/runtime-demo")
      await page.waitForFunction(() => window.__atlasRuntime !== undefined)
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.locator("[data-atlas-runtime]")).toHaveScreenshot(`${theme}-runtime-demo.png`)
    })
  })
}
