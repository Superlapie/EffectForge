import type { TextLayer } from "@effectforge/schema";
import { computeTextGlyphStates, type TextGlyphState } from "./effects.js";
import { layoutText, type TextLayoutBounds } from "./layout.js";

export interface TextSystemOptions {
  layer: TextLayer;
  projectSeed: number;
}

/** Single text layer animation driver. */
export class TextSystem {
  private layerState: TextLayer;
  private readonly projectSeed: number;
  private elapsed = 0;
  private layoutCache: TextLayoutBounds | null = null;
  private layoutKey = "";

  constructor(options: TextSystemOptions) {
    this.layerState = options.layer;
    this.projectSeed = options.projectSeed;
  }

  get layer(): TextLayer {
    return this.layerState;
  }

  get time(): number {
    return this.elapsed;
  }

  updateLayer(layer: TextLayer): void {
    this.layerState = layer;
    this.layoutCache = null;
  }

  reset(): void {
    this.elapsed = 0;
  }

  seek(time: number): void {
    this.elapsed = Math.max(0, time);
  }

  simulate(dt: number): void {
    if (!this.layerState.enabled) {
      return;
    }
    this.elapsed += dt;
  }

  getProgress(): number {
    const duration = Math.max(this.layerState.duration, 0.001);
    const looped = this.elapsed % duration;
    return clamp(looped / duration, 0, 1);
  }

  getLayout(): TextLayoutBounds {
    const key = this.createLayoutKey(this.layerState);
    if (this.layoutCache && this.layoutKey === key) {
      return this.layoutCache;
    }

    this.layoutKey = key;
    this.layoutCache = layoutText(this.layerState);
    return this.layoutCache;
  }

  getGlyphStates(): TextGlyphState[] {
    const layout = this.getLayout();
    const seed = this.projectSeed ^ hashLayerId(this.layerState.id);
    return computeTextGlyphStates(
      this.layerState,
      layout.glyphs,
      this.getProgress(),
      seed,
    );
  }

  private createLayoutKey(layer: TextLayer): string {
    return [
      layer.text,
      layer.fontSize,
      layer.fontWeight,
      layer.alignment,
      layer.lineHeight,
      layer.letterSpacing,
    ].join("|");
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hashLayerId(layerId: string): number {
  let hash = 0;
  for (let index = 0; index < layerId.length; index += 1) {
    hash = (hash * 31 + layerId.charCodeAt(index)) >>> 0;
  }
  return hash;
}
