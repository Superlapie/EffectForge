import { createDefaultParticleLayer, createProject } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { Scene } from "three";
import { ParticleScene } from "./particle-scene.js";

describe("ParticleScene", () => {
  it("creates runtimes for enabled particle layers", () => {
    const sparks = createDefaultParticleLayer("Sparks");
    sparks.emitter.rate = 120;
    const smoke = createDefaultParticleLayer("Smoke");
    smoke.emitter.rate = 120;
    const project = createProject({ layers: [sparks, smoke] });
    const scene = new Scene();
    const particleScene = new ParticleScene(project, scene, null);

    expect(particleScene.layerCount).toBe(2);
    for (let i = 0; i < 5; i++) {
      particleScene.simulate(1 / 60);
    }
    particleScene.syncMeshes();
    expect(particleScene.totalActiveParticles).toBeGreaterThan(0);

    particleScene.dispose(scene);
    expect(scene.children.length).toBe(0);
  });

  it("syncs layer edits in place without rebuilding runtimes", () => {
    const layer = createDefaultParticleLayer("Sparks");
    layer.emitter.rate = 120;
    const project = createProject({ layers: [layer] });
    const scene = new Scene();
    const particleScene = new ParticleScene(project, scene, null);

    for (let i = 0; i < 10; i++) {
      particleScene.simulate(1 / 60);
    }
    const before = particleScene.totalActiveParticles;
    expect(before).toBeGreaterThan(0);

    const updated = {
      ...project,
      layers: [{ ...layer, opacity: 0.25, emitter: { ...layer.emitter, rate: 200 } }],
    };
    expect(particleScene.syncProjectLayers(updated)).toBe(true);
    expect(particleScene.totalActiveParticles).toBe(before);

    particleScene.dispose(scene);
  });
});
