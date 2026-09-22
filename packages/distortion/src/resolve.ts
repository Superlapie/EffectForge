import type { DistortionLayer, EffectForgeProject } from "@effectforge/schema";

export interface ResolvedDistortionLayer {
  layer: DistortionLayer;
  effect: DistortionLayer["effect"];
}

/** Collect enabled distortion layers in project layer order. */
export function resolveDistortionLayers(project: EffectForgeProject): ResolvedDistortionLayer[] {
  const resolved: ResolvedDistortionLayer[] = [];

  for (const layer of project.layers) {
    if (layer.kind !== "distortion" || !layer.enabled) {
      continue;
    }
    resolved.push({ layer, effect: layer.effect });
  }

  return resolved;
}

export function hasDistortionLayers(project: EffectForgeProject): boolean {
  return resolveDistortionLayers(project).length > 0;
}
