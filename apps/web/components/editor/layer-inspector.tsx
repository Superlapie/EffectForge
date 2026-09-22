"use client";

import { getSelectedLayer, type EditorController } from "@effectforge/editor";
import type {
  NumericValueSource,
  ParticleLayer,
  PostFxLayer,
  TrailLayer,
} from "@effectforge/schema";
import { useEditorState } from "./use-editor-controller";

interface LayerInspectorProps {
  controller: EditorController;
}

export function LayerInspector({ controller }: LayerInspectorProps) {
  const state = useEditorState(controller);
  const layer = getSelectedLayer(state);

  if (!layer) {
    return (
      <aside className="w-full border-t border-border-subtle p-4 lg:w-72 lg:border-l lg:border-t-0">
        <p className="text-sm text-text-muted">Select a layer to inspect its properties.</p>
      </aside>
    );
  }

  if (layer.kind === "postfx") {
    return (
      <aside className="flex w-full flex-col border-t border-border-subtle lg:w-72 lg:border-l lg:border-t-0">
        <div className="border-b border-border-subtle px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Inspector</h2>
        </div>
        <PostFxInspector controller={controller} layer={layer} />
      </aside>
    );
  }

  if (layer.kind === "trail") {
    return (
      <aside className="flex w-full flex-col border-t border-border-subtle lg:w-72 lg:border-l lg:border-t-0">
        <div className="border-b border-border-subtle px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Inspector</h2>
        </div>
        <TrailInspector controller={controller} layer={layer} />
      </aside>
    );
  }

  if (layer.kind !== "particles") {
    return (
      <aside className="w-full border-t border-border-subtle p-4 lg:w-72 lg:border-l lg:border-t-0">
        <h2 className="mb-2 text-sm font-medium text-text-primary">{layer.name}</h2>
        <p className="text-xs text-text-muted">
          Inspector for {layer.kind} layers is not available yet.
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex w-full flex-col border-t border-border-subtle lg:w-72 lg:border-l lg:border-t-0">
      <div className="border-b border-border-subtle px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Inspector</h2>
      </div>
      <ParticleInspector controller={controller} layer={layer} />
    </aside>
  );
}

function PostFxInspector({
  controller,
  layer,
}: {
  controller: EditorController;
  layer: PostFxLayer;
}) {
  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <Field label="Name">
        <input
          type="text"
          value={layer.name}
          onChange={(event) => controller.setLayerName(layer.id, event.target.value)}
          className="w-full rounded-md border border-border-subtle bg-background-0 px-2 py-1 text-sm"
        />
      </Field>

      <SliderField
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => controller.setLayerOpacity(layer.id, value)}
      />

      {layer.effect.type === "bloom" ? (
        <>
          <SliderField
            label="Intensity"
            value={layer.effect.intensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(value) => controller.setPostFxEffectProperty(layer.id, "intensity", value)}
          />
          <SliderField
            label="Threshold"
            value={layer.effect.threshold}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => controller.setPostFxEffectProperty(layer.id, "threshold", value)}
          />
        </>
      ) : null}

      {layer.effect.type === "vignette" ? (
        <>
          <SliderField
            label="Darkness"
            value={layer.effect.darkness}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => controller.setPostFxEffectProperty(layer.id, "darkness", value)}
          />
          <SliderField
            label="Offset"
            value={layer.effect.offset}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => controller.setPostFxEffectProperty(layer.id, "offset", value)}
          />
        </>
      ) : null}

      {layer.effect.type === "chromatic-aberration" ? (
        <SliderField
          label="Offset"
          value={layer.effect.offset}
          min={0}
          max={0.02}
          step={0.0005}
          onChange={(value) => controller.setPostFxEffectProperty(layer.id, "offset", value)}
        />
      ) : null}

      <p className="text-xs text-text-muted">Effect: {layer.effect.type}</p>
    </div>
  );
}

function TrailInspector({
  controller,
  layer,
}: {
  controller: EditorController;
  layer: TrailLayer;
}) {
  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <Field label="Name">
        <input
          type="text"
          value={layer.name}
          onChange={(event) => controller.setLayerName(layer.id, event.target.value)}
          className="w-full rounded-md border border-border-subtle bg-background-0 px-2 py-1 text-sm"
        />
      </Field>

      <SliderField
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => controller.setLayerOpacity(layer.id, value)}
      />

      <SliderField
        label="Width"
        value={layer.width}
        min={1}
        max={24}
        step={0.5}
        onChange={(value) => controller.setTrailWidth(layer.id, value)}
      />

      <SliderField
        label="Fade"
        value={layer.fade}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => controller.setTrailFade(layer.id, value)}
      />

      <SliderField
        label="Min distance"
        value={layer.minDistance}
        min={0.005}
        max={0.2}
        step={0.005}
        onChange={(value) => controller.setTrailMinDistance(layer.id, value)}
      />

      <p className="text-xs text-text-muted">
        Blend: {layer.blendMode} · Max points: {layer.maxPoints.toLocaleString()}
        {layer.followPointer ? " · Follows pointer" : ""}
      </p>
    </div>
  );
}

function ParticleInspector({
  controller,
  layer,
}: {
  controller: EditorController;
  layer: ParticleLayer;
}) {
  const cursorBehavior = layer.behaviors.find(
    (behavior) => behavior.type === "cursor-attract" || behavior.type === "cursor-repel",
  );
  const cursorIndex = cursorBehavior
    ? layer.behaviors.findIndex((behavior) => behavior === cursorBehavior)
    : -1;

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <Field label="Name">
        <input
          type="text"
          value={layer.name}
          onChange={(event) => controller.setLayerName(layer.id, event.target.value)}
          className="w-full rounded-md border border-border-subtle bg-background-0 px-2 py-1 text-sm"
        />
      </Field>

      <SliderField
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => controller.setLayerOpacity(layer.id, value)}
      />

      <SliderField
        label="Emission rate"
        value={layer.emitter.rate}
        min={0}
        max={500}
        step={1}
        onChange={(value) => controller.setEmitterRate(layer.id, value)}
      />

      <NumericSourceField
        label="Lifetime"
        source={layer.lifetime}
        min={0.1}
        max={10}
        step={0.1}
        onChange={(value) => controller.setParticleNumericConstant(layer.id, "lifetime", value)}
      />

      <NumericSourceField
        label="Speed"
        source={layer.speed}
        min={0}
        max={5}
        step={0.05}
        onChange={(value) => controller.setParticleNumericConstant(layer.id, "speed", value)}
      />

      <NumericSourceField
        label="Size"
        source={layer.size}
        min={0.001}
        max={0.2}
        step={0.001}
        onChange={(value) => controller.setParticleNumericConstant(layer.id, "size", value)}
      />

      {cursorBehavior && cursorIndex >= 0 ? (
        <>
          <SliderField
            label="Pointer strength"
            value={cursorBehavior.strength}
            min={0}
            max={20}
            step={0.1}
            onChange={(value) =>
              controller.setBehaviorProperty(layer.id, cursorIndex, "strength", value)
            }
          />
          <SliderField
            label="Pointer radius"
            value={cursorBehavior.radius}
            min={0.1}
            max={5}
            step={0.05}
            onChange={(value) =>
              controller.setBehaviorProperty(layer.id, cursorIndex, "radius", value)
            }
          />
        </>
      ) : null}

      <p className="text-xs text-text-muted">
        Blend: {layer.blendMode} · Max particles: {layer.emitter.maxParticles.toLocaleString()}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-accent"
        />
        <span className="w-12 text-right text-xs tabular-nums text-text-secondary">
          {formatNumber(value)}
        </span>
      </div>
    </Field>
  );
}

function NumericSourceField({
  label,
  source,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  source: NumericValueSource;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const value = readNumericPreview(source);
  const isConstant = source.kind === "constant";

  return (
    <Field label={isConstant ? label : `${label} (preview)`}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-accent"
        />
        <span className="w-12 text-right text-xs tabular-nums text-text-secondary">
          {formatNumber(value)}
        </span>
      </div>
      {!isConstant ? (
        <p className="text-[10px] text-text-muted">Edits convert this value to a constant.</p>
      ) : null}
    </Field>
  );
}

function readNumericPreview(source: NumericValueSource): number {
  if (source.kind === "constant") {
    return source.value;
  }
  if (source.kind === "random-range") {
    return (source.min + source.max) / 2;
  }
  return 1;
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 10) {
    return value.toFixed(0);
  }
  if (Math.abs(value) >= 1) {
    return value.toFixed(2);
  }
  return value.toFixed(3);
}
