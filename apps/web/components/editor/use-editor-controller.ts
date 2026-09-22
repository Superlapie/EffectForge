"use client";

import {
  createEditorController,
  type EditorController,
  type EditorState,
} from "@effectforge/editor";
import type { EffectForgeProject } from "@effectforge/schema";
import { useMemo, useSyncExternalStore } from "react";

export function useEditorController(initialProject: EffectForgeProject): EditorController {
  const controller = useMemo(() => createEditorController(initialProject), [initialProject]);
  return controller;
}

export function useEditorState(controller: EditorController): EditorState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
    () => controller.getState(),
  );
}
