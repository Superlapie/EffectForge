import type { EffectForgeProject } from "@effectforge/schema";

export function createCursorTrailGlow(seed = 77): EffectForgeProject {
  const now = new Date().toISOString();
  return {
    format: "effectforge",
    formatVersion: 1,
    id: "proj_cursor_trail_glow",
    name: "Cursor Trail Glow",
    seed,
    canvas: {
      width: 1920,
      height: 1080,
      background: { type: "color", value: "#03040a" },
      sizingMode: "fill-container",
      maxDpr: 2,
    },
    timeline: { duration: 6, loop: true, markers: [] },
    layers: [
      {
        id: "layer_trail",
        name: "Glow Trail",
        kind: "trail",
        enabled: true,
        locked: false,
        opacity: 1,
        blendMode: "additive",
        maxPoints: 320,
        width: 8,
        widthOverLifetime: { type: "linear", start: 1, end: 0.15 },
        colorGradient: {
          colorStops: [
            { position: 0, color: "#2244aa" },
            { position: 0.5, color: "#66ccff" },
            { position: 1, color: "#ffffff" },
          ],
          alphaStops: [
            { position: 0, alpha: 0 },
            { position: 0.4, alpha: 0.4 },
            { position: 1, alpha: 1 },
          ],
        },
        fade: 0.88,
        followPointer: true,
        minDistance: 0.025,
      },
    ],
    assets: {},
    exportPreferences: {
      portableSource: false,
      reducedMotionPolicy: "reduce-intensity",
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      tags: ["pointer", "trail", "glow"],
    },
  };
}
