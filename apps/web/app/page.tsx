import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background-0">
      <header className="border-b border-border-subtle px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            EffectForge
          </span>
          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/docs" className="transition-colors hover:text-text-primary">
              Docs
            </Link>
            <Link href="/editor" className="transition-colors hover:text-text-primary">
              Editor
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Create interactive web effects visually.
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            EffectForge is a visual authoring and compilation environment for
            production-ready interactive visual effects. Design particles, trails,
            distortions, and more — then export clean, deployable code.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/editor"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Open Editor
            </Link>
            <span className="text-sm text-text-muted">No account required</span>
          </div>
        </div>

        <div className="mx-auto mt-24 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              title: "Visual authoring",
              description:
                "Layer-based editor with live viewport preview for particles, trails, post-processing, and more.",
            },
            {
              title: "Production export",
              description:
                "Export to React, Next.js, or vanilla JavaScript with a small, tree-shakeable runtime.",
            },
            {
              title: "Machine-operable",
              description:
                "CLI and MCP interfaces for automation — AI-operable, not AI-dependent.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border-subtle bg-background-1 p-5"
            >
              <h3 className="font-medium text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border-subtle px-6 py-6 text-center text-sm text-text-muted">
        EffectForge — open development visual effects authoring
      </footer>
    </div>
  );
}
