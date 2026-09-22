import type { ColorValueSource, NumericValueSource } from "@effectforge/schema";
import type { RandomStream } from "@effectforge/core/prng";
import { parseHexColor } from "./color.js";
import { evaluateParameterCurve } from "./curves.js";
import { evaluateColorGradient } from "./gradients.js";

/** Sample a numeric value source at optional normalized parameter t in [0, 1]. */
export function sampleNumeric(
  source: NumericValueSource,
  stream: RandomStream,
  t = stream.next(),
): number {
  switch (source.kind) {
    case "constant":
      return source.value;
    case "random-range":
      return stream.nextRange(source.min, source.max);
    case "curve":
      return evaluateParameterCurve(source.curve, t);
    case "random-curve-range": {
      const sampleT = stream.next();
      const minValue = evaluateParameterCurve(source.minCurve, sampleT);
      const maxValue = evaluateParameterCurve(source.maxCurve, sampleT);
      return stream.nextRange(minValue, maxValue);
    }
    default:
      return 0;
  }
}

/** Sample a color value source at optional normalized parameter t in [0, 1]. */
export function sampleColor(
  source: ColorValueSource,
  stream: RandomStream,
  t = stream.next(),
): [number, number, number, number] {
  switch (source.kind) {
    case "constant":
      return parseHexColor(source.value);
    case "gradient":
      return evaluateColorGradient(source.gradient, t);
    case "random-gradient-range": {
      const sampleT = stream.next();
      const minColor = evaluateColorGradient(source.minGradient, sampleT);
      const maxColor = evaluateColorGradient(source.maxGradient, sampleT);
      const mix = stream.next();
      return [
        minColor[0] + (maxColor[0] - minColor[0]) * mix,
        minColor[1] + (maxColor[1] - minColor[1]) * mix,
        minColor[2] + (maxColor[2] - minColor[2]) * mix,
        minColor[3] + (maxColor[3] - minColor[3]) * mix,
      ];
    }
    default:
      return [1, 1, 1, 1];
  }
}
