import type { EffectForgeProject } from "@effectforge/schema";

export function createCursorRepelMist(seed = 77): EffectForgeProject {
  const now = new Date().toISOString();
  return {
    format: "effectforge",
    formatVersion: 1,
    id: "proj_cursor_repel_mist",
    name: "Cursor Repel Mist",
    seed,
    canvas: {
      width: 1920,
      height: 1080,
      background: { type: "color", value: "#030712" },
      sizingMode: "fill-container",
      maxDpr: 2,
    },
    timeline: { duration: 6, loop: true, markers: [] },
    layers: [
      {
        id: "layer_mist",
        name: "Mist",
        kind: "particles",
        enabled: true,
        locked: false,
        opacity: 0.85,
        blendMode: "additive",
        emitter: {
          shape: { type: "circle", radius: 1.1 },
          space: "local",
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rate: 120,
          bursts: [],
          startDelay: 0,
          duration: null,
          loop: true,
          prewarm: true,
          maxParticles: 6000,
        },
        lifetime: { kind: "random-range", min: 1.2, max: 2.4 },
        speed: { kind: "random-range", min: 0.05, max: 0.25 },
        size: { kind: "random-range", min: 0.02, max: 0.05 },
        color: {
          kind: "gradient",
          gradient: {
            colorStops: [
              { position: 0, color: "#66ccff" },
              { position: 1, color: "#2244aa" },
            ],
          },
        },
        initialOpacity: { kind: "random-range", min: 0.3, max: 0.7 },
        sizeOverLifetime: { type: "linear", start: 0.6, end: 1.2 },
        opacityOverLifetime: { type: "linear", start: 0.8, end: 0 },
        behaviors: [
          { type: "cursor-repel", strength: 4, radius: 0.55 },
          { type: "drag", coefficient: 0.15 },
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
