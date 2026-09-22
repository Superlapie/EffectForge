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

- [x] ThreeWebGL renderer
- [x] Lifecycle, resize, clock
- [x] Deterministic stepping
- [x] Capture frame, stats, cleanup
- [x] Tests

## Phase 4: Custom Particle Engine Core

- [x] Typed-array particle store
- [x] Pool/free list
- [x] Point, box, circle emitters
- [x] Gravity, drag
- [x] GPU instanced billboards
- [x] Benchmark

## Phase 5: Particle Authoring Model

- [x] Emission rate, bursts, curves, gradients
- [x] Size/color/opacity over lifetime
- [x] Tests

## Phase 6: Pointer Interaction

- [x] Normalized pointer service
- [x] Attract/repel, click bursts
- [x] First production presets

## Phase 7: Editor Foundation

- [x] Shared editor package
- [x] Layer panel, viewport, inspector, timeline
- [x] Undo/redo, keyboard shortcuts
- [x] Usable web application

## Phase 8–29

See master specification for remaining phases. Each will be checked off as completed.
