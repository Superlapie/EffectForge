export interface WorldPosition2D {
  x: number;
  y: number;
}

/** Convert normalized viewport coordinates [0, 1] to renderer world space. */
export function normalizedToWorld(
  normalizedX: number,
  normalizedY: number,
  aspect: number,
): WorldPosition2D {
  const x = (normalizedX * 2 - 1) * aspect;
  const y = -(normalizedY * 2 - 1);
  return { x, y };
}

/** Convert client pointer coordinates to renderer world space. */
export function clientToWorld(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
  aspect: number,
): WorldPosition2D {
  const normalizedX = (clientX - rect.left) / rect.width;
  const normalizedY = (clientY - rect.top) / rect.height;
  return normalizedToWorld(normalizedX, normalizedY, aspect);
}

/** Convert client pointer coordinates to normalized viewport coordinates [0, 1]. */
export function clientToNormalized(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
): { x: number; y: number } {
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  };
}
