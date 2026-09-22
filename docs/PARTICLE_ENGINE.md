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
| `@effectforge/particles` | SoA store, emitters, behaviors, `ParticleSystem` simulation |
| `@effectforge/renderer-three` | `ParticleInstancedMesh`, `ParticleScene` GPU sync |

## Phase 4 (implemented)

- `ParticleStore` — pooled SoA buffers with free list
- Emitters — `point`, `box`, `circle`
- Behaviors — `gravity`, `drag`, `constant-acceleration`
- Value sources — constant and random-range numerics; constant colors
- `ParticleInstancedMesh` — GPU instanced billboards in Three.js
- Benchmark — `pnpm bench:particles`

## Upcoming

- **Phase 5** — Curves, gradients, bursts, lifetime curves
- **Phase 6** — Pointer interaction and first presets
