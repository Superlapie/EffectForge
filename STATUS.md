# EffectForge Status

Last updated: Phase 6 complete

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
- **@effectforge/web** — Next.js 16 landing page, docs placeholder, editor placeholder route
- **@effectforge/cli** — `inspect`, `create`, `validate` commands
- **License audit tooling** — Automated dependency license check

## What is partially implemented

- **Web editor** — Route exists; full editor UI is Phase 7
- **CLI** — Only basic validate/create/inspect; full commands in Phase 19
- **Desktop / MCP apps** — Package stubs only

## What is not implemented

- Editor UI (Phase 7)
- Project persistence / `.effectforge` archives (Phase 8)
- Presets, exporters, post-processing, trails, and all later phases

## What is being worked on next

**Phase 7: Editor Foundation** — Layer panel, viewport, inspector, timeline, undo/redo

## Known regressions

None at this stage.
