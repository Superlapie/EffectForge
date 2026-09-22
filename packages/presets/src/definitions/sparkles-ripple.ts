import type { EffectForgeProject } from "@effectforge/schema";
import { createCursorAttractSparkles } from "./cursor-attract-sparkles.js";

export function createSparklesRipple(seed = 42): EffectForgeProject {
  const base = createCursorAttractSparkles(seed);
  return {
    ...base,
    id: "proj_sparkles_ripple",
    name: "Sparkles + Ripple",
    layers: [
      ...base.layers,
      {
        id: "layer_ripple",
        name: "Ripple",
        kind: "distortion",
        enabled: true,
        locked: false,
        opacity: 0.65,
        blendMode: "normal",
        effect: {
          type: "ripple",
          amplitude: 0.015,
          frequency: 24,
          speed: 1.5,
        },
      },
    ],
    metadata: {
      ...base.metadata,
      tags: ["pointer", "attract", "sparkles", "ripple", "distortion"],
    },
  };
}
