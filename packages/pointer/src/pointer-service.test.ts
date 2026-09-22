import { describe, expect, it } from "vitest";
import { PointerService } from "./pointer-service.js";

describe("PointerService", () => {
  it("tracks client movement and click consumption", () => {
    const pointer = new PointerService();
    pointer.updateFromClient(50, 50, { left: 0, top: 0, width: 100, height: 100 }, 1);
    expect(pointer.isActive()).toBe(true);
    expect(pointer.getPosition().x).toBeCloseTo(0, 5);

    pointer.markClick();
    expect(pointer.consumeClick()).toBe(true);
    expect(pointer.consumeClick()).toBe(false);
  });

  it("deactivates when pointer leaves", () => {
    const pointer = new PointerService();
    pointer.setNormalized(0.2, 0.8, 1);
    pointer.deactivate();
    expect(pointer.isActive()).toBe(false);
  });
});
