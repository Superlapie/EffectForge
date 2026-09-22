import { describe, expect, it } from "vitest";
import { EffectForgeProjectSchema, CURRENT_FORMAT_VERSION } from "./project.js";

describe("EffectForgeProjectSchema", () => {
  it("validates a minimal project document", () => {
    const project = {
      format: "effectforge",
      formatVersion: CURRENT_FORMAT_VERSION,
      id: "proj_test",
      name: "Test Project",
      seed: 42,
      canvas: {
        width: 1920,
        height: 1080,
        background: { type: "color", value: "#050508" },
      },
      timeline: { duration: 6, loop: true },
      layers: [],
      assets: {},
    };

    const result = EffectForgeProjectSchema.safeParse(project);
    expect(result.success).toBe(true);
  });

  it("rejects invalid format name", () => {
    const project = {
      format: "other",
      formatVersion: 1,
      id: "proj_test",
      name: "Test",
      seed: 0,
      canvas: {
        width: 100,
        height: 100,
        background: { type: "color", value: "#000000" },
      },
      timeline: { duration: 1 },
      layers: [],
      assets: {},
    };

    const result = EffectForgeProjectSchema.safeParse(project);
    expect(result.success).toBe(false);
  });

  it("validates particle layer discriminated union", () => {
    const project = {
      format: "effectforge",
      formatVersion: CURRENT_FORMAT_VERSION,
      id: "proj_particles",
      name: "Particles",
      seed: 123,
      canvas: {
        width: 800,
        height: 600,
        background: { type: "color", value: "#000000" },
      },
      timeline: { duration: 4, loop: true },
      layers: [
        {
          id: "layer_1",
          name: "Stardust",
          kind: "particles",
          emitter: {
            shape: { type: "point" },
            rate: 100,
            maxParticles: 5000,
          },
          lifetime: { kind: "constant", value: 2 },
          speed: { kind: "random-range", min: 0.5, max: 2 },
          size: { kind: "constant", value: 4 },
          color: { kind: "constant", value: "#ffffff" },
          initialOpacity: { kind: "constant", value: 1 },
        },
      ],
      assets: {},
    };

    const result = EffectForgeProjectSchema.safeParse(project);
    expect(result.success).toBe(true);
  });
});
