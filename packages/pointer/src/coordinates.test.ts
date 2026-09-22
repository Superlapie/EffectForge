import { describe, expect, it } from "vitest";
import { clientToWorld, normalizedToWorld } from "./coordinates.js";

describe("pointer coordinates", () => {
  it("maps normalized center to world origin", () => {
    const world = normalizedToWorld(0.5, 0.5, 16 / 9);
    expect(world.x).toBeCloseTo(0, 5);
    expect(world.y).toBeCloseTo(0, 5);
  });

  it("maps client coordinates through a bounding rect", () => {
    const rect = { left: 0, top: 0, width: 100, height: 50 };
    const world = clientToWorld(100, 0, rect, 2);
    expect(world.x).toBeCloseTo(2, 5);
    expect(world.y).toBeCloseTo(1, 5);
  });
});
