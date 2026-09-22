import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background-0">
      <header className="border-b border-border-subtle px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-text-primary">
          EffectForge
        </Link>
      </header>

      <main className="mx-auto max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-semibold text-text-primary">Documentation</h1>
        <p className="mt-4 text-text-secondary">
          Documentation is being built alongside the codebase. See the repository{" "}
          <code className="rounded bg-background-2 px-1.5 py-0.5 font-mono text-sm">
            docs/
          </code>{" "}
          directory for architecture and format specifications.
        </p>

        <ul className="mt-8 space-y-3 text-sm">
          {[
            { href: "https://github.com", label: "ARCHITECTURE.md — package structure and dependency flow" },
            { href: "https://github.com", label: "PROJECT_FORMAT.md — .effectforge archive specification" },
            { href: "https://github.com", label: "PARTICLE_ENGINE.md — particle system design (planned)" },
          ].map((doc) => (
            <li key={doc.label} className="text-text-secondary">
              {doc.label}
            </li>
          ))}
        </ul>

        <Link href="/" className="mt-8 inline-flex text-sm text-accent hover:text-accent-hover">
          Back to home
        </Link>
      </main>
    </div>
  );
}
