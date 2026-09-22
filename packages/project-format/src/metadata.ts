import type { EffectForgeProject } from "@effectforge/schema";
import { ARCHIVE_VERSION, EFFECTFORGE_PACKAGE_VERSION } from "./constants.js";

export interface ArchiveMetadata {
  archiveVersion: number;
  packagedAt: string;
  effectforgeVersion: string;
  projectId: string;
  projectName: string;
}

export function createArchiveMetadata(project: EffectForgeProject): ArchiveMetadata {
  return {
    archiveVersion: ARCHIVE_VERSION,
    packagedAt: new Date().toISOString(),
    effectforgeVersion: EFFECTFORGE_PACKAGE_VERSION,
    projectId: project.id,
    projectName: project.name,
  };
}

export function parseArchiveMetadata(raw: string): ArchiveMetadata {
  const parsed = JSON.parse(raw) as ArchiveMetadata;
  if (typeof parsed.archiveVersion !== "number") {
    throw new Error("Archive metadata is missing archiveVersion.");
  }
  return parsed;
}
