import type {
  CaptureFrameOptions,
  EffectForgeRenderer,
  RenderCapture,
  RenderingTarget,
  RendererStats,
} from "@effectforge/renderer";
import type { EffectForgeProject } from "@effectforge/schema";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { SimulationClock } from "./clock.js";
import { applyCanvasBackground } from "./scene-background.js";
import { StatsTracker } from "./stats-tracker.js";

export type WebGLRendererFactory = (canvas: HTMLCanvasElement | OffscreenCanvas) => WebGLRenderer;

export interface ThreeWebGLRendererOptions {
  fixedTimestep?: number;
  maxSubSteps?: number;
  /** When true, render() uses performance.now() for frame deltas. */
  useWallClock?: boolean;
  /** Override WebGL backend creation (used in unit tests). */
  createWebGLRenderer?: WebGLRendererFactory;
}

const TEST_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TEST_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec3 base = vec3(0.35 + 0.15 * sin(uTime), 0.45, 0.95 - 0.1 * cos(uTime * 0.7));
    float vignette = smoothstep(1.2, 0.2, length(vUv - 0.5));
    gl_FragColor = vec4(base * vignette, 1.0);
  }
`;

/**
 * Three.js WebGL2 renderer implementing the EffectForge renderer contract.
 * Phase 3: lifecycle, clock, deterministic stepping, test quad, capture, stats.
 */
export class ThreeWebGLRenderer implements EffectForgeRenderer {
  private readonly clock: SimulationClock;
  private readonly stats = new StatsTracker();
  private readonly useWallClock: boolean;
  private readonly createWebGLRenderer: WebGLRendererFactory;

  private webgl: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: OrthographicCamera | null = null;
  private testQuad: Mesh | null = null;
  private project: EffectForgeProject | null = null;

  private width = 1;
  private height = 1;
  private dpr = 1;
  private initialized = false;
  private disposed = false;
  private lastRenderTimestamp = 0;
  private simulationCallback: ((dt: number, time: number) => void) | null = null;

  constructor(options: ThreeWebGLRendererOptions = {}) {
    this.clock = new SimulationClock({
      fixedTimestep: options.fixedTimestep,
      maxSubSteps: options.maxSubSteps,
    });
    this.useWallClock = options.useWallClock ?? true;
    this.createWebGLRenderer =
      options.createWebGLRenderer ??
      ((canvas) =>
        new WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }));
  }

  /** Optional hook for future particle simulation (Phase 4+). */
  setSimulationCallback(callback: ((dt: number, time: number) => void) | null): void {
    this.simulationCallback = callback;
  }

  async initialize(target: RenderingTarget): Promise<void> {
    if (this.disposed) {
      throw new Error("ThreeWebGLRenderer has been disposed");
    }
    if (this.initialized) {
      return;
    }

    const canvas = target.canvas;
    this.webgl = this.createWebGLRenderer(canvas);
    this.webgl.autoClear = true;
    this.webgl.setPixelRatio(1);

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    this.camera.position.z = 1;

    const geometry = new PlaneGeometry(1.6, 0.9);
    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: TEST_VERTEX_SHADER,
      fragmentShader: TEST_FRAGMENT_SHADER,
    });
    this.testQuad = new Mesh(geometry, material);
    this.scene.add(this.testQuad);

    this.initialized = true;
    this.lastRenderTimestamp = performance.now();
  }

  async loadProject(project: EffectForgeProject): Promise<void> {
    this.assertInitialized();
    this.project = project;
    applyCanvasBackground(this.scene!, project.canvas.background);
    this.resize(project.canvas.width, project.canvas.height, this.dpr);
  }

  resize(width: number, height: number, dpr: number): void {
    this.assertInitialized();
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.dpr = Math.max(0.25, dpr);
    this.stats.setDpr(this.dpr);

    const pixelWidth = Math.round(this.width * this.dpr);
    const pixelHeight = Math.round(this.height * this.dpr);
    this.webgl!.setSize(pixelWidth, pixelHeight, false);

    const aspect = this.width / this.height;
    const halfHeight = 1;
    const halfWidth = halfHeight * aspect;
    this.camera!.left = -halfWidth;
    this.camera!.right = halfWidth;
    this.camera!.top = halfHeight;
    this.camera!.bottom = -halfHeight;
    this.camera!.updateProjectionMatrix();
  }

  play(): void {
    this.clock.play();
  }

  pause(): void {
    this.clock.pause();
  }

  stop(): void {
    this.clock.stop();
    this.updateTestQuadUniforms();
  }

  seek(time: number): void {
    this.clock.seek(time);
    this.updateTestQuadUniforms();
  }

  step(delta: number): void {
    this.runSimulation(delta);
  }

  render(): void {
    this.assertInitialized();

    const now = performance.now();
    this.stats.beginFrame(now);

    if (this.useWallClock && this.clock.isPlaying()) {
      const frameDelta = this.lastRenderTimestamp > 0 ? (now - this.lastRenderTimestamp) / 1000 : 0;
      this.lastRenderTimestamp = now;
      const simStart = performance.now();
      this.clock.tick(frameDelta, (dt, time) => {
        this.onSimulationStep(dt, time);
      });
      this.stats.recordSimulation(performance.now() - simStart);
    }

    this.updateTestQuadUniforms();
    this.webgl!.render(this.scene!, this.camera!);
    this.stats.setRenderInfo(this.webgl!.info.render.calls, 1);
    this.stats.setParticleCount(0);
  }

  async captureFrame(options: CaptureFrameOptions = {}): Promise<RenderCapture> {
    this.assertInitialized();
    this.render();

    const mimeType = options.mimeType ?? "image/png";
    const quality = options.quality;
    const pixelWidth = Math.round(this.width * this.dpr);
    const pixelHeight = Math.round(this.height * this.dpr);

    const canvas = this.webgl!.domElement;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Failed to capture frame"));
            return;
          }
          resolve(result);
        },
        mimeType,
        quality,
      );
    });

    const buffer = await blob.arrayBuffer();
    return {
      width: pixelWidth,
      height: pixelHeight,
      data: new Uint8Array(buffer),
      mimeType,
    };
  }

  getStats(): RendererStats {
    return this.stats.toStats();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.testQuad?.geometry.dispose();
    const material = this.testQuad?.material;
    if (material instanceof ShaderMaterial) {
      material.dispose();
    }
    this.webgl?.dispose();
    this.webgl = null;
    this.scene = null;
    this.camera = null;
    this.testQuad = null;
    this.project = null;
    this.stats.reset();
    this.disposed = true;
    this.initialized = false;
  }

  /** Exposed for tests. */
  getSimulationTime(): number {
    return this.clock.getTime();
  }

  private assertInitialized(): void {
    if (!this.initialized || this.disposed) {
      throw new Error("ThreeWebGLRenderer is not initialized");
    }
  }

  private runSimulation(delta: number): void {
    const simStart = performance.now();
    this.clock.step(delta);
    this.onSimulationStep(delta, this.clock.getTime());
    this.stats.recordSimulation(performance.now() - simStart);
  }

  private onSimulationStep(dt: number, time: number): void {
    this.simulationCallback?.(dt, time);
  }

  private updateTestQuadUniforms(): void {
    const material = this.testQuad?.material;
    if (material instanceof ShaderMaterial) {
      const timeUniform = material.uniforms.uTime;
      if (timeUniform) {
        timeUniform.value = this.clock.getTime();
        material.uniformsNeedUpdate = true;
      }
    }
  }
}

export function createThreeWebGLRenderer(
  options?: ThreeWebGLRendererOptions,
): ThreeWebGLRenderer {
  return new ThreeWebGLRenderer(options);
}
