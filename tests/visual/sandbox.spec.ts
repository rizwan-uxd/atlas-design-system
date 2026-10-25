import { test, expect } from "@playwright/test"

// One screenshot per sandbox section, per brand and theme. Sections that animate on their own
// (Spinner, Skeleton, Motion Lab) are skipped; their motion is covered by tests/motion.test.ts.
// Atlas keeps its original describe and file names (light-*, dark-*) so its baselines are untouched;
// other brands add <brand>-light-* and <brand>-dark-* (M5.6, DEC-091).
const SKIP = ["Spinner", "Skeleton", "Motion Lab", "Bar Chart"]

for (const brand of ["atlas", "warm"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test.describe(brand === "atlas" ? theme : `${brand} ${theme}`, () => {
      test("sandbox sections", async ({ page }) => {
        await page.goto("/")
        await page.evaluate(([t, b]) => {
          document.documentElement.setAttribute("data-theme", t)
          if (b === "atlas") document.documentElement.removeAttribute("data-brand")
          else document.documentElement.setAttribute("data-brand", b)
        }, [theme, brand] as const)
        await page.evaluate(() => document.fonts.ready)
        const sections = page.locator("section:not(section section)")
        const count = await sections.count()
        expect(count).toBeGreaterThan(20)
        const prefix = brand === "atlas" ? "" : `${brand}-`
        for (let i = 0; i < count; i++) {
          const section = sections.nth(i)
          const title = ((await section.locator("> div").first().textContent()) ?? `section-${i}`).trim()
          if (SKIP.some((s) => title.startsWith(s))) continue
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          await section.scrollIntoViewIfNeeded()
          // soft: report every differing section, not only the first
          await expect.soft(section).toHaveScreenshot(`${prefix}${theme}-${slug}.png`)
        }
      })
    })
  }
}
