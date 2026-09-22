import { validateProjectModel } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { createProjectFromPreset, listPresets } from "./index.js";

describe("effect presets", () => {
  it("lists production presets", () => {
    expect(listPresets()).toHaveLength(5);
  });

  it("creates valid projects for every preset", () => {
    for (const preset of listPresets()) {
      const project = createProjectFromPreset(preset.id, 1);
      const result = validateProjectModel(project);
      expect(result.success).toBe(true);
      expect(project.layers.length).toBeGreaterThan(0);
    }
  });
});
