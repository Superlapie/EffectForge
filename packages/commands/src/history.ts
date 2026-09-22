import { enablePatches, produceWithPatches, applyPatches, type Patch } from "immer";

enablePatches();
import type { EffectForgeProject } from "@effectforge/schema";

export interface HistoryEntry {
  label?: string;
  patches: Patch[];
  inversePatches: Patch[];
}

export interface CommandHistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export function createHistoryState(): CommandHistoryState {
  return { past: [], future: [] };
}

export function recordHistoryEntry(
  state: CommandHistoryState,
  entry: HistoryEntry,
  maxEntries = 200,
): CommandHistoryState {
  const past = [...state.past, entry];
  if (past.length > maxEntries) {
    past.shift();
  }
  return { past, future: [] };
}

export function applyProjectPatches(
  project: EffectForgeProject,
  patches: Patch[],
): EffectForgeProject {
  return applyPatches(project, patches) as EffectForgeProject;
}

export function createPatches(
  base: EffectForgeProject,
  recipe: (draft: EffectForgeProject) => void,
): { result: EffectForgeProject; patches: Patch[]; inversePatches: Patch[] } {
  const [result, patches, inversePatches] = produceWithPatches(base, recipe);
  return { result, patches, inversePatches };
}

export function canUndo(state: CommandHistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: CommandHistoryState): boolean {
  return state.future.length > 0;
}

export function undoProject(
  project: EffectForgeProject,
  state: CommandHistoryState,
): { project: EffectForgeProject; history: CommandHistoryState } | null {
  const entry = state.past[state.past.length - 1];
  if (!entry) {
    return null;
  }

  const nextProject = applyProjectPatches(project, entry.inversePatches);
  return {
    project: nextProject,
    history: {
      past: state.past.slice(0, -1),
      future: [...state.future, entry],
    },
  };
}

export function redoProject(
  project: EffectForgeProject,
  state: CommandHistoryState,
): { project: EffectForgeProject; history: CommandHistoryState } | null {
  const entry = state.future[state.future.length - 1];
  if (!entry) {
    return null;
  }

  const nextProject = applyProjectPatches(project, entry.patches);
  return {
    project: nextProject,
    history: {
      past: [...state.past, entry],
      future: state.future.slice(0, -1),
    },
  };
}
