import { describe, expect, it } from "vitest";
import { hasDistortionLayers, resolveDistortionLayers } from "./resolve.js";

describe("resolveDistortionLayers", () => {
  it("returns enabled distortion layers in order", () => {
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
          id: "layer_ripple",
          name: "Ripple",
          kind: "distortion" as const,
          enabled: true,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          effect: {
            type: "ripple" as const,
            amplitude: 0.02,
            frequency: 20,
            speed: 2,
          },
        },
        {
          id: "layer_lens",
          name: "Lens",
          kind: "distortion" as const,
          enabled: false,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          effect: { type: "lens" as const, strength: 0.5, radius: 0.3 },
        },
        {
          id: "layer_haze",
          name: "Heat Haze",
          kind: "distortion" as const,
          enabled: true,
          locked: false,
          opacity: 0.75,
          blendMode: "normal" as const,
          effect: { type: "heat-haze" as const, intensity: 0.5, speed: 1 },
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

    const layers = resolveDistortionLayers(project);
    expect(layers).toHaveLength(2);
    expect(layers[0]?.effect.type).toBe("ripple");
    expect(layers[1]?.effect.type).toBe("heat-haze");
    expect(hasDistortionLayers(project)).toBe(true);
  });
});
