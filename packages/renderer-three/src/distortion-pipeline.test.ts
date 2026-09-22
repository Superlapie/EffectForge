import { createDefaultDistortionLayer, createProject } from "@effectforge/core";
import { resolveDistortionLayers } from "@effectforge/distortion";
import { describe, expect, it } from "vitest";
import { DistortionPipeline } from "./distortion-pipeline.js";

describe("DistortionPipeline", () => {
  it("tracks active layer count from resolved layers", () => {
    const ripple = createDefaultDistortionLayer("Ripple");
    const project = createProject({ layers: [ripple] });
    const pipeline = new DistortionPipeline(320, 180);

    pipeline.setLayers(resolveDistortionLayers(project));
    expect(pipeline.activeLayerCount).toBe(1);

    pipeline.dispose();
  });
});
