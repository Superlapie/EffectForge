# EffectForge Status

Last updated: Phase 10 complete

## What currently works

- **Monorepo bootstrap** — pnpm workspaces, Turborepo, TypeScript strict config, ESLint, Prettier
- **CI pipeline** — Format check, lint, typecheck, unit tests, build, license audit, export validation
- **@effectforge/schema** — Full Zod 4 project schema with layer discriminated unions, curves, gradients, value sources, assets
- **@effectforge/core** — Project creation, validation, migration framework, diagnostics, deterministic PRNG (Mulberry32)
- **@effectforge/renderer** — Renderer interface contract
- **@effectforge/renderer-three** — Three.js WebGL2 renderer with lifecycle, fixed-timestep clock, capture, stats, instanced particle billboards
- **@effectforge/particles** — SoA particle store, emitters, behaviors, bursts, curves/gradients, pointer attract/repel, click bursts
- **@effectforge/pointer** — Normalized pointer service with client-to-world coordinate mapping
- **@effectforge/presets** — Built-in presets plus `.effectforge-preset` bundle export/import
- **@effectforge/runtime** — `mountEffect()` for exported projects (pointer, resize, render loop)
- **@effectforge/exporter-core** — Vanilla, React+Vite, and Next.js code exporters
- **@effectforge/commands** — Command engine with Zod validation, executor, Immer patch history, undo/redo, transactions
- **@effectforge/editor** — EditorController, playback state, keyboard shortcuts, layer/project mutations
- **@effectforge/project-format** — `.effectforge` ZIP pack/unpack with validation and safety limits
- **@effectforge/web** — Next.js 16 landing page and web editor at `/editor`
- **@effectforge/cli** — validate, pack/unpack, preset, and export commands
- **License audit tooling** — Automated dependency license check

## What is partially implemented

- **CLI** — Core commands only; full commands in Phase 19
- **Desktop / MCP apps** — Package stubs only
- **Inspector** — Particle layers only
- **Export validation** — Full build for vanilla + react-vite; Next.js export generated but not CI-built yet

## What is not implemented

- Post-processing, trails, and all later phases

## What is being worked on next

**Phase 11+** — See ROADMAP.md

## Known regressions

None at this stage.
