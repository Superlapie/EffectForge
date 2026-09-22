import type { EffectForgeProject, Layer } from "@effectforge/schema";

export interface EditorPlaybackState {
  playing: boolean;
  currentTime: number;
}

export interface EditorState {
  project: EffectForgeProject;
  selectedLayerId: string | null;
  playback: EditorPlaybackState;
  canUndo: boolean;
  canRedo: boolean;
  /** Increments on every editor mutation for viewport sync. */
  revision: number;
}

export function getSelectedLayer(state: EditorState): Layer | null {
  if (!state.selectedLayerId) {
    return null;
  }
  return state.project.layers.find((layer) => layer.id === state.selectedLayerId) ?? null;
}
