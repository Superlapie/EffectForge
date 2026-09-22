import type { PointerInteractionState } from "@effectforge/pointer";

export type PointerInteractionContext = PointerInteractionState;

export function layerSupportsPointerInteraction(behaviors: { type: string }[]): boolean {
  return behaviors.some(
    (behavior) => behavior.type === "cursor-attract" || behavior.type === "cursor-repel",
  );
}
