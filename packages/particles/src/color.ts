/** Parse hex color (#RGB, #RRGGBB, #RRGGBBAA) to linear RGBA in [0, 1]. */
export function parseHexColor(hex: string): [number, number, number, number] {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;

  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0]! + normalized[0]!, 16) / 255;
    const g = Number.parseInt(normalized[1]! + normalized[1]!, 16) / 255;
    const b = Number.parseInt(normalized[2]! + normalized[2]!, 16) / 255;
    return [r, g, b, 1];
  }

  if (normalized.length === 6 || normalized.length === 8) {
    const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
    const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
    const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
    const a =
      normalized.length === 8 ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }

  return [1, 1, 1, 1];
}
