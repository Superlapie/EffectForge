import { describe, expect, it } from "vitest";
import { createProject, createDefaultParticleLayer } from "@effectforge/core";
import { createEditorController } from "./editor-controller.js";
import { getSelectedLayer } from "./editor-state.js";

describe("EditorController", () => {
  it("selects the first layer by default", () => {
    const layer = createDefaultParticleLayer("Stars");
    const controller = createEditorController(createProject({ layers: [layer] }));
    const state = controller.getState();

    expect(state.selectedLayerId).toBe(layer.id);
    expect(getSelectedLayer(state)?.name).toBe("Stars");
  });

  it("applies commands and supports undo/redo", () => {
    const controller = createEditorController(createProject({ name: "Original" }));

    controller.setProjectName("Renamed");
    expect(controller.getState().project.name).toBe("Renamed");
    expect(controller.getState().canUndo).toBe(true);

    controller.undo();
    expect(controller.getState().project.name).toBe("Original");

    controller.redo();
    expect(controller.getState().project.name).toBe("Renamed");
  });

  it("adds and removes layers while keeping selection valid", () => {
    const controller = createEditorController(createProject());
    const beforeRevision = controller.getState().projectRevision;

    controller.addParticleLayer();
    const added = controller.getState();
    expect(added.project.layers).toHaveLength(1);
    expect(added.selectedLayerId).toBe(added.project.layers[0]?.id);
    expect(added.projectRevision).toBeGreaterThan(beforeRevision);

    const layerId = added.selectedLayerId!;
    controller.removeLayer(layerId);
    expect(controller.getState().project.layers).toHaveLength(0);
    expect(controller.getState().selectedLayerId).toBeNull();
  });

  it("tracks playback state independently from project commands", () => {
    const controller = createEditorController(createProject());
    const initialRevision = controller.getState().projectRevision;

    controller.togglePlayback();
    expect(controller.getState().playback.playing).toBe(false);
    expect(controller.getState().projectRevision).toBe(initialRevision);

    controller.setCurrentTime(2.5);
    expect(controller.getState().playback.currentTime).toBe(2.5);
    expect(controller.getState().projectRevision).toBe(initialRevision);
  });

  it("reloads project and resets playback", () => {
    const controller = createEditorController(createProject({ name: "A" }));
    const initialLoadRevision = controller.getState().loadRevision;
    controller.setProjectName("B");
    controller.setCurrentTime(1);
    controller.setPlaying(false);

    controller.loadProject(createProject({ name: "Fresh" }));
    const state = controller.getState();
    expect(state.project.name).toBe("Fresh");
    expect(state.playback.playing).toBe(true);
    expect(state.playback.currentTime).toBe(0);
    expect(state.canUndo).toBe(false);
    expect(state.loadRevision).toBe(initialLoadRevision + 1);
  });
});
