import { describe, expect, it } from "vitest";
import { createProject } from "@effectforge/core";
import { strToU8, zipSync } from "fflate";
import { packProject, suggestArchiveFilename } from "./pack.js";
import { unpackProject } from "./unpack.js";
import { ArchiveError } from "./errors.js";

describe("project-format archive", () => {
  it("round-trips a project through pack and unpack", () => {
    const project = createProject({ name: "Round Trip" });
    const packed = packProject(project);
    const unpacked = unpackProject(packed.bytes);

    expect(unpacked.project.name).toBe("Round Trip");
    expect(unpacked.metadata?.projectId).toBe(project.id);
    expect(unpacked.project.metadata.updatedAt).toBeDefined();
  });

  it("suggests a safe archive filename", () => {
    const project = createProject({ name: "My Cool Effect!" });
    expect(suggestArchiveFilename(project)).toBe("my-cool-effect.effectforge");
  });

  it("rejects archives missing project.json", () => {
    const bytes = zipSync({ "metadata.json": strToU8("{}") });
    expect(() => unpackProject(bytes)).toThrow(ArchiveError);
    expect(() => unpackProject(bytes)).toThrow(/missing required project\.json/i);
  });

  it("rejects path traversal entries", () => {
    const project = createProject();
    const packed = packProject(project);
    const tampered = zipSync({
      "../escape.txt": strToU8("bad"),
      "project.json": strToU8(JSON.stringify(project)),
    });
    expect(() => unpackProject(tampered)).toThrow(/unsafe archive path/i);
    expect(unpackProject(packed.bytes).project.id).toBe(project.id);
  });

  it("rejects unsupported root entries", () => {
    const project = createProject();
    const bytes = zipSync({
      "project.json": strToU8(JSON.stringify(project)),
      "evil.exe": strToU8("bad"),
    });
    expect(() => unpackProject(bytes)).toThrow(/not allowed/i);
  });

  it("includes optional assets when packing", () => {
    const project = createProject({ name: "With Assets" });
    const texture = strToU8("fake-texture");
    const packed = packProject(project, {
      assets: { "assets/textures/spark.png": texture },
    });
    const unpacked = unpackProject(packed.bytes);
    expect(unpacked.assets["assets/textures/spark.png"]).toEqual(texture);
  });
});
