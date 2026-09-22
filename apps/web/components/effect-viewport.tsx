"use client";

import { createProjectFromPreset, listPresets, type PresetId } from "@effectforge/presets";
import type { EffectForgeProject } from "@effectforge/schema";
import { createThreeWebGLRenderer } from "@effectforge/renderer-three";
import { useEffect, useRef, useState } from "react";

interface EffectViewportBaseProps {
  className?: string;
}

interface PresetViewportProps extends EffectViewportBaseProps {
  presetId: PresetId;
  project?: never;
  projectRevision?: never;
  playing?: never;
  currentTime?: never;
  onTimeUpdate?: never;
}

interface ProjectViewportProps extends EffectViewportBaseProps {
  project: EffectForgeProject;
  projectRevision: number;
  loadRevision: number;
  playing: boolean;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  presetId?: never;
}

export type EffectViewportProps = PresetViewportProps | ProjectViewportProps;

export function EffectViewport(props: EffectViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ReturnType<typeof createThreeWebGLRenderer> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isProjectMode = "project" in props && props.project !== undefined;
  const project = isProjectMode ? props.project : undefined;
  const projectRevision = isProjectMode ? props.projectRevision : 0;
  const loadRevision = isProjectMode ? props.loadRevision : 0;
  const presetId = !isProjectMode ? props.presetId : undefined;
  const lastLoadRevisionRef = useRef(loadRevision);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    let disposed = false;
    let frameId = 0;
    let cleanupListeners: (() => void) | undefined;
    const renderer = createThreeWebGLRenderer();
    rendererRef.current = renderer;

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
        const initialProject = isProjectMode
          ? project!
          : createProjectFromPreset(presetId!);
        await renderer.loadProject(initialProject);
        resize();
        renderer.play();
        setReady(true);

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

    void boot().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      disposed = true;
      setReady(false);
      window.cancelAnimationFrame(frameId);
      cleanupListeners?.();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [isProjectMode, presetId]);

  useEffect(() => {
    if (!isProjectMode || !ready) {
      return;
    }
    const renderer = rendererRef.current;
    if (!renderer || !project) {
      return;
    }

    if (loadRevision !== lastLoadRevisionRef.current) {
      lastLoadRevisionRef.current = loadRevision;
      void renderer.loadProject(project);
      return;
    }

    void renderer.updateProject(project);
  }, [isProjectMode, loadRevision, project, projectRevision, ready]);

  useEffect(() => {
    if (!isProjectMode || !ready) {
      return;
    }
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    if (props.playing) {
      renderer.play();
    } else {
      renderer.pause();
    }
  }, [isProjectMode, props.playing, ready]);

  useEffect(() => {
    if (!isProjectMode || !ready) {
      return;
    }
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    const delta = Math.abs(renderer.getSimulationTime() - props.currentTime);
    if (!props.playing || delta > 0.05) {
      renderer.seek(props.currentTime);
    }
  }, [isProjectMode, props.currentTime, props.playing, ready]);

  useEffect(() => {
    if (!isProjectMode || !ready || !props.onTimeUpdate || !props.playing) {
      return;
    }
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }

    let frameId = 0;
    const tick = () => {
      props.onTimeUpdate?.(renderer.getSimulationTime());
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isProjectMode, props.onTimeUpdate, props.playing, ready]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-400">{error}</div>
    );
  }

  return (
    <div ref={containerRef} className={props.className}>
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
