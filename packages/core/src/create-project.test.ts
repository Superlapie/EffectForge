import { describe, expect, it } from "vitest";
import { CURRENT_FORMAT_VERSION, FORMAT_NAME } from "@effectforge/schema";
import { createProject, createDefaultParticleLayer } from "./create-project.js";
import { validateProjectModel } from "./validation.js";

describe("createProject", () => {
  it("creates a valid project with defaults", () => {
    const project = createProject({ name: "Stardust Trail", seed: 183742 });

    expect(project.format).toBe(FORMAT_NAME);
    expect(project.formatVersion).toBe(CURRENT_FORMAT_VERSION);
    expect(project.name).toBe("Stardust Trail");
    expect(project.seed).toBe(183742);
    expect(project.canvas.width).toBe(1920);
    expect(project.layers).toHaveLength(0);

    const result = validateProjectModel(project);
    expect(result.success).toBe(true);
  });

  it("creates a default particle layer that validates", () => {
    const layer = createDefaultParticleLayer("Stardust");
    const project = createProject({ layers: [layer] });

    const result = validateProjectModel(project);
    expect(result.success).toBe(true);
    expect(project.layers[0]?.kind).toBe("particles");
  });
});
