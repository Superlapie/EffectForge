import type { EffectForgeProject } from "@effectforge/schema";

export function createCursorAttractSparkles(seed = 42): EffectForgeProject {
  const now = new Date().toISOString();
  return {
    format: "effectforge",
    formatVersion: 1,
    id: "proj_cursor_attract_sparkles",
    name: "Cursor Attract Sparkles",
    seed,
    canvas: {
      width: 1920,
      height: 1080,
      background: { type: "color", value: "#050508" },
      sizingMode: "fill-container",
      maxDpr: 2,
    },
    timeline: { duration: 6, loop: true, markers: [] },
    layers: [
      {
        id: "layer_sparkles",
        name: "Sparkles",
        kind: "particles",
        enabled: true,
        locked: false,
        opacity: 1,
        blendMode: "additive",
        emitter: {
          shape: { type: "box", size: { x: 2.4, y: 1.4, z: 0 } },
          space: "local",
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rate: 80,
          bursts: [],
          startDelay: 0,
          duration: null,
          loop: true,
          prewarm: true,
          maxParticles: 4000,
        },
        lifetime: { kind: "random-range", min: 0.8, max: 1.6 },
        speed: { kind: "random-range", min: 0.2, max: 0.8 },
        size: { kind: "random-range", min: 0.01, max: 0.03 },
        color: {
          kind: "gradient",
          gradient: {
            colorStops: [
              { position: 0, color: "#fff4cc" },
              { position: 1, color: "#ff8844" },
            ],
            alphaStops: [
              { position: 0, alpha: 1 },
              { position: 1, alpha: 0.6 },
            ],
          },
        },
        initialOpacity: { kind: "constant", value: 1 },
        sizeOverLifetime: { type: "linear", start: 1, end: 0 },
        opacityOverLifetime: { type: "linear", start: 1, end: 0 },
        behaviors: [
          { type: "cursor-attract", strength: 3.5, radius: 0.45 },
          { type: "drag", coefficient: 0.25 },
        ],
        billboardMode: "camera-facing",
      },
    ],
    assets: {},
    exportPreferences: {
      portableSource: false,
      reducedMotionPolicy: "reduce-intensity",
    },
    metadata: { createdAt: now, updatedAt: now, tags: ["preset", "pointer"] },
  };
}
