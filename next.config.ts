import type { NextConfig } from "next";
import path from "path";

// Next.js 16 enables Turbopack by default. We:
//   1. Pin `turbopack.root` to this project so Next stops picking the stray
//      ~/package-lock.json as the workspace root.
//   2. Migrate the old `webpack.resolve.alias` entries to Turbopack's
//      `resolveAlias`, so dev + build both work without a webpack fallback.
const projectRoot = __dirname;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      "@atlas/ui-web": path.resolve(projectRoot, "packages/ui-web/src"),
      "@atlas/tokens": path.resolve(projectRoot, "packages/tokens"),
    },
  },
};

export default nextConfig;