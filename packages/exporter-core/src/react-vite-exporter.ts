import type { EffectForgeProject } from "@effectforge/schema";
import {
  projectJsonFile,
  README_FOOTER,
  resolveExportOptions,
  THIRD_PARTY_NOTICES,
} from "./shared.js";
import type { EffectForgeExporter, ExportOptions, ExportResult } from "./types.js";

export class ReactViteExporter implements EffectForgeExporter {
  readonly target = "react-vite" as const;

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
            type: "module",
            scripts: {
              dev: "vite",
              build: "tsc --noEmit && vite build",
              preview: "vite preview",
            },
            dependencies: {
              "@effectforge/runtime": runtimeVersion,
              react: "^19.2.0",
              "react-dom": "^19.2.0",
            },
            devDependencies: {
              "@types/react": "^19.2.0",
              "@types/react-dom": "^19.2.0",
              "@vitejs/plugin-react": "^4.7.0",
              typescript: "^5.9.3",
              vite: "^6.3.5",
            },
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
      {
        path: "vite.config.ts",
        content: `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
`,
      },
      {
        path: "tsconfig.json",
        content: `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["ES2022", "DOM", "DOM.Iterable"],
              module: "ESNext",
              moduleResolution: "bundler",
              jsx: "react-jsx",
              strict: true,
              skipLibCheck: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
            },
            include: ["src"],
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "src/main.tsx",
        content: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
      },
      {
        path: "src/App.tsx",
        content: `import { EffectCanvas } from "./EffectCanvas";

export function App() {
  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, background: "#050508" }}>
      <EffectCanvas />
    </main>
  );
}
`,
      },
      {
        path: "src/EffectCanvas.tsx",
        content: `import { useEffect, useRef } from "react";
import { mountEffect, type EffectForgeProject, type EffectHandle } from "@effectforge/runtime";
import projectJson from "./effect-project.json";

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
      projectJsonFile(project),
      {
        path: "README.md",
        content: `# ${project.name}

React + Vite export from EffectForge.
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
