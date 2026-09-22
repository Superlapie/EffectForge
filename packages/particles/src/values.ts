import type { ColorValueSource, NumericValueSource } from "@effectforge/schema";
import type { RandomStream } from "@effectforge/core";
import { parseHexColor } from "./color.js";

/** Sample a numeric value source (Phase 4: constant and random-range only). */
export function sampleNumeric(source: NumericValueSource, stream: RandomStream): number {
  switch (source.kind) {
    case "constant":
      return source.value;
    case "random-range":
      return stream.nextRange(source.min, source.max);
    case "curve":
    case "random-curve-range":
      throw new Error(`Numeric value source "${source.kind}" is not implemented until Phase 5`);
    default:
      return 0;
  }
}

/** Sample a color value source (Phase 4: constant only). */
export function sampleColor(
  source: ColorValueSource,
  stream: RandomStream,
): [number, number, number, number] {
  switch (source.kind) {
    case "constant":
      return parseHexColor(source.value);
    case "gradient":
    case "random-gradient-range":
      throw new Error(`Color value source "${source.kind}" is not implemented until Phase 5`);
    default:
      return [1, 1, 1, 1];
  }
}
