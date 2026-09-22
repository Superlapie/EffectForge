import type { RendererStats } from "@effectforge/renderer";

export class StatsTracker {
  private lastFrameTimestamp = 0;
  private frameTimeMs = 0;
  private simulationTimeMs = 0;
  private fps = 0;
  private particleCount = 0;
  private drawCalls = 0;
  private batchCount = 0;
  private dpr = 1;

  beginFrame(now: number): void {
    if (this.lastFrameTimestamp > 0) {
      const delta = now - this.lastFrameTimestamp;
      this.frameTimeMs = delta;
      this.fps = delta > 0 ? 1000 / delta : 0;
    }
    this.lastFrameTimestamp = now;
  }

  recordSimulation(durationMs: number): void {
    this.simulationTimeMs = durationMs;
  }

  setParticleCount(count: number): void {
    this.particleCount = count;
  }

  setRenderInfo(drawCalls: number, batchCount: number): void {
    this.drawCalls = drawCalls;
    this.batchCount = batchCount;
  }

  setDpr(dpr: number): void {
    this.dpr = dpr;
  }

  reset(): void {
    this.lastFrameTimestamp = 0;
    this.frameTimeMs = 0;
    this.simulationTimeMs = 0;
    this.fps = 0;
    this.particleCount = 0;
    this.drawCalls = 0;
    this.batchCount = 0;
    this.dpr = 1;
  }

  toStats(): RendererStats {
    return {
      fps: this.fps,
      frameTimeMs: this.frameTimeMs,
      simulationTimeMs: this.simulationTimeMs,
      particleCount: this.particleCount,
      drawCalls: this.drawCalls,
      batchCount: this.batchCount,
      dpr: this.dpr,
    };
  }
}
