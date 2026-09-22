import { describe, expect, it } from "vitest";
import { ParticleStore } from "./store.js";

describe("ParticleStore", () => {
  it("spawns and kills particles via free list", () => {
    const store = new ParticleStore(4);
    expect(store.availableSlots).toBe(4);
    expect(store.activeCount).toBe(0);

    const a = store.spawn();
    const b = store.spawn();
    expect(a).toBe(3);
    expect(b).toBe(2);
    expect(store.activeCount).toBe(2);

    store.kill(a!);
    expect(store.activeCount).toBe(1);
    expect(store.availableSlots).toBe(3);

    const recycled = store.spawn();
    expect(recycled).toBe(3);
    expect(store.activeCount).toBe(2);
  });

  it("forEachAlive visits only live particles", () => {
    const store = new ParticleStore(3);
    const i0 = store.spawn()!;
    const i1 = store.spawn()!;
    store.kill(i0);

    const visited: number[] = [];
    store.forEachAlive((index) => visited.push(index));
    expect(visited).toEqual([i1]);
  });
});
