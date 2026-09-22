import { validateProjectModel } from "@effectforge/core";
import type { EffectForgeProject } from "@effectforge/schema";
import { strToU8, zipSync } from "fflate";
import { METADATA_JSON_PATH, PROJECT_JSON_PATH } from "./constants.js";
import { ArchiveError } from "./errors.js";
import { assertAllowedArchivePath } from "./paths.js";
import { createArchiveMetadata } from "./metadata.js";

export interface PackProjectOptions {
  /** Optional binary assets keyed by archive-relative paths (e.g. assets/textures/foo.webp). */
  assets?: Record<string, Uint8Array>;
}

export interface PackProjectResult {
  bytes: Uint8Array;
  project: EffectForgeProject;
  metadata: ReturnType<typeof createArchiveMetadata>;
}

function stampProjectForSave(project: EffectForgeProject): EffectForgeProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/** Pack a validated project into a .effectforge ZIP archive. */
export function packProject(
  project: EffectForgeProject,
  options: PackProjectOptions = {},
): PackProjectResult {
  const validation = validateProjectModel(project);
  if (!validation.success || !validation.project) {
    const message = validation.diagnostics.map((d) => d.message).join("; ");
    throw new ArchiveError("INVALID_PROJECT", message || "Project failed validation.");
  }

  const stamped = stampProjectForSave(validation.project);
  const metadata = createArchiveMetadata(stamped);
  const files: Record<string, Uint8Array> = {
    [PROJECT_JSON_PATH]: strToU8(JSON.stringify(stamped, null, 2)),
    [METADATA_JSON_PATH]: strToU8(JSON.stringify(metadata, null, 2)),
  };

  if (options.assets) {
    for (const [path, bytes] of Object.entries(options.assets)) {
      const normalized = assertAllowedArchivePath(path);
      if (!normalized.startsWith("assets/")) {
        throw new ArchiveError(
          "INVALID_ASSET_PATH",
          `Asset path must live under assets/: "${path}"`,
        );
      }
      files[normalized] = bytes;
    }
  }

  const bytes = zipSync(files, { level: 6 });
  return { bytes, project: stamped, metadata };
}

/** Suggest a download filename for a project archive. */
export function suggestArchiveFilename(project: EffectForgeProject): string {
  const slug =
    project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "effect";
  return `${slug}.effectforge`;
}
