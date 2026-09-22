# EffectForge Architecture

EffectForge is a TypeScript monorepo for visual effects authoring and compilation.

## Package dependency flow

```text
schema
  |
  v
core
  |
  +------ commands (Phase 2)
  |
  +------ renderer abstractions (Phase 3)
  |
  +------ project-format

renderer-three (Phase 3+)
  |
  +------ particles (Phase 4+)
  +------ trails, distortion, text-effects, postfx (later phases)

editor (Phase 7)
  |
  +------ core, commands, renderer, ui

apps/web ------ editor
apps/desktop -- editor
cli, mcp ------ core / commands / exporters
```

## Current implementation status

### Implemented (Phase 0–1)

- **@effectforge/schema** — Zod 4 schemas for projects, layers, curves, gradients, value sources, assets
- **@effectforge/core** — Project creation, validation, migration framework, diagnostics, deterministic PRNG
- **@effectforge/renderer** — Renderer interface contract
- **@effectforge/renderer-three** — Three.js WebGL2 renderer (lifecycle, clock, capture, stats, instanced particles)
- **@effectforge/particles** — Custom particle engine (SoA store, emitters, behaviors, pointer interaction)
- **@effectforge/pointer** — Normalized pointer input service
- **@effectforge/presets** — Production effect presets
- **@effectforge/commands** — Command validation, execution, undo/redo, transactions
- **@effectforge/editor** — EditorController, selection, playback, keyboard shortcuts
- **@effectforge/project-format** — `.effectforge` ZIP archives with pack/unpack and safety limits
- **@effectforge/runtime** — `mountEffect()` for exported standalone projects
- **@effectforge/exporter-core** — Vanilla, React+Vite, and Next.js code exporters
- **@effectforge/web** — Next.js 16 landing page and web editor at `/editor`
- **@effectforge/cli** — validate, pack/unpack, preset, and export commands

### Planned

See `ROADMAP.md` for the full phased delivery plan.

## Command system

All persistent project mutations go through validated commands with undo/redo and transaction grouping. `CommandSession` wraps execution and history. Editor UI, CLI, and MCP will share the same command executor.

```text
UI / CLI / MCP → validateCommand → executeCommand → CommandSession (history)
```

Transaction pattern for slider drags:

```text
BeginTransaction → many SetLayerOpacity → CommitTransaction
```

Undo restores the pre-transaction state in one step.

## Renderer design (Phase 3+)

EffectForge owns the render loop. React handles editor UI only. The primary backend is Three.js WebGL2, wrapped behind `EffectForgeRenderer`. A future WebGPU backend will be a separate implementation.

## Project model

Projects are plain serializable JSON documents validated by Zod. No Three.js types are persisted. See `docs/PROJECT_FORMAT.md`.

## Determinism

Every project has a `seed`. Effect simulation uses deterministic PRNG streams (`createRandomStream`, `deriveStream`). Never use `Math.random()` in simulation code.
