import { describe, expect, it } from "vitest";
import { hasPostFxLayers, resolvePostFxLayers } from "./resolve.js";

describe("resolvePostFxLayers", () => {
  it("returns enabled postfx layers in order", () => {
    const project = {
      format: "effectforge" as const,
      formatVersion: 1,
      id: "proj_test",
      name: "Test",
      seed: 1,
      canvas: {
        width: 1920,
        height: 1080,
        background: { type: "color" as const, value: "#000000" },
        sizingMode: "fill-container" as const,
        maxDpr: 2,
      },
      timeline: { duration: 6, loop: true, markers: [] },
      layers: [
        {
          id: "layer_bloom",
          name: "Bloom",
          kind: "postfx" as const,
          enabled: true,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          effect: { type: "bloom" as const, intensity: 0.8, threshold: 0.7 },
        },
        {
          id: "layer_vignette",
          name: "Vignette",
          kind: "postfx" as const,
          enabled: false,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          effect: { type: "vignette" as const, darkness: 0.5, offset: 0.5 },
        },
        {
          id: "layer_chromatic",
          name: "Chromatic",
          kind: "postfx" as const,
          enabled: true,
          locked: false,
          opacity: 0.5,
          blendMode: "normal" as const,
          effect: { type: "chromatic-aberration" as const, offset: 0.003 },
        },
      ],
      assets: {},
      exportPreferences: {
        portableSource: false,
        reducedMotionPolicy: "reduce-intensity" as const,
      },
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        tags: [],
      },
    };

    const layers = resolvePostFxLayers(project);
    expect(layers).toHaveLength(2);
    expect(layers[0]?.effect.type).toBe("bloom");
    expect(layers[1]?.effect.type).toBe("chromatic-aberration");
    expect(hasPostFxLayers(project)).toBe(true);
  });
});
