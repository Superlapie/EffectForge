import { describe, expect, it } from "vitest";
import type { TextLayer } from "@effectforge/schema";
import { TextSystem } from "./system.js";

function createLayer(): TextLayer {
  return {
    id: "layer_text",
    name: "Text",
    kind: "text",
    enabled: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    text: "Hello",
    fontSize: 48,
    fontWeight: 400,
    alignment: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    effectMode: "fade",
    duration: 2,
  };
}

describe("TextSystem", () => {
  it("advances elapsed time during simulation", () => {
    const system = new TextSystem({ layer: createLayer(), projectSeed: 1 });
    system.simulate(0.5);
    expect(system.time).toBe(0.5);
    expect(system.getProgress()).toBe(0.25);
  });

  it("loops progress using layer duration", () => {
    const system = new TextSystem({ layer: createLayer(), projectSeed: 1 });
    system.seek(2.5);
    expect(system.getProgress()).toBe(0.25);
  });

  it("rebuilds layout when text changes", () => {
    const system = new TextSystem({ layer: createLayer(), projectSeed: 1 });
    const initial = system.getLayout().glyphs.length;
    system.updateLayer({ ...createLayer(), text: "Hello World" });
    expect(system.getLayout().glyphs.length).toBeGreaterThan(initial);
  });
});
