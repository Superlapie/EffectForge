import type { EffectForgeProject } from "@effectforge/schema";
import { createCursorAttractSparkles } from "./cursor-attract-sparkles.js";

export function createSparklesBloom(seed = 42): EffectForgeProject {
  const base = createCursorAttractSparkles(seed);
  return {
    ...base,
    id: "proj_sparkles_bloom",
    name: "Sparkles + Bloom",
    layers: [
      ...base.layers,
      {
        id: "layer_bloom",
        name: "Bloom",
        kind: "postfx",
        enabled: true,
        locked: false,
        opacity: 1,
        blendMode: "normal",
        effect: {
          type: "bloom",
          intensity: 0.85,
          threshold: 0.72,
        },
      },
    ],
    metadata: {
      ...base.metadata,
      tags: ["pointer", "attract", "sparkles", "bloom", "postfx"],
    },
  };
}
