import { TextSystem } from "@effectforge/text";
import type { EffectForgeProject, TextLayer } from "@effectforge/schema";
import type { Scene } from "three";
import { TextMesh } from "./text-mesh.js";

interface TextLayerRuntime {
  layer: TextLayer;
  system: TextSystem;
  mesh: TextMesh;
}

/** Manages text layer animation and canvas-textured rendering. */
export class TextScene {
  private readonly runtimes: TextLayerRuntime[] = [];

  constructor(project: EffectForgeProject, scene: Scene) {
    for (const layer of project.layers) {
      if (layer.kind !== "text" || !layer.enabled) {
        continue;
      }

      const system = new TextSystem({ layer, projectSeed: project.seed });
      const mesh = new TextMesh();
      scene.add(mesh.mesh);
      this.runtimes.push({ layer, system, mesh });
    }
  }

  get layerCount(): number {
    return this.runtimes.length;
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
      const layout = runtime.system.getLayout();
      const states = runtime.system.getGlyphStates();
      runtime.mesh.syncFromStates(runtime.layer, layout, states);
    }
  }

  syncProjectLayers(project: EffectForgeProject): boolean {
    const layers = project.layers.filter((layer) => layer.kind === "text" && layer.enabled);
    const currentIds = this.runtimes.map((runtime) => runtime.layer.id).join(",");
    const nextIds = layers.map((layer) => layer.id).join(",");
    if (currentIds !== nextIds) {
      return false;
    }

    for (const runtime of this.runtimes) {
      const layer = layers.find((entry) => entry.id === runtime.layer.id);
      if (!layer || layer.kind !== "text") {
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
