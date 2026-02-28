import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixes workspace-root warning when a lockfile exists above this project folder.
  outputFileTracingRoot: path.resolve(process.cwd()),

  // Avoid EPERM on locked `.next/trace` files on some Windows setups.
  distDir: ".next-local",
};

export default nextConfig;