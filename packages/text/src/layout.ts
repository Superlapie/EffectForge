import type { TextLayer } from "@effectforge/schema";

export interface TextLayoutGlyph {
  char: string;
  x: number;
  y: number;
  lineIndex: number;
  charIndex: number;
}

export interface TextLayoutBounds {
  width: number;
  height: number;
  glyphs: TextLayoutGlyph[];
}

/** Estimate glyph width for layout without measuring in a canvas. */
export function estimateGlyphWidth(layer: TextLayer): number {
  return layer.fontSize * 0.58 + layer.letterSpacing;
}

/** Lay out text glyphs in pixel space centered around the origin. */
export function layoutText(layer: TextLayer): TextLayoutBounds {
  const lines = layer.text.split("\n");
  const glyphWidth = estimateGlyphWidth(layer);
  const lineHeight = layer.fontSize * layer.lineHeight;
  const glyphs: TextLayoutGlyph[] = [];

  let maxLineWidth = 0;
  for (const line of lines) {
    maxLineWidth = Math.max(maxLineWidth, line.length * glyphWidth);
  }

  const totalHeight = lines.length * lineHeight;
  let charIndex = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] ?? "";
    const lineWidth = line.length * glyphWidth;
    let startX = 0;
    if (layer.alignment === "center") {
      startX = -lineWidth / 2;
    } else if (layer.alignment === "right") {
      startX = -lineWidth;
    }

    const y = totalHeight / 2 - lineIndex * lineHeight - lineHeight / 2;
    for (let column = 0; column < line.length; column += 1) {
      glyphs.push({
        char: line[column] ?? " ",
        x: startX + column * glyphWidth,
        y,
        lineIndex,
        charIndex,
      });
      charIndex += 1;
    }
  }

  return {
    width: Math.max(maxLineWidth, glyphWidth),
    height: Math.max(totalHeight, lineHeight),
    glyphs,
  };
}

/** Convert authored font size to renderer world units. */
export function textSizeToWorld(fontSize: number): number {
  return fontSize * 0.0012;
}
