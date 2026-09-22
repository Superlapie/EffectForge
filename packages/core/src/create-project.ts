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

export interface CreateDefaultTrailLayerOptions {
  name?: string;
  minDistance?: number;
  width?: number;
  fade?: number;
}

/** Create a default trail layer for quick authoring. */
export function createDefaultTrailLayer(
  name = "Trail",
  options: CreateDefaultTrailLayerOptions = {},
): Layer {
  return {
    id: generateUniqueId("layer_"),
    name: options.name ?? name,
    kind: "trail",
    enabled: true,
    locked: false,
    opacity: 1,
    blendMode: "additive",
    maxPoints: 256,
    width: options.width ?? 6,
    widthOverLifetime: { type: "linear", start: 1, end: 0.2 },
    colorGradient: {
      colorStops: [
        { position: 0, color: "#44aaff" },
        { position: 1, color: "#ffffff" },
      ],
      alphaStops: [
        { position: 0, alpha: 0 },
        { position: 1, alpha: 1 },
      ],
    },
    fade: options.fade ?? 0.85,
    followPointer: true,
    minDistance: options.minDistance ?? 0.03,
  };
}

export type DefaultPostFxEffect = "bloom" | "vignette" | "chromatic-aberration";

/** Create a default post-processing layer for quick authoring. */
export function createDefaultPostFxLayer(
  name = "Bloom",
  effect: DefaultPostFxEffect = "bloom",
): Layer {
  const effectConfig =
    effect === "bloom"
      ? { type: "bloom" as const, intensity: 0.7, threshold: 0.75 }
      : effect === "vignette"
        ? { type: "vignette" as const, darkness: 0.45, offset: 0.5 }
        : { type: "chromatic-aberration" as const, offset: 0.002 };

  return {
    id: generateUniqueId("layer_"),
    name,
    kind: "postfx",
    enabled: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    effect: effectConfig,
  };
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
