"use client";

import type { EditorController } from "@effectforge/editor";
import type { Layer } from "@effectforge/schema";
import { useEditorState } from "./use-editor-controller";

interface LayerPanelProps {
  controller: EditorController;
}

export function LayerPanel({ controller }: LayerPanelProps) {
  const state = useEditorState(controller);
  const layers = [...state.project.layers].reverse();

  return (
    <aside className="flex w-full flex-col border-b border-border-subtle lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Layers</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => controller.addParticleLayer()}
            className="rounded border border-border-subtle px-2 py-0.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
          >
            + Particle
          </button>
          <button
            type="button"
            onClick={() => controller.addTrailLayer()}
            className="rounded border border-border-subtle px-2 py-0.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
          >
            + Trail
          </button>
          <button
            type="button"
            onClick={() => controller.addDistortionLayer("ripple")}
            className="rounded border border-border-subtle px-2 py-0.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
          >
            + Ripple
          </button>
          <button
            type="button"
            onClick={() => controller.addPostFxLayer("bloom")}
            className="rounded border border-border-subtle px-2 py-0.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
          >
            + Bloom
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {layers.length === 0 ? (
          <li className="px-2 py-4 text-center text-xs text-text-muted">
            No layers yet. Add a particle layer to get started.
          </li>
        ) : (
          layers.map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              selected={state.selectedLayerId === layer.id}
              onSelect={() => controller.selectLayer(layer.id)}
              onToggleEnabled={() => controller.setLayerEnabled(layer.id, !layer.enabled)}
              onDuplicate={() => controller.duplicateLayer(layer.id)}
            />
          ))
        )}
      </ul>
    </aside>
  );
}

function LayerRow({
  layer,
  selected,
  onSelect,
  onToggleEnabled,
  onDuplicate,
}: {
  layer: Layer;
  selected: boolean;
  onSelect: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
}) {
  return (
    <li className="mb-1">
      <div
        className={[
          "flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm",
          selected
            ? "border-accent bg-accent/10 text-text-primary"
            : "border-transparent bg-background-0 text-text-secondary hover:border-border-subtle",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onToggleEnabled}
          className="shrink-0 text-xs"
          title={layer.enabled ? "Disable layer" : "Enable layer"}
          aria-label={layer.enabled ? "Disable layer" : "Enable layer"}
        >
          {layer.enabled ? "●" : "○"}
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left">
          <span className="mr-1 text-[10px] uppercase text-text-muted">{layer.kind}</span>
          {layer.name}
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="shrink-0 text-xs text-text-muted hover:text-text-primary"
          title="Duplicate layer"
          aria-label="Duplicate layer"
        >
          ⧉
        </button>
      </div>
    </li>
  );
}
