import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./packages/ui-web/tests/setup.ts"],
    include: ["packages/ui-web/tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["packages/ui-web/src/**"],
      exclude: ["**/index.ts"],
    },
  },
  resolve: {
    alias: {
      "@atlas/ui-web": path.resolve(__dirname, "packages/ui-web/src"),
      "@atlas/tokens": path.resolve(__dirname, "packages/tokens"),
      "@": path.resolve(__dirname, "."),
    },
  },
})
