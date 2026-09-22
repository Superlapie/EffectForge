import { ParticleSystem } from "@effectforge/particles";
import type { PointerService } from "@effectforge/pointer";
import type { EffectForgeProject, ParticleLayer } from "@effectforge/schema";
import type { Scene } from "three";
import { ParticleInstancedMesh } from "./particle-instanced-mesh.js";

interface ParticleLayerRuntime {
  layer: ParticleLayer;
  system: ParticleSystem;
  mesh: ParticleInstancedMesh;
}

/** Manages particle layer simulations and instanced billboard rendering. */
export class ParticleScene {
  private readonly runtimes: ParticleLayerRuntime[] = [];
  private readonly pointer: PointerService | null;

  constructor(project: EffectForgeProject, scene: Scene, pointer: PointerService | null = null) {
    this.pointer = pointer;
    for (const layer of project.layers) {
      if (layer.kind !== "particles" || !layer.enabled) {
        continue;
      }

      const system = new ParticleSystem({
        layer,
        projectSeed: project.seed,
      });
      const mesh = new ParticleInstancedMesh(layer.emitter.maxParticles);
      scene.add(mesh.mesh);
      this.runtimes.push({ layer, system, mesh });
    }
  }

  get layerCount(): number {
    return this.runtimes.length;
  }

  get totalActiveParticles(): number {
    return this.runtimes.reduce((sum, runtime) => sum + runtime.system.activeCount, 0);
  }

  simulate(dt: number): void {
    const pointerState = this.pointer?.toInteractionState() ?? null;
    for (const runtime of this.runtimes) {
      runtime.system.simulate(dt, pointerState);
    }
    this.pointer?.consumeClick();
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
      runtime.mesh.syncFromStore(runtime.system.store, runtime.layer.opacity);
    }
  }

  /**
   * Update layer configs in place when layer IDs are unchanged.
   * Returns false when a full scene rebuild is required.
   */
  syncProjectLayers(project: EffectForgeProject): boolean {
    const layers = project.layers.filter((layer) => layer.kind === "particles" && layer.enabled);
    const currentIds = this.runtimes.map((runtime) => runtime.layer.id).join(",");
    const nextIds = layers.map((layer) => layer.id).join(",");
    if (currentIds !== nextIds) {
      return false;
    }

    for (const runtime of this.runtimes) {
      const layer = layers.find((entry) => entry.id === runtime.layer.id);
      if (!layer || layer.kind !== "particles") {
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
