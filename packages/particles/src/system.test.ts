import { createDefaultParticleLayer } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { applyLifetimeCurves } from "./lifetime.js";
import { ParticleSystem } from "./system.js";

describe("ParticleSystem", () => {
  it("emits particles at a deterministic rate", () => {
    const layer = createDefaultParticleLayer("Test");
    layer.emitter.rate = 60;
    layer.emitter.maxParticles = 500;

    const systemA = new ParticleSystem({ layer, projectSeed: 1234 });
    const systemB = new ParticleSystem({ layer, projectSeed: 1234 });

    for (let i = 0; i < 30; i++) {
      systemA.simulate(1 / 60);
      systemB.simulate(1 / 60);
    }

    expect(systemA.activeCount).toBeGreaterThan(0);
    expect(systemA.activeCount).toBe(systemB.activeCount);
  });

  it("applies gravity and drag behaviors", () => {
    const layer = createDefaultParticleLayer("Physics");
    layer.emitter.rate = 0;
    layer.emitter.shape = { type: "point" };
    layer.speed = { kind: "constant", value: 0 };
    layer.lifetime = { kind: "constant", value: 10 };
    layer.behaviors = [
      { type: "gravity", strength: -2 },
      { type: "drag", coefficient: 0.1 },
    ];

    const system = new ParticleSystem({ layer, projectSeed: 1 });
    const index = system.store.spawn()!;
    const p = system.store.positionOffset(index);
    system.store.position[p] = 0;
    system.store.position[p + 1] = 0;
    system.store.velocity[p] = 0;
    system.store.velocity[p + 1] = 1;
    system.store.age[index] = 0;
    system.store.lifetime[index] = 10;

    system.simulate(0.5);
    expect(system.store.position[p + 1]).toBeLessThan(0.5);
    expect(system.store.velocity[p + 1]).toBeLessThan(1);
  });

  it("fires burst emissions", () => {
    const layer = createDefaultParticleLayer("Burst");
    layer.emitter.rate = 0;
    layer.emitter.bursts = [{ time: 0.1, count: 3, cycles: 1, interval: 0, probability: 1 }];

    const system = new ParticleSystem({ layer, projectSeed: 7 });
    system.simulate(0.2);
    expect(system.activeCount).toBe(3);
  });

  it("applies size over lifetime curve", () => {
    const layer = createDefaultParticleLayer("SizeCurve");
    layer.emitter.rate = 0;
    layer.size = { kind: "constant", value: 2 };
    layer.sizeOverLifetime = { type: "linear", start: 1, end: 0 };

    const system = new ParticleSystem({ layer, projectSeed: 3 });
    const index = system.store.spawn()!;
    system.store.baseSize[index] = 2;
    system.store.size[index] = 2;
    system.store.age[index] = 0.5;
    system.store.lifetime[index] = 1;
    system.store.baseOpacity[index] = 1;
    const c = system.store.colorOffset(index);
    system.store.color[c + 3] = 1;

    applyLifetimeCurves(system.store, index, layer.sizeOverLifetime, undefined);
    expect(system.store.size[index]).toBeCloseTo(1, 5);
  });

  it("kills particles after lifetime expires", () => {
    const layer = createDefaultParticleLayer("Lifetime");
    layer.emitter.rate = 0;
    layer.lifetime = { kind: "constant", value: 0.05 };

    const system = new ParticleSystem({ layer, projectSeed: 42 });
    const index = system.store.spawn()!;
    system.store.age[index] = 0;
    system.store.lifetime[index] = 0.05;

    system.simulate(0.1);
    expect(system.activeCount).toBe(0);
  });
});
