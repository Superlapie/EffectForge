import type { EffectForgeProject } from "@effectforge/schema";
import {
  BUILTIN_PRESETS,
  BUILTIN_PRESET_PROJECT_IDS,
  findBuiltinPresetIdForProject,
  type BuiltinPresetId,
  type EffectPreset,
} from "./built-in.js";
import { findPreset, listAllPresets } from "./registry.js";

export type PresetId = BuiltinPresetId | (string & {});

export type { BuiltinPresetId, EffectPreset };
export { BUILTIN_PRESETS, BUILTIN_PRESET_PROJECT_IDS, findBuiltinPresetIdForProject };

export function listPresets(): EffectPreset[] {
  return BUILTIN_PRESETS;
}

export function getPreset(id: string): EffectPreset {
  const preset = findPreset(id);
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`);
  }
  return preset;
}

export function createProjectFromPreset(id: string, seed?: number): EffectForgeProject {
  return getPreset(id).create(seed);
}

export {
  packPresetBundle,
  packPresetBundleToBlob,
  unpackPresetBundle,
  unpackPresetBundleFromFile,
  downloadPresetBundle,
  suggestPresetBundleFilename,
  PresetBundleError,
  type PackPresetBundleResult,
  type UnpackPresetBundleResult,
} from "./bundle.js";
export {
  createPresetManifest,
  parsePresetManifest,
  slugifyPresetId,
  PRESET_FORMAT_NAME,
  PRESET_FORMAT_VERSION,
  PRESET_JSON_PATH,
  type PresetManifest,
  type CreatePresetManifestOptions,
} from "./manifest.js";
export {
  clearImportedPresets,
  findPreset,
  importPresetBundle,
  listAllPresets,
  registerImportedPreset,
} from "./registry.js";

export { createCursorAttractSparkles } from "./definitions/cursor-attract-sparkles.js";
export { createCursorRepelMist } from "./definitions/cursor-repel-mist.js";
export { createClickBurstStars } from "./definitions/click-burst-stars.js";
