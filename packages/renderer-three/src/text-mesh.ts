import type { TextGlyphState, TextLayoutBounds } from "@effectforge/text";
import { textSizeToWorld } from "@effectforge/text";
import type { TextLayer } from "@effectforge/schema";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";

const CANVAS_PADDING = 48;

interface CanvasLike {
  width: number;
  height: number;
  getContext(contextId: "2d"): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
}

function createStubContext(): CanvasRenderingContext2D {
  return {
    clearRect: () => undefined,
    fillText: () => undefined,
    strokeText: () => undefined,
    measureText: () => ({ width: 10 } as TextMetrics),
  } as unknown as CanvasRenderingContext2D;
}

function createCanvas(): CanvasLike {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(1, 1);
  }
  if (typeof document !== "undefined") {
    return document.createElement("canvas");
  }

  return {
    width: 1,
    height: 1,
    getContext: () => createStubContext(),
  };
}

/** Canvas-textured plane mesh for animated text layers. */
export class TextMesh {
  readonly mesh: Mesh;
  private readonly canvas: CanvasLike;
  private readonly context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private readonly texture: CanvasTexture;
  private widthPx = 1;
  private heightPx = 1;

  constructor() {
    this.canvas = createCanvas();
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to create 2D canvas context for text rendering");
    }
    this.context = context as CanvasRenderingContext2D;

    this.texture = new CanvasTexture(this.canvas as HTMLCanvasElement & CanvasLike);
    this.texture.colorSpace = SRGBColorSpace;

    const material = new MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
    });

    this.mesh = new Mesh(new PlaneGeometry(1, 1), material);
    this.mesh.frustumCulled = false;
  }

  syncFromStates(
    layer: TextLayer,
    layout: TextLayoutBounds,
    states: TextGlyphState[],
  ): void {
    const padding = CANVAS_PADDING;
    const widthPx = Math.max(1, Math.ceil(layout.width + padding * 2));
    const heightPx = Math.max(1, Math.ceil(layout.height + padding * 2));

    if (widthPx !== this.widthPx || heightPx !== this.heightPx) {
      this.widthPx = widthPx;
      this.heightPx = heightPx;
      this.canvas.width = widthPx;
      this.canvas.height = heightPx;
    }

    const ctx = this.context;
    ctx.clearRect(0, 0, widthPx, heightPx);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `${layer.fontWeight} ${layer.fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = "#ffffff";

    const originX = widthPx / 2;
    const originY = heightPx / 2;

    for (const state of states) {
      const alpha = state.opacity * layer.opacity;
      if (alpha <= 0.001) {
        continue;
      }

      const x = originX + state.x + state.offsetX;
      const y = originY - state.y + state.offsetY;

      if (state.glow > 0) {
        ctx.shadowColor = `rgba(120, 200, 255, ${alpha * state.glow})`;
        ctx.shadowBlur = 12 + state.glow * 18;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      if (state.outline > 0) {
        ctx.strokeStyle = `rgba(120, 220, 255, ${alpha * state.outline})`;
        ctx.lineWidth = 2 + state.outline * 2;
        ctx.strokeText(state.displayChar, x, y);
      }

      ctx.globalAlpha = alpha;
      ctx.fillText(state.displayChar, x, y);
      ctx.globalAlpha = 1;
    }

    this.texture.needsUpdate = true;

    const worldScale = textSizeToWorld(layer.fontSize);
    const worldWidth = widthPx * worldScale;
    const worldHeight = heightPx * worldScale;
    this.mesh.scale.set(worldWidth, worldHeight, 1);
    this.mesh.visible = states.some((state) => state.opacity * layer.opacity > 0.001);
  }

  dispose(): void {
    this.texture.dispose();
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (material instanceof MeshBasicMaterial) {
      material.dispose();
    }
  }
}
