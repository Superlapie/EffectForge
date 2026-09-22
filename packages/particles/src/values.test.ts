import { createRandomStream } from "@effectforge/core/prng";
import { describe, expect, it } from "vitest";
import { sampleColor, sampleNumeric } from "./values.js";

describe("value source sampling", () => {
  it("samples curve numeric sources", () => {
    const stream = createRandomStream(1);
    const value = sampleNumeric(
      { kind: "curve", curve: { type: "linear", start: 0, end: 1 } },
      stream,
      0.25,
    );
    expect(value).toBe(0.25);
  });

  it("samples gradient color sources", () => {
    const stream = createRandomStream(2);
    const [r, g, b] = sampleColor(
      {
        kind: "gradient",
        gradient: {
          colorStops: [
            { position: 0, color: "#ff0000" },
            { position: 1, color: "#0000ff" },
          ],
        },
      },
      stream,
      0.5,
    );
    expect(r).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
    expect(g).toBeCloseTo(0, 1);
  });

  it("samples random-curve-range sources deterministically", () => {
    const streamA = createRandomStream(99);
    const streamB = createRandomStream(99);
    const source = {
      kind: "random-curve-range" as const,
      minCurve: { type: "constant" as const, value: 1 },
      maxCurve: { type: "constant" as const, value: 3 },
    };
    expect(sampleNumeric(source, streamA)).toBe(sampleNumeric(source, streamB));
  });
});
