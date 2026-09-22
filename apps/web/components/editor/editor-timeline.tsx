"use client";

import type { EditorController } from "@effectforge/editor";
import { useEditorState } from "./use-editor-controller";

interface EditorTimelineProps {
  controller: EditorController;
}

export function EditorTimeline({ controller }: EditorTimelineProps) {
  const state = useEditorState(controller);
  const duration = state.project.timeline.duration;
  const currentTime = state.playback.currentTime;

  return (
    <footer className="border-t border-border-subtle bg-background-1 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
        <span>Timeline</span>
        <span className="tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={(event) => controller.setCurrentTime(Number(event.target.value))}
        className="w-full accent-accent"
        aria-label="Timeline scrubber"
      />
      <div className="mt-1 flex justify-between text-[10px] text-text-muted">
        <span>0s</span>
        <span>{formatTime(duration)}</span>
      </div>
    </footer>
  );
}

function formatTime(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}
