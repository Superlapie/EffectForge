"use client";

import {
  handleEditorShortcut,
  type EditorController,
} from "@effectforge/editor";
import { createProjectFromPreset } from "@effectforge/presets";
import { useEffect, useMemo } from "react";
import { EffectViewport } from "../effect-viewport";
import { saveProjectArchive } from "./project-io";
import { EditorTimeline } from "./editor-timeline";
import { EditorToolbar } from "./editor-toolbar";
import { LayerInspector } from "./layer-inspector";
import { LayerPanel } from "./layer-panel";
import { useEditorController, useEditorState } from "./use-editor-controller";

export function EditorWorkspace() {
  const initialProject = useMemo(
    () => createProjectFromPreset("cursor-attract-sparkles"),
    [],
  );
  const controller = useEditorController(initialProject);
  const state = useEditorState(controller);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        const target = event.target;
        if (
          target &&
          typeof target === "object" &&
          "tagName" in target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT")
        ) {
          return;
        }
        event.preventDefault();
        saveProjectArchive(controller);
        return;
      }
      handleEditorShortcut(controller, event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controller]);

  return (
    <div className="flex min-h-full flex-col bg-background-0">
      <EditorToolbar controller={controller} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <LayerPanel controller={controller} />
        <section className="relative min-h-[280px] flex-1 overflow-hidden bg-black">
          <EffectViewport
            project={state.project}
            projectRevision={state.projectRevision}
            playing={state.playback.playing}
            currentTime={state.playback.currentTime}
            onTimeUpdate={(time) => {
              const current = controller.getState();
              if (!current.playback.playing) {
                return;
              }
              const duration = current.project.timeline.duration;
              const clamped = Math.min(Math.max(0, time), duration);
              if (Math.abs(clamped - current.playback.currentTime) > 0.02) {
                controller.setCurrentTime(clamped);
              }
            }}
            className="absolute inset-0"
          />
        </section>
        <LayerInspector controller={controller} />
      </div>
      <EditorTimeline controller={controller} />
    </div>
  );
}
