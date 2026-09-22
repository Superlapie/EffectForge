import { validateProject } from "@effectforge/core";
import type { EffectForgeProject } from "@effectforge/schema";
import {
  isAllowedArchivePath,
  MAX_ARCHIVE_BYTES,
  MAX_ENTRY_BYTES,
  MAX_ENTRY_COUNT,
  MAX_UNCOMPRESSED_BYTES,
  normalizeArchivePath,
  PROJECT_JSON_PATH,
} from "@effectforge/project-format";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import {
  createPresetManifest,
  type CreatePresetManifestOptions,
  parsePresetManifest,
  PRESET_JSON_PATH,
  type PresetManifest,
  suggestPresetBundleFilename,
} from "./manifest.js";

export class PresetBundleError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PresetBundleError";
    this.code = code;
  }
}

export interface PackPresetBundleResult {
  bytes: Uint8Array;
  manifest: PresetManifest;
  project: EffectForgeProject;
}

export interface UnpackPresetBundleResult {
  manifest: PresetManifest;
  project: EffectForgeProject;
  assets: Record<string, Uint8Array>;
}

function assertPresetBundlePath(path: string): string {
  const normalized = normalizeArchivePath(path);
  if (normalized === PRESET_JSON_PATH || isAllowedArchivePath(normalized)) {
    return normalized;
  }
  throw new PresetBundleError(
    "UNSUPPORTED_ENTRY",
    `Preset bundle entry "${normalized}" is not allowed.`,
  );
}

/** Pack a project and manifest into a distributable .effectforge-preset archive. */
export function packPresetBundle(
  project: EffectForgeProject,
  options: CreatePresetManifestOptions = {},
): PackPresetBundleResult {
  const validation = validateProject(project);
  if (!validation.success || !validation.project) {
    const message = validation.diagnostics.map((d) => d.message).join("; ");
    throw new PresetBundleError("INVALID_PROJECT", message || "Project failed validation.");
  }

  const stamped = validation.project;
  const manifest = createPresetManifest(stamped, options);
  const files: Record<string, Uint8Array> = {
    [PRESET_JSON_PATH]: strToU8(JSON.stringify(manifest, null, 2)),
    [PROJECT_JSON_PATH]: strToU8(JSON.stringify(stamped, null, 2)),
  };

  const bytes = zipSync(files, { level: 6 });
  return { bytes, manifest, project: stamped };
}

/** Unpack and validate a .effectforge-preset archive. */
export function unpackPresetBundle(bytes: Uint8Array): UnpackPresetBundleResult {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) {
    throw new PresetBundleError(
      "BUNDLE_TOO_LARGE",
      `Preset bundle exceeds maximum size of ${MAX_ARCHIVE_BYTES} bytes.`,
    );
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes);
  } catch {
    throw new PresetBundleError("INVALID_ARCHIVE", "Preset bundle is not a valid ZIP file.");
  }

  const entryNames = Object.keys(entries);
  if (entryNames.length === 0) {
    throw new PresetBundleError("EMPTY_ARCHIVE", "Preset bundle contains no files.");
  }
  if (entryNames.length > MAX_ENTRY_COUNT) {
    throw new PresetBundleError(
      "TOO_MANY_ENTRIES",
      `Preset bundle contains ${entryNames.length} entries (max ${MAX_ENTRY_COUNT}).`,
    );
  }

  let totalUncompressed = 0;
  const assets: Record<string, Uint8Array> = {};

  for (const [path, content] of Object.entries(entries)) {
    const normalized = assertPresetBundlePath(path);
    if (content.byteLength > MAX_ENTRY_BYTES) {
      throw new PresetBundleError(
        "ENTRY_TOO_LARGE",
        `Entry "${normalized}" exceeds maximum size of ${MAX_ENTRY_BYTES} bytes.`,
      );
    }
    totalUncompressed += content.byteLength;
    if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
      throw new PresetBundleError(
        "UNCOMPRESSED_TOO_LARGE",
        `Preset bundle uncompressed size exceeds ${MAX_UNCOMPRESSED_BYTES} bytes.`,
      );
    }
    if (normalized.startsWith("assets/") || normalized.startsWith("preview/")) {
      assets[normalized] = content;
    }
  }

  const presetBytes = entries[PRESET_JSON_PATH];
  if (!presetBytes) {
    throw new PresetBundleError(
      "MISSING_MANIFEST",
      `Preset bundle is missing required ${PRESET_JSON_PATH}.`,
    );
  }

  let manifest: PresetManifest;
  try {
    manifest = parsePresetManifest(strFromU8(presetBytes));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid preset manifest.";
    throw new PresetBundleError("INVALID_MANIFEST", message);
  }

  const projectBytes = entries[PROJECT_JSON_PATH];
  if (!projectBytes) {
    throw new PresetBundleError(
      "MISSING_PROJECT",
      `Preset bundle is missing required ${PROJECT_JSON_PATH}.`,
    );
  }

  let rawProject: Record<string, unknown>;
  try {
    rawProject = JSON.parse(strFromU8(projectBytes)) as Record<string, unknown>;
  } catch {
    throw new PresetBundleError("INVALID_PROJECT_JSON", "project.json is not valid JSON.");
  }

  const validation = validateProject(rawProject);
  if (!validation.success || !validation.project) {
    const message = validation.diagnostics.map((d) => d.message).join("; ");
    throw new PresetBundleError("INVALID_PROJECT", message || "project.json failed validation.");
  }

  return {
    manifest,
    project: validation.project,
    assets,
  };
}

export function packPresetBundleToBlob(
  project: EffectForgeProject,
  options?: CreatePresetManifestOptions,
): Blob {
  const { bytes } = packPresetBundle(project, options);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/zip" });
}

export function downloadPresetBundle(
  project: EffectForgeProject,
  options?: CreatePresetManifestOptions,
  filename?: string,
): void {
  const { bytes, manifest } = packPresetBundle(project, options);
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? suggestPresetBundleFilename(manifest);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function unpackPresetBundleFromFile(file: File): Promise<UnpackPresetBundleResult> {
  const buffer = await file.arrayBuffer();
  return unpackPresetBundle(new Uint8Array(buffer));
}

export { suggestPresetBundleFilename };
