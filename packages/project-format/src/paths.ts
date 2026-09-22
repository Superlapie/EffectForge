import { ArchiveError } from "./errors.js";

const ALLOWED_PREFIXES = ["assets/", "preview/"];

/** Normalize and validate an archive entry path. */
export function normalizeArchivePath(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("\0")) {
    throw new ArchiveError("INVALID_PATH", `Invalid archive path: "${path}"`);
  }
  if (normalized.includes("..") || normalized.includes(":")) {
    throw new ArchiveError("PATH_TRAVERSAL", `Rejected unsafe archive path: "${path}"`);
  }
  return normalized;
}

/** Returns true when the path is allowed inside an EffectForge archive. */
export function isAllowedArchivePath(path: string): boolean {
  const normalized = normalizeArchivePath(path);
  if (normalized === "project.json" || normalized === "metadata.json") {
    return true;
  }
  return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function assertAllowedArchivePath(path: string): string {
  const normalized = normalizeArchivePath(path);
  if (!isAllowedArchivePath(normalized)) {
    throw new ArchiveError(
      "UNSUPPORTED_ENTRY",
      `Archive entry "${normalized}" is not allowed in an EffectForge project.`,
    );
  }
  return normalized;
}
