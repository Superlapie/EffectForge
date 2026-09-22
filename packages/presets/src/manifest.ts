import type { EffectForgeProject } from "@effectforge/schema";

export const PRESET_FORMAT_NAME = "effectforge-preset" as const;
export const PRESET_FORMAT_VERSION = 1;
export const PRESET_JSON_PATH = "preset.json";

export interface PresetManifest {
  format: typeof PRESET_FORMAT_NAME;
  version: typeof PRESET_FORMAT_VERSION;
  id: string;
  name: string;
  description: string;
  tags: string[];
  author?: string;
  createdAt?: string;
}

export interface CreatePresetManifestOptions {
  id?: string;
  description?: string;
  tags?: string[];
  author?: string;
}

export function slugifyPresetId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "custom-preset"
  );
}

export function createPresetManifest(
  project: EffectForgeProject,
  options: CreatePresetManifestOptions = {},
): PresetManifest {
  return {
    format: PRESET_FORMAT_NAME,
    version: PRESET_FORMAT_VERSION,
    id: options.id ?? slugifyPresetId(project.name),
    name: project.name,
    description: options.description ?? project.metadata.description ?? "",
    tags: options.tags ?? project.metadata.tags ?? [],
    author: options.author ?? project.metadata.author,
    createdAt: new Date().toISOString(),
  };
}

export function parsePresetManifest(raw: string): PresetManifest {
  const parsed = JSON.parse(raw) as PresetManifest;
  if (parsed.format !== PRESET_FORMAT_NAME) {
    throw new Error(`Expected format "${PRESET_FORMAT_NAME}", got "${String(parsed.format)}".`);
  }
  if (parsed.version !== PRESET_FORMAT_VERSION) {
    throw new Error(`Unsupported preset bundle version: ${String(parsed.version)}.`);
  }
  if (!parsed.id || !parsed.name) {
    throw new Error("Preset manifest is missing required id or name.");
  }
  return {
    ...parsed,
    tags: parsed.tags ?? [],
  };
}

export function suggestPresetBundleFilename(manifest: PresetManifest): string {
  return `${slugifyPresetId(manifest.name)}.effectforge-preset`;
}
