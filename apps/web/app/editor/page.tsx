"use client";

import Link from "next/link";
import { EditorWorkspace } from "../../components/editor/editor-workspace";

export default function EditorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background-0">
      <div className="flex items-center gap-4 border-b border-border-subtle px-4 py-2">
        <Link href="/" className="text-sm font-semibold text-text-primary hover:text-accent">
          EffectForge
        </Link>
        <span className="text-xs text-text-muted">Editor</span>
        <span className="hidden text-xs text-text-muted sm:inline">
          Ctrl+S save · Open/Save toolbar · Space play/pause · Ctrl+Z undo
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <EditorWorkspace />
      </div>
    </div>
  );
}
