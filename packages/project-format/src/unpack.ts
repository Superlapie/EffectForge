import { validateProject } from "@effectforge/core";
import type { EffectForgeProject } from "@effectforge/schema";
import { strFromU8, unzipSync } from "fflate";
import {
  MAX_ARCHIVE_BYTES,
  MAX_ENTRY_BYTES,
  MAX_ENTRY_COUNT,
  MAX_UNCOMPRESSED_BYTES,
  METADATA_JSON_PATH,
  PROJECT_JSON_PATH,
} from "./constants.js";
import { ArchiveError } from "./errors.js";
import { assertAllowedArchivePath } from "./paths.js";
import { parseArchiveMetadata, type ArchiveMetadata } from "./metadata.js";

export interface UnpackProjectResult {
  project: EffectForgeProject;
  metadata: ArchiveMetadata | null;
  assets: Record<string, Uint8Array>;
  diagnostics: ReturnType<typeof validateProject>["diagnostics"];
}

function assertArchiveSize(bytes: Uint8Array): void {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) {
    throw new ArchiveError(
      "ARCHIVE_TOO_LARGE",
      `Archive exceeds maximum size of ${MAX_ARCHIVE_BYTES} bytes.`,
    );
  }
}

/** Unpack a .effectforge archive into a validated project and optional assets. */
export function unpackProject(bytes: Uint8Array): UnpackProjectResult {
  assertArchiveSize(bytes);

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes);
  } catch {
    throw new ArchiveError("INVALID_ARCHIVE", "Archive is not a valid ZIP file.");
  }

  const entryNames = Object.keys(entries);
  if (entryNames.length === 0) {
    throw new ArchiveError("EMPTY_ARCHIVE", "Archive contains no files.");
  }
  if (entryNames.length > MAX_ENTRY_COUNT) {
    throw new ArchiveError(
      "TOO_MANY_ENTRIES",
      `Archive contains ${entryNames.length} entries (max ${MAX_ENTRY_COUNT}).`,
    );
  }

  let totalUncompressed = 0;
  const assets: Record<string, Uint8Array> = {};

  for (const [path, content] of Object.entries(entries)) {
    const normalized = assertAllowedArchivePath(path);
    if (content.byteLength > MAX_ENTRY_BYTES) {
      throw new ArchiveError(
        "ENTRY_TOO_LARGE",
        `Entry "${normalized}" exceeds maximum size of ${MAX_ENTRY_BYTES} bytes.`,
      );
    }
    totalUncompressed += content.byteLength;
    if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
      throw new ArchiveError(
        "UNCOMPRESSED_TOO_LARGE",
        `Archive uncompressed size exceeds ${MAX_UNCOMPRESSED_BYTES} bytes.`,
      );
    }
    if (normalized.startsWith("assets/") || normalized.startsWith("preview/")) {
      assets[normalized] = content;
    }
  }

  const projectBytes = entries[PROJECT_JSON_PATH];
  if (!projectBytes) {
    throw new ArchiveError("MISSING_PROJECT", `Archive is missing required ${PROJECT_JSON_PATH}.`);
  }

  let rawProject: Record<string, unknown>;
  try {
    rawProject = JSON.parse(strFromU8(projectBytes)) as Record<string, unknown>;
  } catch {
    throw new ArchiveError("INVALID_PROJECT_JSON", "project.json is not valid JSON.");
  }

  const validation = validateProject(rawProject);
  if (!validation.success || !validation.project) {
    const message = validation.diagnostics.map((d) => d.message).join("; ");
    throw new ArchiveError("INVALID_PROJECT", message || "project.json failed validation.");
  }

  let metadata: ArchiveMetadata | null = null;
  const metadataBytes = entries[METADATA_JSON_PATH];
  if (metadataBytes) {
    try {
      metadata = parseArchiveMetadata(strFromU8(metadataBytes));
    } catch {
      throw new ArchiveError("INVALID_METADATA", "metadata.json is not valid.");
    }
  }

  return {
    project: validation.project,
    metadata,
    assets,
    diagnostics: validation.diagnostics,
  };
}
