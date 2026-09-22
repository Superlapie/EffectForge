import { createThreeWebGLRenderer } from "@effectforge/renderer-three";
import type { EffectForgeProject } from "@effectforge/schema";

export interface MountEffectOptions {
  canvas: HTMLCanvasElement;
  project: EffectForgeProject;
  autoplay?: boolean;
  /** Container element for pointer events (defaults to canvas parent). */
  pointerTarget?: HTMLElement;
}

export interface EffectHandle {
  play(): void;
  pause(): void;
  resize(width: number, height: number, dpr?: number): void;
  dispose(): void;
}

/** Mount an EffectForge project on a canvas with pointer interaction and render loop. */
export async function mountEffect(options: MountEffectOptions): Promise<EffectHandle> {
  const { canvas, project, autoplay = true } = options;
  const pointerTarget = options.pointerTarget ?? canvas.parentElement ?? canvas;
  const renderer = createThreeWebGLRenderer();

  await renderer.initialize({ canvas });
  await renderer.loadProject(project);

  const resizeToContainer = () => {
    const rect = pointerTarget.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, project.canvas.maxDpr ?? 2);
    renderer.resize(width, height, dpr);
  };

  resizeToContainer();

  if (autoplay) {
    renderer.play();
  }

  let frameId = 0;
  let disposed = false;

  const renderFrame = () => {
    if (disposed) {
      return;
    }
    renderer.render();
    frameId = window.requestAnimationFrame(renderFrame);
  };
  renderFrame();

  const getRect = () => pointerTarget.getBoundingClientRect();
  const onPointerMove = (event: PointerEvent) => {
    renderer.handlePointerMove(event.clientX, event.clientY, getRect());
  };
  const onPointerDown = (event: PointerEvent) => {
    renderer.handlePointerDown(event.clientX, event.clientY, getRect());
  };
  const onPointerLeave = () => {
    renderer.handlePointerLeave();
  };

  pointerTarget.addEventListener("pointermove", onPointerMove);
  pointerTarget.addEventListener("pointerdown", onPointerDown);
  pointerTarget.addEventListener("pointerleave", onPointerLeave);

  const resizeObserver = new ResizeObserver(() => resizeToContainer());
  resizeObserver.observe(pointerTarget);

  return {
    play: () => renderer.play(),
    pause: () => renderer.pause(),
    resize: (width, height, dpr) => {
      renderer.resize(width, height, dpr ?? Math.min(window.devicePixelRatio || 1, project.canvas.maxDpr ?? 2));
    },
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      pointerTarget.removeEventListener("pointermove", onPointerMove);
      pointerTarget.removeEventListener("pointerdown", onPointerDown);
      pointerTarget.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
    },
  };
}
