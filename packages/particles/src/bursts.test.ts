import { createRandomStream } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { collectBurstTriggers } from "./bursts.js";

const baseEmitter = {
  shape: { type: "point" as const },
  space: "local" as const,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  rate: 0,
  bursts: [{ time: 1, count: 5, cycles: 1, interval: 0, probability: 1 }],
  startDelay: 0,
  duration: null,
  loop: false,
  prewarm: false,
  maxParticles: 100,
};

describe("collectBurstTriggers", () => {
  it("fires burst when elapsed crosses trigger time", () => {
    const fired = new Set<string>();
    const stream = createRandomStream(1);
    const triggers = collectBurstTriggers(baseEmitter, 0.9, 1.1, fired, stream);
    expect(triggers).toHaveLength(1);
    expect(triggers[0]?.count).toBe(5);
  });

  it("does not refire the same burst cycle", () => {
    const fired = new Set<string>();
    const stream = createRandomStream(1);
    collectBurstTriggers(baseEmitter, 0.9, 1.1, fired, stream);
    const second = collectBurstTriggers(baseEmitter, 1.1, 1.2, fired, stream);
    expect(second).toHaveLength(0);
  });

  it("respects burst probability", () => {
    const fired = new Set<string>();
    const stream = createRandomStream(12345);
    const emitter = {
      ...baseEmitter,
      bursts: [{ time: 0.5, count: 10, cycles: 1, interval: 0, probability: 0 }],
    };
    const triggers = collectBurstTriggers(emitter, 0, 1, fired, stream);
    expect(triggers).toHaveLength(0);
    expect(fired.size).toBe(1);
  });
});
