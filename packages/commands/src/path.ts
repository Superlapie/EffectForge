import type { Layer } from "@effectforge/schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Set a nested property on a layer using a dot-separated path.
 * Used by SetLayerProperty for inspector slider updates.
 */
export function setNestedProperty(layer: Layer, path: string, value: unknown): Layer {
  const segments = path.split(".");
  if (segments.length === 0) {
    return layer;
  }

  const clone = structuredClone(layer) as Record<string, unknown>;
  let cursor: Record<string, unknown> = clone;

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (key === undefined) continue;
    const next = cursor[key];
    if (!isRecord(next)) {
      throw new Error(`Invalid path "${path}": "${key}" is not an object.`);
    }
    cursor = next;
  }

  const lastKey = segments[segments.length - 1];
  if (lastKey === undefined) {
    return layer;
  }
  cursor[lastKey] = value;

  return clone as Layer;
}
