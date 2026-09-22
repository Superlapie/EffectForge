import type { EffectForgeProject } from "@effectforge/schema";

/** Target surface for rendering (canvas element, offscreen canvas, headless). */
export interface RenderingTarget {
  canvas: HTMLCanvasElement | OffscreenCanvas;
}

export interface RendererStats {
  fps: number;
  frameTimeMs: number;
  simulationTimeMs: number;
  particleCount: number;
  drawCalls: number;
  batchCount: number;
  dpr: number;
}

export interface RenderCapture {
  width: number;
  height: number;
  data: Uint8Array;
  mimeType: "image/png" | "image/webp";
}

export interface CaptureFrameOptions {
  mimeType?: "image/png" | "image/webp";
  quality?: number;
}

/**
 * Backend-independent renderer contract.
 * Full implementation in Phase 3 (ThreeWebGLRenderer).
 */
export interface EffectForgeRenderer {
  initialize(target: RenderingTarget): Promise<void>;
  loadProject(project: EffectForgeProject): Promise<void>;
  resize(width: number, height: number, dpr: number): void;

  play(): void;
  pause(): void;
  stop(): void;

  seek(time: number): void;
  step(delta: number): void;
  render(): void;

  captureFrame(options?: CaptureFrameOptions): Promise<RenderCapture>;

  getStats(): RendererStats;

  dispose(): void;
}

export const RENDERER_PHASE = 3 as const;
