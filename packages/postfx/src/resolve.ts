import type { EffectForgeProject, PostFxLayer } from "@effectforge/schema";

export interface ResolvedPostFxLayer {
  layer: PostFxLayer;
  effect: PostFxLayer["effect"];
}

/** Collect enabled postfx layers in project layer order. */
export function resolvePostFxLayers(project: EffectForgeProject): ResolvedPostFxLayer[] {
  const resolved: ResolvedPostFxLayer[] = [];

  for (const layer of project.layers) {
    if (layer.kind !== "postfx" || !layer.enabled) {
      continue;
    }
    resolved.push({ layer, effect: layer.effect });
  }

  return resolved;
}

export function hasPostFxLayers(project: EffectForgeProject): boolean {
  return resolvePostFxLayers(project).length > 0;
}
