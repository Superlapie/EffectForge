import { createDefaultTextLayer, createProject } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { Scene } from "three";
import { TextScene } from "./text-scene.js";

describe("TextScene", () => {
  it("creates runtimes for enabled text layers", () => {
    const text = createDefaultTextLayer("Hello");
    const project = createProject({ layers: [text] });
    const scene = new Scene();
    const textScene = new TextScene(project, scene);

    expect(textScene.layerCount).toBe(1);
    textScene.dispose(scene);
  });

  it("syncs layer properties without rebuilding when ids are unchanged", () => {
    const text = createDefaultTextLayer("Hello");
    const project = createProject({ layers: [text] });
    const scene = new Scene();
    const textScene = new TextScene(project, scene);

    const updated = {
      ...project,
      layers: [
        {
          ...text,
          text: "EffectForge",
        },
      ],
    };

    expect(textScene.syncProjectLayers(updated)).toBe(true);
    textScene.dispose(scene);
  });
});
