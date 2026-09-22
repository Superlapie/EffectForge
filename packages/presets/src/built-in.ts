import type { EffectForgeProject } from "@effectforge/schema";
import { createClickBurstStars } from "./definitions/click-burst-stars.js";
import { createCursorAttractSparkles } from "./definitions/cursor-attract-sparkles.js";
import { createCursorRepelMist } from "./definitions/cursor-repel-mist.js";
import { createCursorTrailGlow } from "./definitions/cursor-trail-glow.js";
import { createSparklesBloom } from "./definitions/sparkles-bloom.js";
import { createSparklesRipple } from "./definitions/sparkles-ripple.js";

export type BuiltinPresetId =
  | "cursor-attract-sparkles"
  | "cursor-repel-mist"
  | "click-burst-stars"
  | "cursor-trail-glow"
  | "sparkles-bloom"
  | "sparkles-ripple";

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  create: (seed?: number) => EffectForgeProject;
}

/** Maps built-in project IDs to preset IDs for editor UI sync. */
export const BUILTIN_PRESET_PROJECT_IDS: Record<string, BuiltinPresetId> = {
  proj_cursor_attract_sparkles: "cursor-attract-sparkles",
  proj_cursor_repel_mist: "cursor-repel-mist",
  proj_click_burst_stars: "click-burst-stars",
  proj_cursor_trail_glow: "cursor-trail-glow",
  proj_sparkles_bloom: "sparkles-bloom",
  proj_sparkles_ripple: "sparkles-ripple",
};

export function findBuiltinPresetIdForProject(projectId: string): BuiltinPresetId | undefined {
  return BUILTIN_PRESET_PROJECT_IDS[projectId];
}

export const BUILTIN_PRESETS: EffectPreset[] = [
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
  {
    id: "cursor-trail-glow",
    name: "Cursor Trail Glow",
    description: "Smooth additive ribbon that follows the pointer with a cyan glow.",
    tags: ["pointer", "trail", "glow"],
    create: createCursorTrailGlow,
  },
  {
    id: "sparkles-bloom",
    name: "Sparkles + Bloom",
    description: "Cursor-attract sparkles with a cinematic bloom post-processing pass.",
    tags: ["pointer", "sparkles", "bloom", "postfx"],
    create: createSparklesBloom,
  },
  {
    id: "sparkles-ripple",
    name: "Sparkles + Ripple",
    description: "Cursor-attract sparkles with a subtle animated ripple distortion.",
    tags: ["pointer", "sparkles", "ripple", "distortion"],
    create: createSparklesRipple,
  },
];
