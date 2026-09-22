# EffectForge Roadmap

Features are marked complete only when implementation works, tests exist, and integration is verified.

## Phase 0: Repository Bootstrap

- [x] pnpm workspace and Turborepo
- [x] TypeScript strict configuration
- [x] ESLint and Prettier
- [x] Apps directories (web, desktop, cli, mcp)
- [x] Core packages dependency graph
- [x] GitHub Actions baseline
- [x] License audit tooling
- [x] Documentation skeleton
- [x] STATUS.md and ROADMAP.md
- [x] Everything builds

## Phase 1: Schema and Core Project Model

- [x] EffectForge project schema (Zod 4)
- [x] Layer discriminated unions
- [x] Project creation
- [x] Project validation
- [x] Deterministic IDs and seed
- [x] Format version field
- [x] Migration framework
- [x] Diagnostic system
- [x] Unit tests

## Phase 2: Command Engine

- [x] Command definitions (discriminated unions)
- [x] Command validation
- [x] Executor
- [x] History with undo/redo (Immer patches)
- [x] Transaction grouping
- [x] Tests

## Phase 3: Renderer Foundation

- [ ] ThreeWebGL renderer
- [ ] Lifecycle, resize, clock
- [ ] Deterministic stepping
- [ ] Capture frame, stats, cleanup
- [ ] Tests

## Phase 4: Custom Particle Engine Core

- [ ] Typed-array particle store
- [ ] Pool/free list
- [ ] Point, box, circle emitters
- [ ] Gravity, drag
- [ ] GPU instanced billboards
- [ ] Benchmark

## Phase 5: Particle Authoring Model

- [ ] Emission rate, bursts, curves, gradients
- [ ] Size/color/opacity over lifetime
- [ ] Tests

## Phase 6: Pointer Interaction

- [ ] Normalized pointer service
- [ ] Attract/repel, click bursts
- [ ] First production presets

## Phase 7: Editor Foundation

- [ ] Shared editor package
- [ ] Layer panel, viewport, inspector, timeline
- [ ] Undo/redo, keyboard shortcuts
- [ ] Usable web application

## Phase 8–29

See master specification for remaining phases. Each will be checked off as completed.
