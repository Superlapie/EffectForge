"use client";

import type { EditorController } from "@effectforge/editor";
import {
  exportProject,
  exportResultToZip,
  suggestExportZipFilename,
  type ExportTarget,
} from "@effectforge/exporter-core";

export function downloadExportedCode(controller: EditorController, target: ExportTarget): void {
  const { project } = controller.getState();
  const result = exportProject(project, target);
  const bytes = exportResultToZip(result);
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = suggestExportZipFilename(result);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
