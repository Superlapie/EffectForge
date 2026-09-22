import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@effectforge/core", "@effectforge/schema"],
};

export default nextConfig;
