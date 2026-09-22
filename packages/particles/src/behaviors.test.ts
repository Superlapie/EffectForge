import { describe, expect, it } from "vitest";
import { applyBehaviors } from "./behaviors.js";
import { ParticleStore } from "./store.js";

describe("cursor behaviors", () => {
  it("attracts particles toward the pointer", () => {
    const store = new ParticleStore(1);
    const index = store.spawn()!;
    const p = store.positionOffset(index);
    store.position[p] = -0.2;
    store.position[p + 1] = 0;
    store.velocity[p] = 0;
    store.velocity[p + 1] = 0;

    applyBehaviors(
      store,
      index,
      [{ type: "cursor-attract", strength: 10, radius: 1 }],
      0.1,
      { position: { x: 0.2, y: 0, z: 0 }, active: true, clicked: false },
    );

    expect(store.velocity[p]!).toBeGreaterThan(0);
  });

  it("repels particles away from the pointer", () => {
    const store = new ParticleStore(1);
    const index = store.spawn()!;
    const p = store.positionOffset(index);
    store.position[p] = 0.05;
    store.position[p + 1] = 0;
    store.velocity[p] = 0;
    store.velocity[p + 1] = 0;

    applyBehaviors(
      store,
      index,
      [{ type: "cursor-repel", strength: 10, radius: 1 }],
      0.1,
      { position: { x: 0, y: 0, z: 0 }, active: true, clicked: false },
    );

    expect(store.velocity[p]!).toBeGreaterThan(0);
  });
});
