import type { EffectForgeProject } from "@effectforge/schema";
import {
  projectJsonFile,
  README_FOOTER,
  resolveExportOptions,
  THIRD_PARTY_NOTICES,
} from "./shared.js";
import type { EffectForgeExporter, ExportOptions, ExportResult } from "./types.js";

export class NextJsExporter implements EffectForgeExporter {
  readonly target = "nextjs" as const;

  export(project: EffectForgeProject, options: ExportOptions = {}): ExportResult {
    const { packageName, runtimeVersion } = resolveExportOptions(project, options);

    const files = [
      {
        path: "package.json",
        content: `${JSON.stringify(
          {
            name: packageName,
            private: true,
            version: "0.1.0",
            scripts: {
              dev: "next dev --port 43124",
              build: "next build --webpack",
              start: "next start --port 43124",
            },
            dependencies: {
              "@effectforge/runtime": runtimeVersion,
              next: "16.3.5",
              react: "19.2.8",
              "react-dom": "19.2.8",
            },
            devDependencies: {
              "@types/node": "^20.19.43",
              "@types/react": "^19.2.0",
              "@types/react-dom": "^19.2.0",
              typescript: "^5.9.3",
            },
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "next.config.ts",
        content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@effectforge/runtime"],
};

export default nextConfig;
`,
      },
      {
        path: "tsconfig.json",
        content: `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["dom", "dom.iterable", "esnext"],
              allowJs: false,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              module: "esnext",
              moduleResolution: "bundler",
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: "react-jsx",
              incremental: true,
              plugins: [{ name: "next" }],
              paths: { "@/*": ["./*"] },
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"],
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "next-env.d.ts",
        content: `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
      },
      {
        path: "app/layout.tsx",
        content: `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${project.name}",
  description: "EffectForge exported effect",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050508" }}>{children}</body>
    </html>
  );
}
`,
      },
      {
        path: "app/page.tsx",
        content: `import { EffectCanvas } from "@/components/EffectCanvas";

export default function HomePage() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <EffectCanvas />
    </main>
  );
}
`,
      },
      {
        path: "components/EffectCanvas.tsx",
        content: `"use client";

import { useEffect, useRef } from "react";
import { mountEffect, type EffectForgeProject, type EffectHandle } from "@effectforge/runtime";
import projectJson from "@/effect-project.json";

const project = projectJson as EffectForgeProject;

export function EffectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    let handle: EffectHandle | null = null;
    let cancelled = false;

    void mountEffect({
      canvas,
      project,
      pointerTarget: container,
    }).then((mounted) => {
      if (cancelled) {
        mounted.dispose();
        return;
      }
      handle = mounted;
    });

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
`,
      },
      projectJsonFile(project, "effect-project.json"),
      {
        path: "README.md",
        content: `# ${project.name}

Next.js export from EffectForge.
${README_FOOTER}`,
      },
      {
        path: "THIRD_PARTY_NOTICES.md",
        content: THIRD_PARTY_NOTICES,
      },
    ];

    return {
      target: this.target,
      packageName,
      projectName: project.name,
      files,
    };
  }
}
