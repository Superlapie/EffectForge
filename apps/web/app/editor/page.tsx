import Link from "next/link";
import { CURRENT_FORMAT_VERSION } from "@effectforge/schema";

export default function EditorPage() {
  return (
    <div className="flex min-h-full flex-col bg-background-0">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-text-primary">
            EffectForge
          </Link>
          <span className="text-sm text-text-muted">Untitled Effect</span>
        </div>
        <span className="text-xs text-text-muted">Format v{CURRENT_FORMAT_VERSION}</span>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium text-text-primary">Editor coming in Phase 7</h1>
          <p className="mt-3 text-sm text-text-secondary">
            The shared editor package with viewport, layers, and inspector will be
            implemented after the renderer and particle engine foundations are complete.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Schema and core project model are ready. Check STATUS.md for current progress.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex text-sm text-accent hover:text-accent-hover"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
