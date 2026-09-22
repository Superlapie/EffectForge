import { createProject } from "@effectforge/core";
import { describe, expect, it } from "vitest";
import { exportProject, listExportTargets } from "./index.js";

describe("exportProject", () => {
  const project = createProject({ name: "Export Test" });

  it("lists all export targets", () => {
    expect(listExportTargets()).toEqual(["vanilla", "react-vite", "nextjs"]);
  });

  for (const target of ["vanilla", "react-vite", "nextjs"] as const) {
    it(`exports ${target} without editor dependencies`, () => {
      const result = exportProject(project, target);
      expect(result.target).toBe(target);
      expect(result.files.length).toBeGreaterThan(3);
      expect(result.files.some((file) => file.path === "package.json")).toBe(true);
      expect(result.files.some((file) => file.path.includes("effect-project.json"))).toBe(true);

      const combined = result.files.map((file) => file.content).join("\n");
      expect(combined).not.toMatch(/@effectforge\/editor/);
      expect(combined).toMatch(/@effectforge\/runtime/);
    });
  }

  it("embeds the project JSON in vanilla export", () => {
    const result = exportProject(project, "vanilla");
    const projectFile = result.files.find((file) => file.path === "src/effect-project.json");
    expect(projectFile?.content).toContain('"name": "Export Test"');
  });
});
