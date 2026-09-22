import {
  CURRENT_FORMAT_VERSION,
  FORMAT_NAME,
  type Canvas,
  type EffectForgeProject,
  type Layer,
} from "@effectforge/schema";
import { generateUniqueId } from "./ids.js";
import { deriveStream } from "./prng.js";

export interface CreateProjectOptions {
  name?: string;
  seed?: number;
  canvas?: Partial<Canvas>;
  layers?: Layer[];
}

const DEFAULT_CANVAS: Canvas = {
  width: 1920,
  height: 1080,
  background: { type: "color", value: "#050508" },
  sizingMode: "fill-container",
  maxDpr: 2,
};

/**
 * Create a new EffectForge project with sensible defaults.
 * Seed is deterministic when provided; otherwise derived from timestamp.
 */
export function createProject(options: CreateProjectOptions = {}): EffectForgeProject {
  const now = new Date().toISOString();
  const seed =
    options.seed ??
    deriveStream(Date.now(), "new-project").nextInt(0, 2_147_483_647);

  const project: EffectForgeProject = {
    format: FORMAT_NAME,
    formatVersion: CURRENT_FORMAT_VERSION,
    id: generateUniqueId("proj_"),
    name: options.name ?? "Untitled Effect",
    seed,
    canvas: {
      ...DEFAULT_CANVAS,
      ...options.canvas,
      background: options.canvas?.background ?? DEFAULT_CANVAS.background,
    },
    timeline: {
      duration: 6,
      loop: true,
      markers: [],
    },
    layers: options.layers ?? [],
    assets: {},
    exportPreferences: {
      portableSource: false,
      reducedMotionPolicy: "reduce-intensity",
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      tags: [],
    },
  };

  return project;
}

/** Create a default particle layer for quick authoring. */
export function createDefaultParticleLayer(name = "Particles"): Layer {
  return {
    id: generateUniqueId("layer_"),
    name,
    kind: "particles",
    enabled: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    emitter: {
      shape: { type: "point" },
      space: "local",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      rate: 50,
      bursts: [],
      startDelay: 0,
      duration: null,
      loop: true,
      prewarm: false,
      maxParticles: 10_000,
    },
    lifetime: { kind: "constant", value: 2 },
    speed: { kind: "random-range", min: 0.5, max: 2 },
    size: { kind: "constant", value: 4 },
    color: { kind: "constant", value: "#ffffff" },
    initialOpacity: { kind: "constant", value: 1 },
    behaviors: [{ type: "gravity", strength: -0.5 }],
    billboardMode: "camera-facing",
  };
}
