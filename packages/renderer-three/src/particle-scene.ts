import { ParticleSystem } from "@effectforge/particles";
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

  constructor(project: EffectForgeProject, scene: Scene) {
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
    for (const runtime of this.runtimes) {
      runtime.system.simulate(dt);
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
      runtime.mesh.syncFromStore(runtime.system.store, runtime.layer.opacity);
    }
  }

  dispose(scene: Scene): void {
    for (const runtime of this.runtimes) {
      scene.remove(runtime.mesh.mesh);
      runtime.mesh.dispose();
    }
    this.runtimes.length = 0;
  }
}
