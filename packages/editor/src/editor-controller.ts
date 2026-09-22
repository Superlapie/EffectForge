import { CommandSession } from "@effectforge/commands";
import { createDefaultParticleLayer } from "@effectforge/core";
import type { EffectForgeProject, Layer } from "@effectforge/schema";
import type { EditorPlaybackState, EditorState } from "./editor-state.js";

export class EditorController {
  private session: CommandSession;
  private selectedLayerId: string | null;
  private playback: EditorPlaybackState = { playing: true, currentTime: 0 };
  private revision = 0;
  private readonly listeners = new Set<() => void>();

  constructor(project: EffectForgeProject) {
    this.session = new CommandSession(project);
    this.selectedLayerId = project.layers[0]?.id ?? null;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): EditorState {
    return {
      project: this.session.getProject(),
      selectedLayerId: this.selectedLayerId,
      playback: { ...this.playback },
      canUndo: this.session.canUndo(),
      canRedo: this.session.canRedo(),
      revision: this.revision,
    };
  }

  selectLayer(layerId: string | null): void {
    if (layerId === null || this.session.getProject().layers.some((layer) => layer.id === layerId)) {
      this.selectedLayerId = layerId;
      this.notify();
    }
  }

  setProjectName(name: string): void {
    this.execute({ type: "SetProjectName", payload: { name } });
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    this.execute({ type: "SetLayerOpacity", payload: { layerId, opacity } });
  }

  setLayerEnabled(layerId: string, enabled: boolean): void {
    this.execute({ type: "SetLayerEnabled", payload: { layerId, enabled } });
  }

  setLayerName(layerId: string, name: string): void {
    this.execute({ type: "SetLayerName", payload: { layerId, name } });
  }

  setEmitterRate(layerId: string, rate: number): void {
    this.execute({
      type: "SetEmitterParameter",
      payload: { layerId, parameter: "rate", value: rate },
    });
  }

  setParticleNumericConstant(
    layerId: string,
    parameter: "lifetime" | "speed" | "size" | "initialOpacity",
    value: number,
  ): void {
    this.execute({
      type: "SetParticleParameter",
      payload: {
        layerId,
        parameter,
        value: { kind: "constant", value },
      },
    });
  }

  setBehaviorProperty(layerId: string, behaviorIndex: number, path: string, value: unknown): void {
    this.execute({
      type: "SetLayerProperty",
      payload: {
        layerId,
        path: `behaviors.${behaviorIndex}.${path}`,
        value,
      },
    });
  }

  addParticleLayer(): void {
    const layer = createDefaultParticleLayer(`Layer ${this.session.getProject().layers.length + 1}`);
    this.execute({ type: "AddLayer", payload: { layer } });
    this.selectedLayerId = layer.id;
    this.notify();
  }

  duplicateLayer(layerId: string): void {
    const beforeIds = new Set(this.session.getProject().layers.map((layer) => layer.id));
    this.execute({ type: "DuplicateLayer", payload: { layerId } });
    const created = this.session.getProject().layers.find((layer) => !beforeIds.has(layer.id));
    if (created) {
      this.selectedLayerId = created.id;
      this.notify();
    }
  }

  removeLayer(layerId: string): void {
    this.execute({ type: "RemoveLayer", payload: { layerId } });
    if (this.selectedLayerId === layerId) {
      this.selectedLayerId = this.session.getProject().layers[0]?.id ?? null;
      this.notify();
    }
  }

  removeSelectedLayer(): void {
    if (this.selectedLayerId) {
      this.removeLayer(this.selectedLayerId);
    }
  }

  reorderLayer(layerId: string, toIndex: number): void {
    this.execute({ type: "ReorderLayer", payload: { layerId, toIndex } });
  }

  undo(): void {
    this.session.undo();
    this.ensureSelectionValid();
    this.notify();
  }

  redo(): void {
    this.session.redo();
    this.ensureSelectionValid();
    this.notify();
  }

  setPlaying(playing: boolean): void {
    this.playback.playing = playing;
    this.notify();
  }

  togglePlayback(): void {
    this.playback.playing = !this.playback.playing;
    this.notify();
  }

  setCurrentTime(time: number): void {
    const duration = this.session.getProject().timeline.duration;
    this.playback.currentTime = Math.min(Math.max(0, time), duration);
    this.notify();
  }

  loadProject(project: EffectForgeProject): void {
    this.session = new CommandSession(project);
    this.selectedLayerId = project.layers[0]?.id ?? null;
    this.playback = { playing: true, currentTime: 0 };
    this.notify();
  }

  execute(command: unknown): void {
    this.session.execute(command);
    this.notify();
  }

  executeOpacityDrag(layerId: string, opacity: number): void {
    this.session.executeTransaction((session) => {
      session.execute({
        type: "SetLayerOpacity",
        payload: { layerId, opacity },
      });
    }, "SetLayerOpacity");
  }

  private ensureSelectionValid(): void {
    const layers = this.session.getProject().layers;
    if (this.selectedLayerId && !layers.some((layer) => layer.id === this.selectedLayerId)) {
      this.selectedLayerId = layers[0]?.id ?? null;
    }
  }

  private notify(): void {
    this.revision += 1;
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function createEditorController(project: EffectForgeProject): EditorController {
  return new EditorController(project);
}
