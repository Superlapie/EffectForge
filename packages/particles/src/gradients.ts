import type { ColorGradient } from "@effectforge/schema";
import { parseHexColor } from "./color.js";

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function findSegment<T extends { position: number }>(
  stops: T[],
  t: number,
): [T, T, number] {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (sorted.length === 0) {
    throw new Error("Gradient requires at least one stop");
  }
  if (t <= sorted[0]!.position) {
    return [sorted[0]!, sorted[0]!, 0];
  }
  const last = sorted[sorted.length - 1]!;
  if (t >= last.position) {
    return [last, last, 0];
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i]!;
    const right = sorted[i + 1]!;
    if (t >= left.position && t <= right.position) {
      const span = right.position - left.position;
      const localT = span <= 0 ? 0 : (t - left.position) / span;
      return [left, right, localT];
    }
  }

  return [last, last, 0];
}

/** Sample a color gradient at normalized position t in [0, 1]. */
export function evaluateColorGradient(
  gradient: ColorGradient,
  t: number,
): [number, number, number, number] {
  const normalized = clamp01(t);
  const [left, right, localT] = findSegment(gradient.colorStops, normalized);
  const [lr, lg, lb, la] = parseHexColor(left.color);
  const [rr, rg, rb, ra] = parseHexColor(right.color);

  const r = lerp(lr, rr, localT);
  const g = lerp(lg, rg, localT);
  const b = lerp(lb, rb, localT);
  let alpha = lerp(la, ra, localT);

  if (gradient.alphaStops && gradient.alphaStops.length > 0) {
    const [alphaLeft, alphaRight, alphaLocalT] = findSegment(gradient.alphaStops, normalized);
    alpha = lerp(alphaLeft.alpha, alphaRight.alpha, alphaLocalT);
  }

  return [r, g, b, alpha];
}
