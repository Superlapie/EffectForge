import { createRandomStream } from "@effectforge/core/prng";
import { describe, expect, it } from "vitest";
import { sampleEmitterPosition } from "./emitters.js";

const baseEmitter = {
  shape: { type: "point" as const },
  space: "local" as const,
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 2, y: 2, z: 2 },
  rate: 0,
  bursts: [],
  startDelay: 0,
  duration: null,
  loop: true,
  prewarm: false,
  maxParticles: 100,
};

describe("sampleEmitterPosition", () => {
  it("returns transformed point emitter position", () => {
    const stream = createRandomStream(42);
    const position = sampleEmitterPosition(baseEmitter, stream);
    expect(position).toEqual({ x: 1, y: 2, z: 3 });
  });

  it("samples box emitter inside bounds", () => {
    const stream = createRandomStream(7);
    const position = sampleEmitterPosition(
      {
        ...baseEmitter,
        shape: { type: "box", size: { x: 2, y: 2, z: 2 } },
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 0, z: 0 },
      },
      stream,
    );
    expect(position.x).toBeGreaterThanOrEqual(-1);
    expect(position.x).toBeLessThanOrEqual(1);
    expect(position.y).toBeGreaterThanOrEqual(-1);
    expect(position.y).toBeLessThanOrEqual(1);
  });

  it("samples circle emitter on radius", () => {
    const stream = createRandomStream(99);
    const position = sampleEmitterPosition(
      {
        ...baseEmitter,
        shape: { type: "circle", radius: 2 },
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      stream,
    );
    const distance = Math.hypot(position.x, position.y);
    expect(distance).toBeCloseTo(2, 5);
  });
});
