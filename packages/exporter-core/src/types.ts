import type { EffectForgeProject } from "@effectforge/schema";

export type ExportTarget = "vanilla" | "react-vite" | "nextjs";

export interface ExportOptions {
  /** npm package name for the generated project */
  packageName?: string;
  /** @effectforge/runtime version pinned in generated package.json */
  runtimeVersion?: string;
}

export interface ExportedFile {
  path: string;
  content: string;
}

export interface ExportResult {
  target: ExportTarget;
  packageName: string;
  projectName: string;
  files: ExportedFile[];
}

export interface EffectForgeExporter {
  readonly target: ExportTarget;
  export(project: EffectForgeProject, options?: ExportOptions): ExportResult;
}
