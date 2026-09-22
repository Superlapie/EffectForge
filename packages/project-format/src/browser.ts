import type { EffectForgeProject } from "@effectforge/schema";
import { packProject, suggestArchiveFilename } from "./pack.js";
import { unpackProject, type UnpackProjectResult } from "./unpack.js";

/** Pack a project into a Blob suitable for download in the browser. */
export function packProjectToBlob(project: EffectForgeProject): Blob {
  const { bytes } = packProject(project);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/zip" });
}

/** Trigger a browser download of a .effectforge archive. */
export function downloadProjectArchive(
  project: EffectForgeProject,
  filename?: string,
): void {
  const blob = packProjectToBlob(project);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? suggestArchiveFilename(project);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Read a .effectforge archive from a File input. */
export async function unpackProjectFromFile(file: File): Promise<UnpackProjectResult> {
  const buffer = await file.arrayBuffer();
  return unpackProject(new Uint8Array(buffer));
}
