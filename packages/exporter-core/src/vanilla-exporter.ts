import type { EffectForgeProject } from "@effectforge/schema";
import {
  projectJsonFile,
  README_FOOTER,
  resolveExportOptions,
  THIRD_PARTY_NOTICES,
} from "./shared.js";
import type { EffectForgeExporter, ExportOptions, ExportResult } from "./types.js";

export class VanillaExporter implements EffectForgeExporter {
  readonly target = "vanilla" as const;

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
              build: "vite build",
              preview: "vite preview",
            },
            dependencies: {
              "@effectforge/runtime": runtimeVersion,
            },
            devDependencies: {
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
    <style>
      html, body { margin: 0; height: 100%; background: #050508; }
      #app { width: 100%; height: 100%; }
      canvas { display: block; width: 100%; height: 100%; touch-action: none; }
    </style>
  </head>
  <body>
    <div id="app"><canvas id="effect-canvas"></canvas></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
      },
      {
        path: "vite.config.ts",
        content: `import { defineConfig } from "vite";

export default defineConfig({
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
              module: "ESNext",
              moduleResolution: "bundler",
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
        path: "src/main.ts",
        content: `import { mountEffect } from "@effectforge/runtime";
import project from "./effect-project.json";

const canvas = document.getElementById("effect-canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Effect canvas element not found");
}

void (async () => {
  const handle = await mountEffect({ canvas, project });

  window.addEventListener("beforeunload", () => {
    handle.dispose();
  });
})();
`,
      },
      projectJsonFile(project),
      {
        path: "README.md",
        content: `# ${project.name}

Vanilla TypeScript + Vite export from EffectForge.
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
