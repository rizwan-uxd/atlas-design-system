import { defineConfig, devices } from "@playwright/test"

// Visual regression for the sandbox (app/page.tsx). Baselines are platform-specific
// (font rendering), so only the linux ones CI produces are committed; see docs/HARNESS.md.
export default defineConfig({
  testDir: "tests/visual",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  use: { baseURL: "http://localhost:3031", viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" },
  projects: [{
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: 1280, height: 900 },
      // locally, PW_CHROMIUM can point at an already-installed Chromium so no browser is downloaded
      launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
    },
  }],
  webServer: {
    // its own port so a dev server from another checkout on 3030 is never mistaken for this one
    command: process.env.CI ? "npm run build && npx next start --port 3031" : "npx next dev --port 3031",
    url: "http://localhost:3031",
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "ignore",
    timeout: 240_000,
  },
})
