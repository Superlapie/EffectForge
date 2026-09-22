"use client";

import type { EditorController } from "@effectforge/editor";
import { listPresets, type PresetId } from "@effectforge/presets";
import { useEditorState } from "./use-editor-controller";

interface EditorToolbarProps {
  controller: EditorController;
}

export function EditorToolbar({ controller }: EditorToolbarProps) {
  const state = useEditorState(controller);

  const loadPreset = (presetId: PresetId) => {
    const preset = listPresets().find((entry) => entry.id === presetId);
    if (preset) {
      controller.loadProject(preset.create());
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border-subtle bg-background-1 px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="text"
          value={state.project.name}
          onChange={(event) => controller.setProjectName(event.target.value)}
          className="min-w-0 max-w-xs rounded-md border border-border-subtle bg-background-0 px-2 py-1 text-sm font-medium text-text-primary"
          aria-label="Project name"
        />
        <select
          onChange={(event) => loadPreset(event.target.value as PresetId)}
          className="rounded-md border border-border-subtle bg-background-0 px-2 py-1 text-xs text-text-secondary"
          defaultValue=""
          aria-label="Load preset"
        >
          <option value="" disabled>Load preset…</option>
          {listPresets().map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton
          label="Undo"
          disabled={!state.canUndo}
          onClick={() => controller.undo()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!state.canRedo}
          onClick={() => controller.redo()}
        >
          ↷
        </ToolbarButton>
        <ToolbarButton
          label={state.playback.playing ? "Pause" : "Play"}
          onClick={() => controller.togglePlayback()}
          active={state.playback.playing}
        >
          {state.playback.playing ? "❚❚" : "▶"}
        </ToolbarButton>
      </div>
    </header>
  );
}

function ToolbarButton({
  label,
  children,
  disabled,
  active,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-md border px-2 py-1 text-sm transition-colors",
        disabled
          ? "cursor-not-allowed border-border-subtle text-text-muted opacity-50"
          : active
            ? "border-accent bg-accent/20 text-text-primary"
            : "border-border-subtle bg-background-0 text-text-secondary hover:border-border-strong hover:text-text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
