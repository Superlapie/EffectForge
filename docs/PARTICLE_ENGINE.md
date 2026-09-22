# Particle Engine (Planned)

The EffectForge particle engine is implemented independently — not based on three.quarks or any third-party VFX editor.

## Design principles

- **Structure-of-arrays** — Typed arrays for positions, velocities, ages, colors, etc.
- **Object pooling** — Free lists; no per-frame particle object allocation
- **Deterministic PRNG** — All randomness from project seed streams
- **GPU instancing** — Instanced billboard rendering with batched draw calls
- **Schema-driven behaviors** — Composable behavior pipeline defined in Zod schemas

## Implementation phases

- **Phase 4** — Core store, emitters (point/box/circle), gravity/drag, instanced billboards
- **Phase 5** — Authoring model: curves, gradients, emission modes, lifetime curves
- **Phase 6** — Pointer interaction and first presets

This document will be updated as implementation progresses.
