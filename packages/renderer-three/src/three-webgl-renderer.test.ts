import { createProject } from "@effectforge/core";
import type { WebGLRenderer } from "three";
import { describe, expect, it, vi } from "vitest";
import { ThreeWebGLRenderer } from "./three-webgl-renderer.js";

function createMockCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 256,
    height: 144,
    style: {},
    clientWidth: 256,
    clientHeight: 144,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    toBlob: (callback: (blob: Blob | null) => void) => {
      callback(new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }));
    },
  };
  return canvas as unknown as HTMLCanvasElement;
}

function createMockWebGLRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
  const renderer = {
    domElement: canvas,
    autoClear: true,
    info: { render: { calls: 1 } },
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };
  return renderer as unknown as WebGLRenderer;
}

describe("ThreeWebGLRenderer lifecycle", () => {
  it("initializes, loads project, steps deterministically, and disposes", async () => {
    const canvas = createMockCanvas();
    const renderer = new ThreeWebGLRenderer({
      useWallClock: false,
      createWebGLRenderer: () => createMockWebGLRenderer(canvas),
    });

    await renderer.initialize({ canvas });
    await renderer.loadProject(createProject({ name: "Renderer Test" }));

    const steps: Array<{ dt: number; time: number }> = [];
    renderer.setSimulationCallback((dt, time) => {
      steps.push({ dt, time });
    });

    renderer.step(1 / 60);
    renderer.step(1 / 60);
    expect(renderer.getSimulationTime()).toBeCloseTo(2 / 60, 8);
    expect(steps).toHaveLength(2);

    renderer.play();
    renderer.pause();
    renderer.stop();
    expect(renderer.getSimulationTime()).toBe(0);

    renderer.dispose();
    await expect(renderer.initialize({ canvas })).rejects.toThrow(/disposed/i);
  });

  it("render updates stats and captureFrame returns image bytes", async () => {
    const canvas = createMockCanvas();
    const renderer = new ThreeWebGLRenderer({
      useWallClock: false,
      createWebGLRenderer: () => createMockWebGLRenderer(canvas),
    });
    await renderer.initialize({ canvas });
    await renderer.loadProject(createProject());

    renderer.resize(320, 180, 1);
    renderer.render();

    const stats = renderer.getStats();
    expect(stats.dpr).toBe(1);
    expect(stats.drawCalls).toBe(1);

    const capture = await renderer.captureFrame({ mimeType: "image/png" });
    expect(capture.width).toBe(320);
    expect(capture.height).toBe(180);
    expect(capture.data.byteLength).toBeGreaterThan(0);
    expect(capture.mimeType).toBe("image/png");

    renderer.dispose();
  });

  it("throws when used before initialize", async () => {
    const renderer = new ThreeWebGLRenderer();
    expect(() => renderer.render()).toThrow(/not initialized/i);
    await expect(renderer.loadProject(createProject())).rejects.toThrow(/not initialized/i);
  });

  it("seek updates simulation time for manual scrubbing", async () => {
    const canvas = createMockCanvas();
    const renderer = new ThreeWebGLRenderer({
      useWallClock: false,
      createWebGLRenderer: () => createMockWebGLRenderer(canvas),
    });
    await renderer.initialize({ canvas });
    await renderer.loadProject(createProject());

    renderer.seek(1.25);
    expect(renderer.getSimulationTime()).toBe(1.25);
    renderer.dispose();
  });
});
