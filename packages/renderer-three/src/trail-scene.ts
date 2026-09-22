import { TrailSystem } from "@effectforge/trails";
import type { PointerService } from "@effectforge/pointer";
import type { EffectForgeProject, TrailLayer } from "@effectforge/schema";
import type { Scene } from "three";
import { TrailMesh } from "./trail-mesh.js";

interface TrailLayerRuntime {
  layer: TrailLayer;
  system: TrailSystem;
  mesh: TrailMesh;
}

/** Manages trail layer simulations and ribbon rendering. */
export class TrailScene {
  private readonly runtimes: TrailLayerRuntime[] = [];
  private readonly pointer: PointerService | null;

  constructor(project: EffectForgeProject, scene: Scene, pointer: PointerService | null = null) {
    this.pointer = pointer;
    for (const layer of project.layers) {
      if (layer.kind !== "trail" || !layer.enabled) {
        continue;
      }

      const system = new TrailSystem({ layer });
      const mesh = new TrailMesh(layer.maxPoints);
      scene.add(mesh.mesh);
      this.runtimes.push({ layer, system, mesh });
    }
  }

  get layerCount(): number {
    return this.runtimes.length;
  }

  simulate(dt: number): void {
    const pointerState = this.pointer?.toInteractionState() ?? null;
    for (const runtime of this.runtimes) {
      runtime.system.simulate(dt, pointerState);
    }
  }

  seek(time: number): void {
    for (const runtime of this.runtimes) {
      runtime.system.seek(time);
    }
  }

  stop(): void {
    for (const runtime of this.runtimes) {
      runtime.system.reset();
    }
  }

  syncMeshes(): void {
    for (const runtime of this.runtimes) {
      runtime.mesh.syncFromStore(runtime.system.store, runtime.layer);
    }
  }

  syncProjectLayers(project: EffectForgeProject): boolean {
    const layers = project.layers.filter((layer) => layer.kind === "trail" && layer.enabled);
    const currentIds = this.runtimes.map((runtime) => runtime.layer.id).join(",");
    const nextIds = layers.map((layer) => layer.id).join(",");
    if (currentIds !== nextIds) {
      return false;
    }

    for (const runtime of this.runtimes) {
      const layer = layers.find((entry) => entry.id === runtime.layer.id);
      if (!layer || layer.kind !== "trail") {
        return false;
      }
      runtime.layer = layer;
      runtime.system.updateLayer(layer);
    }

    return true;
  }

  dispose(scene: Scene): void {
    for (const runtime of this.runtimes) {
      scene.remove(runtime.mesh.mesh);
      runtime.mesh.dispose();
    }
    this.runtimes.length = 0;
  }
}
