import type { TrailLayer } from "@effectforge/schema";
import type { PointerInteractionState } from "@effectforge/pointer";
import { TrailStore } from "./store.js";

export interface TrailSystemOptions {
  layer: TrailLayer;
}

function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Converts authored trail width to renderer world units. */
export function trailWidthToWorld(width: number): number {
  return width * 0.003;
}

/** Converts authored min distance to renderer world units. */
export function trailMinDistanceToWorld(minDistance: number): number {
  return minDistance * 0.01;
}

/**
 * Single trail layer simulation driver.
 * Records pointer positions into a ring buffer when followPointer is enabled.
 */
export class TrailSystem {
  private layerState: TrailLayer;
  readonly store: TrailStore;

  constructor(options: TrailSystemOptions) {
    this.layerState = options.layer;
    this.store = new TrailStore(options.layer.maxPoints);
  }

  get layer(): TrailLayer {
    return this.layerState;
  }

  updateLayer(layer: TrailLayer): void {
    this.layerState = layer;
    if (layer.maxPoints !== this.store.maxPoints) {
      const next = new TrailStore(layer.maxPoints);
      const count = Math.min(this.store.pointCount, layer.maxPoints);
      for (let index = 0; index < count; index += 1) {
        const point = this.store.getPoint(index);
        if (point) {
          next.push(point.x, point.y, point.z);
        }
      }
      (this as { store: TrailStore }).store = next;
    }
  }

  reset(): void {
    this.store.clear();
  }

  seek(_time: number): void {
    this.reset();
  }

  simulate(_dt: number, pointer?: PointerInteractionState | null): void {
    if (!this.layerState.enabled) {
      return;
    }

    if (!this.layerState.followPointer || !pointer?.active) {
      return;
    }

    const minDistance = trailMinDistanceToWorld(this.layerState.minDistance);
    const minDistanceSquared = minDistance * minDistance;
    const { x, y, z } = pointer.position;
    const newest = this.store.getNewest();

    if (newest && distanceSquared(newest.x, newest.y, x, y) < minDistanceSquared) {
      return;
    }

    this.store.push(x, y, z);
  }
}
