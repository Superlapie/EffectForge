import { createProject } from "@effectforge/core";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it, beforeEach } from "vitest";
import { packPresetBundle, unpackPresetBundle, PresetBundleError } from "./bundle.js";
import { PRESET_JSON_PATH, slugifyPresetId } from "./manifest.js";
import { clearImportedPresets, importPresetBundle, listAllPresets } from "./registry.js";
import { PROJECT_JSON_PATH } from "@effectforge/project-format";

describe("preset bundles", () => {
  beforeEach(() => {
    clearImportedPresets();
  });

  it("round-trips a project through pack and unpack", () => {
    const project = createProject({ name: "My Custom Effect" });
    const packed = packPresetBundle(project, {
      description: "A sharable starter effect",
      tags: ["custom"],
    });
    const unpacked = unpackPresetBundle(packed.bytes);

    expect(unpacked.manifest.id).toBe(slugifyPresetId(project.name));
    expect(unpacked.manifest.description).toBe("A sharable starter effect");
    expect(unpacked.project.name).toBe("My Custom Effect");
  });

  it("registers imported bundles for the session preset list", () => {
    const project = createProject({ name: "Shared Sparkles" });
    const packed = packPresetBundle(project, { id: "shared-sparkles" });
    importPresetBundle(packed.bytes);

    expect(listAllPresets().some((preset) => preset.id === "shared-sparkles")).toBe(true);
  });

  it("rejects bundles missing preset.json", () => {
    const project = createProject();
    const bytes = zipSync({
      [PROJECT_JSON_PATH]: strToU8(JSON.stringify(project)),
    });
    expect(() => unpackPresetBundle(bytes)).toThrow(PresetBundleError);
    expect(() => unpackPresetBundle(bytes)).toThrow(/missing required preset\.json/i);
  });

  it("rejects path traversal entries", () => {
    const project = createProject();
    const packed = packPresetBundle(project);
    const tampered = zipSync({
      "../escape.txt": strToU8("bad"),
      [PRESET_JSON_PATH]: strToU8(JSON.stringify(packed.manifest)),
      [PROJECT_JSON_PATH]: strToU8(JSON.stringify(project)),
    });
    expect(() => unpackPresetBundle(tampered)).toThrow(/unsafe archive path/i);
  });
});
