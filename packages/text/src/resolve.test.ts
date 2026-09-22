import { describe, expect, it } from "vitest";
import { hasTextLayers, resolveTextLayers } from "./resolve.js";

describe("resolveTextLayers", () => {
  it("returns enabled text layers in order", () => {
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
          id: "layer_title",
          name: "Title",
          kind: "text" as const,
          enabled: true,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          text: "EffectForge",
          fontSize: 64,
          fontWeight: 700,
          alignment: "center" as const,
          lineHeight: 1.2,
          letterSpacing: 0,
          effectMode: "fade" as const,
          duration: 2,
        },
        {
          id: "layer_hidden",
          name: "Hidden",
          kind: "text" as const,
          enabled: false,
          locked: false,
          opacity: 1,
          blendMode: "normal" as const,
          text: "Hidden",
          fontSize: 32,
          fontWeight: 400,
          alignment: "center" as const,
          lineHeight: 1.2,
          letterSpacing: 0,
          effectMode: "stagger" as const,
          duration: 2,
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

    const layers = resolveTextLayers(project);
    expect(layers).toHaveLength(1);
    expect(layers[0]?.layer.text).toBe("EffectForge");
    expect(hasTextLayers(project)).toBe(true);
  });
});
