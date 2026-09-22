import { createDefaultPostFxLayer, createProject } from "@effectforge/core";
import { resolvePostFxLayers } from "@effectforge/postfx";
import { describe, expect, it } from "vitest";
import { PostFxPipeline } from "./postfx-pipeline.js";

describe("PostFxPipeline", () => {
  it("tracks active layer count from resolved layers", () => {
    const bloom = createDefaultPostFxLayer("Bloom");
    const project = createProject({ layers: [bloom] });
    const pipeline = new PostFxPipeline(320, 180);

    pipeline.setLayers(resolvePostFxLayers(project));
    expect(pipeline.activeLayerCount).toBe(1);

    pipeline.dispose();
  });
});
