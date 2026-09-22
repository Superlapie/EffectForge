import { describe, expect, it } from "vitest";
import type { TextLayer } from "@effectforge/schema";
import { computeTextGlyphStates } from "./effects.js";
import { layoutText } from "./layout.js";

function createLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  return {
    id: "layer_text",
    name: "Text",
    kind: "text",
    enabled: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    text: "FX",
    fontSize: 48,
    fontWeight: 400,
    alignment: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    effectMode: "fade",
    duration: 2,
    ...overrides,
  };
}

describe("computeTextGlyphStates", () => {
  it("fades all glyphs in together", () => {
    const layer = createLayer({ effectMode: "fade" });
    const layout = layoutText(layer);
    const states = computeTextGlyphStates(layer, layout.glyphs, 0.5, 42);

    expect(states).toHaveLength(2);
    expect(states.every((state) => state.opacity === 0.5)).toBe(true);
  });

  it("staggers glyph reveal across characters", () => {
    const layer = createLayer({ text: "ABC", effectMode: "stagger" });
    const layout = layoutText(layer);
    const states = computeTextGlyphStates(layer, layout.glyphs, 0.2, 42);

    expect(states[0]?.opacity).toBeGreaterThan(states[1]?.opacity ?? 0);
    expect(states[1]?.opacity).toBeGreaterThanOrEqual(states[2]?.opacity ?? 0);
  });

  it("produces deterministic scramble characters", () => {
    const layer = createLayer({ effectMode: "scramble" });
    const layout = layoutText(layer);
    const first = computeTextGlyphStates(layer, layout.glyphs, 0.1, 99);
    const second = computeTextGlyphStates(layer, layout.glyphs, 0.1, 99);

    expect(first[0]?.displayChar).toBe(second[0]?.displayChar);
    expect(first[0]?.displayChar).not.toBe(layer.text[0]);
  });

  it("moves glyphs toward their targets during particle assemble", () => {
    const layer = createLayer({ text: "A", effectMode: "particle-assemble" });
    const layout = layoutText(layer);
    const start = computeTextGlyphStates(layer, layout.glyphs, 0, 7)[0];
    const end = computeTextGlyphStates(layer, layout.glyphs, 1, 7)[0];

    expect(start?.x).not.toBe(end?.x);
    expect(end?.x).toBeCloseTo(layout.glyphs[0]?.x ?? 0, 5);
    expect(end?.opacity).toBe(1);
  });
});
