import type { EditorController } from "./editor-controller.js";

function isModKey(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object" || !("tagName" in target)) {
    return false;
  }
  const element = target as HTMLElement;
  const tag = element.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    Boolean(element.isContentEditable)
  );
}

function hasDomTarget(target: EventTarget | null): boolean {
  return target !== null && typeof target === "object" && "tagName" in target;
}

/** Handle a keyboard event; returns true when consumed. */
export function handleEditorShortcut(controller: EditorController, event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();

  if (isModKey(event) && key === "z" && !event.shiftKey) {
    event.preventDefault();
    controller.undo();
    return true;
  }

  if (isModKey(event) && ((key === "z" && event.shiftKey) || key === "y")) {
    event.preventDefault();
    controller.redo();
    return true;
  }

  if (key === " " && hasDomTarget(event.target)) {
    if (isEditableTarget(event.target)) {
      return false;
    }
    event.preventDefault();
    controller.togglePlayback();
    return true;
  }

  if ((key === "delete" || key === "backspace") && hasDomTarget(event.target)) {
    if (isEditableTarget(event.target)) {
      return false;
    }
    const layerId = controller.getState().selectedLayerId;
    if (layerId) {
      event.preventDefault();
      controller.removeSelectedLayer();
      return true;
    }
  }

  return false;
}
