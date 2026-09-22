import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@effectforge/schema",
    "@effectforge/commands",
    "@effectforge/core",
    "@effectforge/editor",
    "@effectforge/project-format",
    "@effectforge/presets",
    "@effectforge/pointer",
    "@effectforge/particles",
    "@effectforge/renderer",
    "@effectforge/renderer-three",
  ],
};

export default nextConfig;
