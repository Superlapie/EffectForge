import { createDefaultTrailLayer, createProject } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { Scene } from "three";
import { TrailScene } from "./trail-scene.js";

describe("TrailScene", () => {
  it("creates runtimes for enabled trail layers", () => {
    const trail = createDefaultTrailLayer("Trail");
    const project = createProject({ layers: [trail] });
    const scene = new Scene();
    const trailScene = new TrailScene(project, scene, null);

    expect(trailScene.layerCount).toBe(1);

    trailScene.simulate(1 / 60);
    trailScene.syncMeshes();

    trailScene.dispose(scene);
    expect(scene.children.length).toBe(0);
  });

  it("syncs layer edits in place without rebuilding runtimes", () => {
    const layer = createDefaultTrailLayer("Trail");
    const project = createProject({ layers: [layer] });
    const scene = new Scene();
    const trailScene = new TrailScene(project, scene, null);

    const updated = {
      ...project,
      layers: [{ ...layer, width: 12, fade: 0.5 }],
    };
    expect(trailScene.syncProjectLayers(updated)).toBe(true);

    trailScene.dispose(scene);
  });
});
