# Particle Engine

The EffectForge particle engine is implemented independently — not based on three.quarks or any third-party VFX editor.

## Design principles

- **Structure-of-arrays** — Typed arrays for positions, velocities, ages, colors, etc.
- **Object pooling** — Free lists; no per-frame particle object allocation
- **Deterministic PRNG** — All randomness from project seed streams (`deriveStream`)
- **GPU instancing** — Instanced billboard rendering with batched draw calls
- **Schema-driven behaviors** — Composable behavior pipeline defined in Zod schemas

## Package layout

| Package | Responsibility |
|---------|----------------|
| `@effectforge/particles` | SoA store, emitters, behaviors, bursts, curves, gradients, `ParticleSystem` |
| `@effectforge/renderer-three` | `ParticleInstancedMesh`, `ParticleScene` GPU sync |

## Phase 4 (implemented)

- `ParticleStore` — pooled SoA buffers with free list
- Emitters — `point`, `box`, `circle`
- Behaviors — `gravity`, `drag`, `constant-acceleration`
- `ParticleInstancedMesh` — GPU instanced billboards in Three.js

## Phase 5 (implemented)

- **Bursts** — Timed burst emission with cycles, interval, and probability
- **Value sources** — `curve`, `random-curve-range`, `gradient`, `random-gradient-range`
- **Lifetime curves** — `sizeOverLifetime`, `opacityOverLifetime` via `evaluateParameterCurve`
- **Prewarm** — Optional emitter pre-simulation on first step
- Benchmark — `pnpm bench:particles`

## Phase 6 (implemented)

- `@effectforge/pointer` — `PointerService` with normalized and world-space coordinates
- `cursor-attract` / `cursor-repel` behaviors driven by pointer state
- Click bursts on pointer-interactive layers
- `@effectforge/presets` — three production presets with web preview at `/editor`

## Upcoming

- **Phase 7** — Full editor UI
