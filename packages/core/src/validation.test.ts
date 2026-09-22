import { describe, expect, it } from "vitest";
import { CURRENT_FORMAT_VERSION } from "@effectforge/schema";
import { createProject } from "./create-project.js";
import { validateProject, validateProjectModel } from "./validation.js";
import { FormatVersionError } from "./migrations/index.js";

describe("validateProject", () => {
  it("validates a raw document", () => {
    const project = createProject({ name: "Test" });
    const result = validateProject(project as Record<string, unknown>);
    expect(result.success).toBe(true);
    expect(result.project?.name).toBe("Test");
  });

  it("rejects newer format versions", () => {
    const project = createProject();
    const futureDoc = {
      ...project,
      formatVersion: CURRENT_FORMAT_VERSION + 1,
    };

    const result = validateProject(futureDoc as Record<string, unknown>);
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((d) => d.code === "FORMAT_VERSION_UNSUPPORTED")).toBe(
      true,
    );
  });

  it("detects duplicate layer IDs", () => {
    const project = createProject();
    const layer = {
      id: "layer_dup",
      name: "A",
      kind: "trail" as const,
      enabled: true,
      locked: false,
      opacity: 1,
      blendMode: "normal" as const,
      maxPoints: 100,
      width: 4,
      fade: 0.9,
      followPointer: true,
      minDistance: 2,
    };

    project.layers = [layer, { ...layer, name: "B" }];

    const result = validateProjectModel(project);
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((d) => d.code === "DUPLICATE_LAYER_ID")).toBe(true);
  });

  it("detects missing model asset references", () => {
    const project = createProject();
    project.layers = [
      {
        id: "layer_model",
        name: "Model",
        kind: "model",
        enabled: true,
        locked: false,
        opacity: 1,
        blendMode: "normal",
        modelAssetId: "missing_asset",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ];

    const result = validateProjectModel(project);
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((d) => d.code === "ASSET_REFERENCE_MISSING")).toBe(
      true,
    );
  });
});
