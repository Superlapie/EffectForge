import type { EffectForgeProject, TextLayer } from "@effectforge/schema";

export interface ResolvedTextLayer {
  layer: TextLayer;
}

/** Collect enabled text layers in project layer order. */
export function resolveTextLayers(project: EffectForgeProject): ResolvedTextLayer[] {
  const resolved: ResolvedTextLayer[] = [];

  for (const layer of project.layers) {
    if (layer.kind !== "text" || !layer.enabled) {
      continue;
    }
    resolved.push({ layer });
  }

  return resolved;
}

export function hasTextLayers(project: EffectForgeProject): boolean {
  return resolveTextLayers(project).length > 0;
}
