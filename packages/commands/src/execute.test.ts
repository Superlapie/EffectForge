import { describe, expect, it } from "vitest";
import { createProject, createDefaultParticleLayer } from "@effectforge/core";
import { executeCommand } from "./execute.js";
import { CommandSession } from "./session.js";
import { LayerNotFoundError } from "./errors.js";

describe("executeCommand", () => {
  it("adds and removes a layer", () => {
    const project = createProject();
    const layer = createDefaultParticleLayer("Stardust");

    const added = executeCommand(project, {
      type: "AddLayer",
      payload: { layer },
    });
    expect(added.project.layers).toHaveLength(1);
    expect(added.project.layers[0]?.name).toBe("Stardust");

    const removed = executeCommand(added.project, {
      type: "RemoveLayer",
      payload: { layerId: layer.id },
    });
    expect(removed.project.layers).toHaveLength(0);
  });

  it("modifies layer opacity", () => {
    const layer = createDefaultParticleLayer();
    const project = createProject({ layers: [layer] });

    const result = executeCommand(project, {
      type: "SetLayerOpacity",
      payload: { layerId: layer.id, opacity: 0.5 },
    });

    expect(result.project.layers[0]?.opacity).toBe(0.5);
  });

  it("throws when layer is missing", () => {
    const project = createProject();
    expect(() =>
      executeCommand(project, {
        type: "RemoveLayer",
        payload: { layerId: "missing" },
      }),
    ).toThrow(LayerNotFoundError);
  });
});

describe("CommandSession", () => {
  it("supports undo and redo", () => {
    const project = createProject({ name: "Original" });
    const session = new CommandSession(project);

    session.execute({ type: "SetProjectName", payload: { name: "Renamed" } });
    expect(session.getProject().name).toBe("Renamed");
    expect(session.canUndo()).toBe(true);

    session.undo();
    expect(session.getProject().name).toBe("Original");
    expect(session.canRedo()).toBe(true);

    session.redo();
    expect(session.getProject().name).toBe("Renamed");
  });

  it("groups slider changes into a single undo entry via transaction", () => {
    const layer = createDefaultParticleLayer();
    const session = new CommandSession(createProject({ layers: [layer] }));

    session.execute({ type: "BeginTransaction", payload: { label: "opacity-drag" } });

    for (const opacity of [0.9, 0.8, 0.7, 0.6, 0.5]) {
      session.execute({
        type: "SetLayerOpacity",
        payload: { layerId: layer.id, opacity },
      });
    }

    session.execute({ type: "CommitTransaction", payload: {} });
    expect(session.getProject().layers[0]?.opacity).toBe(0.5);

    // One undo should restore pre-drag state
    session.undo();
    expect(session.getProject().layers[0]?.opacity).toBe(1);
  });

  it("rolls back transaction on failure via executeTransaction", () => {
    const layer = createDefaultParticleLayer();
    const session = new CommandSession(createProject({ layers: [layer] }));

    expect(() =>
      session.executeTransaction((s) => {
        s.execute({
          type: "SetLayerOpacity",
          payload: { layerId: layer.id, opacity: 0.25 },
        });
        throw new Error("simulated failure");
      }),
    ).toThrow("simulated failure");

    expect(session.getProject().layers[0]?.opacity).toBe(1);
    expect(session.canUndo()).toBe(false);
  });

  it("truncates redo history after branching", () => {
    const session = new CommandSession(createProject({ name: "A" }));

    session.execute({ type: "SetProjectName", payload: { name: "B" } });
    session.execute({ type: "SetProjectName", payload: { name: "C" } });
    session.undo();
    session.execute({ type: "SetProjectName", payload: { name: "D" } });

    expect(session.getProject().name).toBe("D");
    expect(session.canRedo()).toBe(false);
  });
});
