import { defineConfig } from "vitest/config"
import base from "./vitest.config"

// Phase 6 protocol bench (Tier 3, bench-only, never CI): live model calls. Run via benchmarks/run.sh <label> P1.
// Spread, not mergeConfig: mergeConfig concatenates `include`, which would rerun the whole blocking suite here.
export default defineConfig({
  ...base,
  test: { ...base.test, environment: "node", include: ["benchmarks/protocol/**/*.bench.ts"], testTimeout: 600_000, setupFiles: [] },
})
