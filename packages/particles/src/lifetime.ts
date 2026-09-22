import type { ParameterCurve } from "@effectforge/schema";
import type { ParticleStore } from "./store.js";
import { evaluateParameterCurve } from "./curves.js";

/** Apply optional size and opacity over-lifetime curves to a particle. */
export function applyLifetimeCurves(
  store: ParticleStore,
  index: number,
  sizeOverLifetime: ParameterCurve | undefined,
  opacityOverLifetime: ParameterCurve | undefined,
): void {
  const lifetime = store.lifetime[index]!;
  if (lifetime <= 0) {
    return;
  }

  const normalizedAge = store.age[index]! / lifetime;

  if (sizeOverLifetime) {
    const multiplier = evaluateParameterCurve(sizeOverLifetime, normalizedAge);
    store.size[index] = Math.max(0, store.baseSize[index]! * multiplier);
  }

  if (opacityOverLifetime) {
    const multiplier = evaluateParameterCurve(opacityOverLifetime, normalizedAge);
    const c = store.colorOffset(index);
    store.color[c + 3] = Math.min(1, Math.max(0, store.baseOpacity[index]! * multiplier));
  }
}
