import { validateProjectModel } from "@effectforge/core";
import type { EffectForgeProject } from "@effectforge/schema";
import { NextJsExporter } from "./nextjs-exporter.js";
import { ReactViteExporter } from "./react-vite-exporter.js";
import { DEFAULT_RUNTIME_VERSION, slugifyPackageName } from "./shared.js";
import type { EffectForgeExporter, ExportOptions, ExportResult, ExportTarget } from "./types.js";
import { VanillaExporter } from "./vanilla-exporter.js";

const EXPORTERS: Record<ExportTarget, EffectForgeExporter> = {
  vanilla: new VanillaExporter(),
  "react-vite": new ReactViteExporter(),
  nextjs: new NextJsExporter(),
};

export function getExporter(target: ExportTarget): EffectForgeExporter {
  const exporter = EXPORTERS[target];
  if (!exporter) {
    throw new Error(`Unknown export target: ${target}`);
  }
  return exporter;
}

export function listExportTargets(): ExportTarget[] {
  return Object.keys(EXPORTERS) as ExportTarget[];
}

/** Export a validated project to a generated file tree. */
export function exportProject(
  project: EffectForgeProject,
  target: ExportTarget,
  options: ExportOptions = {},
): ExportResult {
  const validation = validateProjectModel(project);
  if (!validation.success || !validation.project) {
    const message = validation.diagnostics.map((d) => d.message).join("; ");
    throw new Error(message || "Project failed validation.");
  }
  return getExporter(target).export(validation.project, options);
}

export {
  DEFAULT_RUNTIME_VERSION,
  slugifyPackageName,
  THIRD_PARTY_NOTICES,
} from "./shared.js";
export { VanillaExporter } from "./vanilla-exporter.js";
export { ReactViteExporter } from "./react-vite-exporter.js";
export { NextJsExporter } from "./nextjs-exporter.js";
export type {
  EffectForgeExporter,
  ExportOptions,
  ExportResult,
  ExportTarget,
  ExportedFile,
} from "./types.js";
export {
  exportResultToZip,
  suggestExportZipFilename,
} from "./zip.js";
