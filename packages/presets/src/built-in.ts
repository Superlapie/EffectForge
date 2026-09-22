import type { EffectForgeProject } from "@effectforge/schema";
import { createClickBurstStars } from "./definitions/click-burst-stars.js";
import { createCursorAttractSparkles } from "./definitions/cursor-attract-sparkles.js";
import { createCursorRepelMist } from "./definitions/cursor-repel-mist.js";

export type BuiltinPresetId =
  | "cursor-attract-sparkles"
  | "cursor-repel-mist"
  | "click-burst-stars";

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  create: (seed?: number) => EffectForgeProject;
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
];
