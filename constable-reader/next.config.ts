import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside another project's folder; keep Turbopack from adopting the parent as its root.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
