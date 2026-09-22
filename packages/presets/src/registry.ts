import type { EffectForgeProject } from "@effectforge/schema";
import { BUILTIN_PRESETS, type EffectPreset } from "./built-in.js";
import { unpackPresetBundle, type UnpackPresetBundleResult } from "./bundle.js";
import type { PresetManifest } from "./manifest.js";

const importedPresets = new Map<string, EffectPreset>();

function createImportedPreset(result: UnpackPresetBundleResult): EffectPreset {
  const { manifest, project } = result;
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    tags: manifest.tags,
    create: (seed?: number) =>
      seed === undefined
        ? structuredClone(project)
        : { ...structuredClone(project), seed },
  };
}

/** Built-in presets plus any bundles imported this session. */
export function listAllPresets(): EffectPreset[] {
  return [...BUILTIN_PRESETS, ...importedPresets.values()];
}

export function findPreset(id: string): EffectPreset | undefined {
  return BUILTIN_PRESETS.find((preset) => preset.id === id) ?? importedPresets.get(id);
}

export function importPresetBundle(bytes: Uint8Array): EffectPreset {
  const result = unpackPresetBundle(bytes);
  const preset = createImportedPreset(result);
  importedPresets.set(preset.id, preset);
  return preset;
}

export function registerImportedPreset(
  project: EffectForgeProject,
  manifest: Pick<PresetManifest, "id" | "name" | "description" | "tags">,
): EffectPreset {
  const preset = createImportedPreset({
    manifest: {
      format: "effectforge-preset",
      version: 1,
      ...manifest,
    },
    project,
    assets: {},
  });
  importedPresets.set(preset.id, preset);
  return preset;
}

/** Clear imported presets — intended for tests. */
export function clearImportedPresets(): void {
  importedPresets.clear();
}
