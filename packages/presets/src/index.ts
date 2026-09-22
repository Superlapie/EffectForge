import type { EffectForgeProject } from "@effectforge/schema";
import { createClickBurstStars } from "./definitions/click-burst-stars.js";
import { createCursorAttractSparkles } from "./definitions/cursor-attract-sparkles.js";
import { createCursorRepelMist } from "./definitions/cursor-repel-mist.js";

export type PresetId =
  | "cursor-attract-sparkles"
  | "cursor-repel-mist"
  | "click-burst-stars";

export interface EffectPreset {
  id: PresetId;
  name: string;
  description: string;
  tags: string[];
  create: (seed?: number) => EffectForgeProject;
}

export const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: "cursor-attract-sparkles",
    name: "Cursor Attract Sparkles",
    description: "Warm sparkles that flow toward the pointer with soft additive glow.",
    tags: ["pointer", "attract", "sparkles"],
    create: createCursorAttractSparkles,
  },
  {
    id: "cursor-repel-mist",
    name: "Cursor Repel Mist",
    description: "Cool mist particles that part around the cursor.",
    tags: ["pointer", "repel", "mist"],
    create: createCursorRepelMist,
  },
  {
    id: "click-burst-stars",
    name: "Click Burst Stars",
    description: "Ambient starfield with colorful bursts on click.",
    tags: ["pointer", "click", "burst"],
    create: createClickBurstStars,
  },
];

export function listPresets(): EffectPreset[] {
  return EFFECT_PRESETS;
}

export function getPreset(id: PresetId): EffectPreset {
  const preset = EFFECT_PRESETS.find((entry) => entry.id === id);
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`);
  }
  return preset;
}

export function createProjectFromPreset(id: PresetId, seed?: number): EffectForgeProject {
  return getPreset(id).create(seed);
}

export { createCursorAttractSparkles } from "./definitions/cursor-attract-sparkles.js";
export { createCursorRepelMist } from "./definitions/cursor-repel-mist.js";
export { createClickBurstStars } from "./definitions/click-burst-stars.js";
