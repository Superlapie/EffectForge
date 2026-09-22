"use client";

import { createProjectFromPreset, listPresets, type PresetId } from "@effectforge/presets";
import { createThreeWebGLRenderer } from "@effectforge/renderer-three";
import { useEffect, useRef, useState } from "react";

interface EffectViewportProps {
  presetId: PresetId;
  className?: string;
}

export function EffectViewport({ presetId, className }: EffectViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    let disposed = false;
    let frameId = 0;
    const renderer = createThreeWebGLRenderer();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.resize(width, height, dpr);
    };

    const boot = async () => {
      try {
        await renderer.initialize({ canvas });
        const project = createProjectFromPreset(presetId);
        await renderer.loadProject(project);
        resize();
        renderer.play();

        const renderFrame = () => {
          if (disposed) {
            return;
          }
          renderer.render();
          frameId = window.requestAnimationFrame(renderFrame);
        };
        renderFrame();

        const observer = new ResizeObserver(() => resize());
        observer.observe(container);

        const getRect = () => container.getBoundingClientRect();

        const onPointerMove = (event: PointerEvent) => {
          renderer.handlePointerMove(event.clientX, event.clientY, getRect());
        };
        const onPointerDown = (event: PointerEvent) => {
          renderer.handlePointerDown(event.clientX, event.clientY, getRect());
        };
        const onPointerLeave = () => {
          renderer.handlePointerLeave();
        };

        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerdown", onPointerDown);
        container.addEventListener("pointerleave", onPointerLeave);

        return () => {
          observer.disconnect();
          container.removeEventListener("pointermove", onPointerMove);
          container.removeEventListener("pointerdown", onPointerDown);
          container.removeEventListener("pointerleave", onPointerLeave);
        };
      } catch (bootError) {
        setError(bootError instanceof Error ? bootError.message : "Failed to initialize renderer");
        return undefined;
      }
    };

    let cleanupListeners: (() => void) | undefined;
    void boot().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      cleanupListeners?.();
      renderer.dispose();
    };
  }, [presetId]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">{error}</div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
    </div>
  );
}

export function PresetPicker({
  value,
  onChange,
}: {
  value: PresetId;
  onChange: (presetId: PresetId) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as PresetId)}
      className="rounded-md border border-border-subtle bg-background-1 px-3 py-2 text-sm text-text-primary"
    >
      {listPresets().map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.name}
        </option>
      ))}
    </select>
  );
}
