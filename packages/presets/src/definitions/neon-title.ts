import type { EffectForgeProject } from "@effectforge/schema";
import { createProject } from "@effectforge/core";

export function createNeonTitle(seed = 42): EffectForgeProject {
  const project = createProject({
    seed,
    name: "Neon Title",
    layers: [
      {
        id: "layer_neon_title",
        name: "Neon Title",
        kind: "text",
        enabled: true,
        locked: false,
        opacity: 1,
        blendMode: "normal",
        text: "EffectForge",
        fontSize: 72,
        fontWeight: 700,
        alignment: "center",
        lineHeight: 1.1,
        letterSpacing: 4,
        effectMode: "neon-flicker",
        duration: 3,
      },
    ],
  });

  return {
    ...project,
    id: "proj_neon_title",
    metadata: {
      ...project.metadata,
      tags: ["text", "neon", "title"],
    },
  };
}
