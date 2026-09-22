import { strToU8, zipSync } from "fflate";
import type { ExportResult } from "./types.js";

/** Pack an export result into a ZIP archive for download. */
export function exportResultToZip(result: ExportResult): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  for (const file of result.files) {
    files[file.path] = strToU8(file.content);
  }
  return zipSync(files, { level: 6 });
}

export function suggestExportZipFilename(result: ExportResult): string {
  const slug = result.packageName || "effectforge-export";
  return `${slug}-${result.target}.zip`;
}
