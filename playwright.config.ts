import { defineConfig, devices } from "@playwright/test"

// Two projects on one server (DEC-084 (7)): "chromium" is visual regression for the sandbox (app/page.tsx), whose
// baselines are platform-specific (font rendering), so only the linux ones CI produces are committed (see
// docs/HARNESS.md); "runtime-demo" is the M4 runtime metrics on app/runtime-demo. CI runs both in one invocation,
// so the production build happens once.
const chromium = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1280, height: 900 },
  // locally, PW_CHROMIUM can point at an already-installed Chromium so no browser is downloaded
  launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
}

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Tolerance calibrated 2026-10-09. pixelmatch's `threshold` is a squared colour distance: for neutral greys
  // 0.2 (the default) ignores differences under ~53 of 255 levels, which hid the dark-mode Card fill change
  // (background -> surface). 0.01 sees ~3 levels, so every adjacent step of the neutral scale is caught.
  // Local runs are deterministic even at 0, and CI uses the same Linux baselines, so this is not flaky.
  expect: { toHaveScreenshot: { threshold: 0.01, maxDiffPixelRatio: 0.0005, animations: "disabled" } },
  use: { baseURL: "http://localhost:3031", viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" },
  projects: [
    { name: "chromium", testDir: "tests/visual", use: chromium },
    { name: "runtime-demo", testDir: "tests/runtime", use: chromium },
  ],
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
