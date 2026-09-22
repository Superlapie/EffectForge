import { describe, expect, it } from "vitest";
import { applyLifetimeCurves } from "./lifetime.js";
import { ParticleStore } from "./store.js";

describe("applyLifetimeCurves", () => {
  it("scales size and opacity over normalized lifetime", () => {
    const store = new ParticleStore(1);
    const index = store.spawn()!;
    store.baseSize[index] = 2;
    store.size[index] = 2;
    store.baseOpacity[index] = 1;
    store.age[index] = 0.5;
    store.lifetime[index] = 1;
    const c = store.colorOffset(index);
    store.color[c + 3] = 1;

    applyLifetimeCurves(
      store,
      index,
      { type: "linear", start: 1, end: 0 },
      { type: "linear", start: 1, end: 0 },
    );

    expect(store.size[index]).toBeCloseTo(1, 5);
    expect(store.color[c + 3]).toBeCloseTo(0.5, 5);
  });
});
