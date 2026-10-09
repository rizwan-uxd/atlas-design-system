import { test, expect } from "@playwright/test"

// One screenshot per sandbox section, light and dark. Sections that animate on their own
// (Spinner, Skeleton, Motion Lab) are skipped; their motion is covered by tests/motion.test.ts.
const SKIP = ["Spinner", "Skeleton", "Motion Lab", "Bar Chart"]

for (const theme of ["light", "dark"] as const) {
  test.describe(theme, () => {
    test("sandbox sections", async ({ page }) => {
      await page.goto("/")
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme)
      await page.evaluate(() => document.fonts.ready)
      const sections = page.locator("section:not(section section)")
      const count = await sections.count()
      expect(count).toBeGreaterThan(20)
      for (let i = 0; i < count; i++) {
        const section = sections.nth(i)
        const title = ((await section.locator("> div").first().textContent()) ?? `section-${i}`).trim()
        if (SKIP.some((s) => title.startsWith(s))) continue
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        await section.scrollIntoViewIfNeeded()
        // soft: report every differing section, not only the first
        await expect.soft(section).toHaveScreenshot(`${theme}-${slug}.png`)
      }
    })
  })
}
