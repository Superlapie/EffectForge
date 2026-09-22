# EffectForge Status

Last updated: Phase 7 complete

## What currently works

- **Monorepo bootstrap** — pnpm workspaces, Turborepo, TypeScript strict config, ESLint, Prettier
- **CI pipeline** — Format check, lint, typecheck, unit tests, build, license audit
- **@effectforge/schema** — Full Zod 4 project schema with layer discriminated unions, curves, gradients, value sources, assets
- **@effectforge/core** — Project creation, validation, migration framework, diagnostics, deterministic PRNG (Mulberry32)
- **@effectforge/renderer** — Renderer interface contract
- **@effectforge/renderer-three** — Three.js WebGL2 renderer with lifecycle, fixed-timestep clock, capture, stats, instanced particle billboards
- **@effectforge/particles** — SoA particle store, emitters, behaviors, bursts, curves/gradients, pointer attract/repel, click bursts
- **@effectforge/pointer** — Normalized pointer service with client-to-world coordinate mapping
- **@effectforge/presets** — Production presets (cursor attract, repel, click burst)
- **@effectforge/commands** — Command engine with Zod validation, executor, Immer patch history, undo/redo, transactions
- **@effectforge/editor** — EditorController, playback state, keyboard shortcuts, layer/project mutations
- **@effectforge/web** — Next.js 16 landing page and full web editor at `/editor`
- **@effectforge/cli** — `inspect`, `create`, `validate` commands
- **License audit tooling** — Automated dependency license check

## What is partially implemented

- **CLI** — Only basic validate/create/inspect; full commands in Phase 19
- **Desktop / MCP apps** — Package stubs only
- **Inspector** — Particle layers only; other layer kinds and advanced curves in later phases

## What is not implemented

- Project persistence / `.effectforge` archives (Phase 8)
- Preset export, post-processing, trails, and all later phases

## What is being worked on next

**Phase 8: Project Persistence** — Save/load `.effectforge` archives

## Known regressions

None at this stage.
