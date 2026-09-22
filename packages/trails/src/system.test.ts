import { createDefaultTrailLayer } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { TrailSystem, trailMinDistanceToWorld } from "./system.js";

describe("TrailSystem", () => {
  it("records pointer positions when followPointer is enabled", () => {
    const layer = createDefaultTrailLayer();
    const system = new TrailSystem({ layer });

    system.simulate(0.016, {
      position: { x: 0, y: 0, z: 0 },
      active: true,
      clicked: false,
    });
    system.simulate(0.016, {
      position: { x: 0.5, y: 0, z: 0 },
      active: true,
      clicked: false,
    });

    expect(system.store.pointCount).toBe(2);
    expect(system.store.getPoint(0)).toEqual({ x: 0, y: 0, z: 0 });
    expect(system.store.getPoint(1)).toEqual({ x: 0.5, y: 0, z: 0 });
  });

  it("respects minDistance before adding points", () => {
    const layer = createDefaultTrailLayer("Trail", { minDistance: 50 });
    const system = new TrailSystem({ layer });
    const minDistance = trailMinDistanceToWorld(layer.minDistance);

    system.simulate(0.016, {
      position: { x: 0, y: 0, z: 0 },
      active: true,
      clicked: false,
    });
    system.simulate(0.016, {
      position: { x: minDistance * 0.25, y: 0, z: 0 },
      active: true,
      clicked: false,
    });

    expect(system.store.pointCount).toBe(1);

    system.simulate(0.016, {
      position: { x: minDistance * 2, y: 0, z: 0 },
      active: true,
      clicked: false,
    });

    expect(system.store.pointCount).toBe(2);
  });

  it("does not record points when pointer is inactive", () => {
    const layer = createDefaultTrailLayer();
    const system = new TrailSystem({ layer });

    system.simulate(0.016, {
      position: { x: 0, y: 0, z: 0 },
      active: false,
      clicked: false,
    });

    expect(system.store.pointCount).toBe(0);
  });

  it("clears on reset", () => {
    const layer = createDefaultTrailLayer();
    const system = new TrailSystem({ layer });

    system.simulate(0.016, {
      position: { x: 0.2, y: 0.1, z: 0 },
      active: true,
      clicked: false,
    });
    expect(system.store.pointCount).toBe(1);

    system.reset();
    expect(system.store.pointCount).toBe(0);
  });
});
