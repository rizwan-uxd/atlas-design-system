import { defineConfig } from "vitest/config"
import base from "./vitest.config"

// Report-only metric tests (*.metric.ts[x]): the blocking `test` job never runs them, so a metric that is honestly
// failing reports as failing in metrics-report without blocking CI. Run: npm run test:metrics
// Spread, not mergeConfig: mergeConfig concatenates `include`, which would rerun the whole blocking suite here.
export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ["packages/**/tests/**/*.metric.{ts,tsx}"],
    reporters: ["default", "json"],
    outputFile: { json: ".metrics/vitest-metrics.json" },
  },
})
