# EffectForge Status

Last updated: Phase 8 complete

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
- **@effectforge/project-format** — `.effectforge` ZIP pack/unpack with validation and safety limits
- **@effectforge/web** — Next.js 16 landing page and web editor at `/editor` with open/save
- **@effectforge/cli** — `inspect`, `create`, `validate`, `pack`, `unpack` commands
- **License audit tooling** — Automated dependency license check

## What is partially implemented

- **CLI** — Basic validate/create/inspect/pack/unpack; full commands in Phase 19
- **Desktop / MCP apps** — Package stubs only
- **Inspector** — Particle layers only; other layer kinds and advanced curves in later phases
- **Asset binaries** — Archive format supports `assets/` entries; editor does not yet manage binary assets

## What is not implemented

- Preset export bundles (Phase 9+)
- Post-processing, trails, and all later phases

## What is being worked on next

**Phase 9+** — See ROADMAP.md for upcoming features

## Known regressions

None at this stage.
