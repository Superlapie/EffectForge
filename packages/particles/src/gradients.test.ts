import { describe, expect, it } from "vitest";
import { evaluateColorGradient } from "./gradients.js";

describe("evaluateColorGradient", () => {
  it("interpolates between color stops", () => {
    const gradient = {
      colorStops: [
        { position: 0, color: "#000000" },
        { position: 1, color: "#ffffff" },
      ],
    };
    const [r, g, b] = evaluateColorGradient(gradient, 0.5);
    expect(r).toBeCloseTo(0.5, 2);
    expect(g).toBeCloseTo(0.5, 2);
    expect(b).toBeCloseTo(0.5, 2);
  });

  it("applies alpha stops when provided", () => {
    const gradient = {
      colorStops: [
        { position: 0, color: "#ffffff" },
        { position: 1, color: "#ffffff" },
      ],
      alphaStops: [
        { position: 0, alpha: 1 },
        { position: 1, alpha: 0 },
      ],
    };
    const [, , , alpha] = evaluateColorGradient(gradient, 0.5);
    expect(alpha).toBeCloseTo(0.5, 2);
  });
});
