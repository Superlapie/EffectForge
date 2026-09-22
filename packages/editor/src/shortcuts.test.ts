import { describe, expect, it, vi } from "vitest";
import { createProject } from "@effectforge/core";
import { createEditorController } from "./editor-controller.js";
import { handleEditorShortcut } from "./shortcuts.js";

function mockTarget(tagName: string, isContentEditable = false): HTMLElement {
  return { tagName, isContentEditable } as HTMLElement;
}

function keyboardEvent(
  key: string,
  target: EventTarget | null,
  options: { ctrlKey?: boolean; shiftKey?: boolean } = {},
): KeyboardEvent {
  return {
    key,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: false,
    shiftKey: options.shiftKey ?? false,
    target,
    preventDefault: vi.fn(),
  } as KeyboardEvent;
}

describe("handleEditorShortcut", () => {
  it("undoes with ctrl+z", () => {
    const controller = createEditorController(createProject({ name: "A" }));
    controller.setProjectName("B");

    const event = keyboardEvent("z", mockTarget("DIV"), { ctrlKey: true });
    const consumed = handleEditorShortcut(controller, event);

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(controller.getState().project.name).toBe("A");
  });

  it("toggles playback with space outside inputs", () => {
    const controller = createEditorController(createProject());
    const event = keyboardEvent(" ", mockTarget("DIV"));

    const consumed = handleEditorShortcut(controller, event);
    expect(consumed).toBe(true);
    expect(controller.getState().playback.playing).toBe(false);
  });

  it("ignores space when typing in an input", () => {
    const controller = createEditorController(createProject());
    const event = keyboardEvent(" ", mockTarget("INPUT"));

    const consumed = handleEditorShortcut(controller, event);
    expect(consumed).toBe(false);
    expect(controller.getState().playback.playing).toBe(true);
  });

  it("removes the selected layer with delete", () => {
    const controller = createEditorController(createProject());
    controller.addParticleLayer();
    expect(controller.getState().project.layers).toHaveLength(1);

    const event = keyboardEvent("Delete", mockTarget("DIV"));
    const consumed = handleEditorShortcut(controller, event);

    expect(consumed).toBe(true);
    expect(controller.getState().project.layers).toHaveLength(0);
  });
});
