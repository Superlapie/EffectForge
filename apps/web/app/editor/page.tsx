"use client";

import Link from "next/link";
import { useState } from "react";
import { EffectViewport, PresetPicker } from "../../components/effect-viewport";
import type { PresetId } from "@effectforge/presets";
import { getPreset } from "@effectforge/presets";

export default function EditorPage() {
  const [presetId, setPresetId] = useState<PresetId>("cursor-attract-sparkles");
  const preset = getPreset(presetId);

  return (
    <div className="flex min-h-full flex-col bg-background-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-text-primary">
            EffectForge
          </Link>
          <span className="text-sm text-text-muted">Interactive Preview</span>
        </div>
        <PresetPicker value={presetId} onChange={setPresetId} />
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <section className="relative min-h-[320px] flex-1 overflow-hidden rounded-xl border border-border-subtle bg-black lg:min-h-[480px]">
          <EffectViewport
            key={presetId}
            presetId={presetId}
            className="absolute inset-0"
          />
        </section>

        <aside className="w-full max-w-sm space-y-3 rounded-xl border border-border-subtle bg-background-1 p-4">
          <h1 className="text-lg font-medium text-text-primary">{preset.name}</h1>
          <p className="text-sm text-text-secondary">{preset.description}</p>
          <ul className="flex flex-wrap gap-2">
            {preset.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-background-0 px-2 py-1 text-xs text-text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-muted">
            Move your pointer over the viewport. Click to trigger bursts on presets that support
            pointer interaction.
          </p>
          <p className="text-xs text-text-muted">
            Full editor UI (layers, inspector, timeline) arrives in Phase 7.
          </p>
        </aside>
      </main>
    </div>
  );
}
