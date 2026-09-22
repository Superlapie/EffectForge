import { describe, expect, it } from "vitest";
import { createRandomStream, deriveStream } from "./prng.js";

describe("createRandomStream", () => {
  it("produces deterministic sequences for the same seed", () => {
    const a = createRandomStream(12345);
    const b = createRandomStream(12345);

    const valuesA = Array.from({ length: 10 }, () => a.next());
    const valuesB = Array.from({ length: 10 }, () => b.next());

    expect(valuesA).toEqual(valuesB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRandomStream(1);
    const b = createRandomStream(2);

    expect(a.next()).not.toBe(b.next());
  });

  it("nextRange stays within bounds", () => {
    const stream = createRandomStream(99);
    for (let i = 0; i < 100; i++) {
      const value = stream.nextRange(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(10);
    }
  });

  it("fork creates independent but deterministic child streams", () => {
    const parent = createRandomStream(42);
    const child1 = parent.fork(1);
    const child2 = parent.fork(1);
    const child3 = parent.fork(2);

    expect(child1.next()).toBe(child2.next());
    expect(child1.next()).not.toBe(child3.next());
  });
});

describe("deriveStream", () => {
  it("creates namespace-specific streams", () => {
    const particles = deriveStream(100, "particles");
    const trails = deriveStream(100, "trails");

    expect(particles.next()).not.toBe(trails.next());
  });
});
