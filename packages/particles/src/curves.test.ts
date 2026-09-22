import { describe, expect, it } from "vitest";
import { evaluateParameterCurve } from "./curves.js";

describe("evaluateParameterCurve", () => {
  it("evaluates constant and linear curves", () => {
    expect(evaluateParameterCurve({ type: "constant", value: 3 }, 0.5)).toBe(3);
    expect(evaluateParameterCurve({ type: "linear", start: 0, end: 10 }, 0.5)).toBe(5);
  });

  it("evaluates piecewise-linear curves", () => {
    const curve = {
      type: "piecewise-linear" as const,
      points: [
        { time: 0, value: 0 },
        { time: 0.5, value: 1 },
        { time: 1, value: 0 },
      ],
    };
    expect(evaluateParameterCurve(curve, 0.25)).toBe(0.5);
    expect(evaluateParameterCurve(curve, 0.75)).toBe(0.5);
  });

  it("evaluates cubic-bezier curves between keyframes", () => {
    const curve = {
      type: "cubic-bezier" as const,
      keyframes: [
        {
          time: 0,
          value: 0,
          handles: { inTangent: { x: 0, y: 0 }, outTangent: { x: 0.25, y: 1 } },
        },
        {
          time: 1,
          value: 1,
          handles: { inTangent: { x: -0.25, y: 0 }, outTangent: { x: 0, y: 0 } },
        },
      ],
    };
    expect(evaluateParameterCurve(curve, 0)).toBe(0);
    expect(evaluateParameterCurve(curve, 1)).toBe(1);
    expect(evaluateParameterCurve(curve, 0.5)).toBeGreaterThan(0);
    expect(evaluateParameterCurve(curve, 0.5)).toBeLessThan(1);
  });
});
