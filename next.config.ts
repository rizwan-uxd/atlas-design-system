import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // turbopack.root override removed — default (project root) is correct.
  // Pointing two levels up was causing Turbopack to scan unintended directories.
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@atlas/ui-web": path.resolve(__dirname, "packages/ui-web/src"),
      "@atlas/tokens": path.resolve(__dirname, "packages/tokens"),
    };
    return config;
  },
};

export default nextConfig;