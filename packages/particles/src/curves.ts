import type { CurvePoint, ParameterCurve } from "@effectforge/schema";

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function evaluatePiecewiseLinear(points: CurvePoint[], t: number): number {
  const sorted = [...points].sort((a, b) => a.time - b.time);
  if (sorted.length === 0) {
    return 0;
  }
  if (t <= sorted[0]!.time) {
    return sorted[0]!.value;
  }
  const last = sorted[sorted.length - 1]!;
  if (t >= last.time) {
    return last.value;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i]!;
    const right = sorted[i + 1]!;
    if (t >= left.time && t <= right.time) {
      const span = right.time - left.time;
      if (span <= 0) {
        return right.value;
      }
      const localT = (t - left.time) / span;
      return lerp(left.value, right.value, localT);
    }
  }

  return last.value;
}

/** Evaluate a parameter curve at normalized time t in [0, 1]. */
export function evaluateParameterCurve(curve: ParameterCurve, t: number): number {
  const normalized = clamp01(t);

  switch (curve.type) {
    case "constant":
      return curve.value;
    case "linear":
      return lerp(curve.start, curve.end, normalized);
    case "piecewise-linear":
      return evaluatePiecewiseLinear(curve.points, normalized);
    case "cubic-bezier":
    case "piecewise-cubic-bezier": {
      const keyframes = [...curve.keyframes].sort((a, b) => a.time - b.time);
      if (keyframes.length === 0) {
        return 0;
      }
      if (normalized <= keyframes[0]!.time) {
        return keyframes[0]!.value;
      }
      const last = keyframes[keyframes.length - 1]!;
      if (normalized >= last.time) {
        return last.value;
      }

      for (let i = 0; i < keyframes.length - 1; i++) {
        const left = keyframes[i]!;
        const right = keyframes[i + 1]!;
        if (normalized >= left.time && normalized <= right.time) {
          const span = right.time - left.time;
          if (span <= 0) {
            return right.value;
          }
          const localT = (normalized - left.time) / span;
          const p0 = left.value;
          const p1 = left.value + left.handles.outTangent.y;
          const p2 = right.value + right.handles.inTangent.y;
          const p3 = right.value;
          return cubicBezier(p0, p1, p2, p3, localT);
        }
      }
      return last.value;
    }
    default:
      return 0;
  }
}
