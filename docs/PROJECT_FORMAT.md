# EffectForge Project Format

## Document format

EffectForge projects are JSON documents with:

| Field | Description |
|-------|-------------|
| `format` | Always `"effectforge"` |
| `formatVersion` | Integer schema version (currently `1`) |
| `id` | Unique project identifier |
| `name` | Human-readable project name |
| `seed` | Deterministic random seed |
| `canvas` | Width, height, background, sizing mode |
| `timeline` | Duration, loop, markers |
| `layers` | Ordered effect layers (discriminated union by `kind`) |
| `assets` | Asset registry keyed by ID |
| `exportPreferences` | Export target and accessibility policy |
| `metadata` | Created/updated timestamps, tags |

## Layer kinds

- `particles` — Particle systems with emitters and behaviors
- `trail` — Cursor/particle trails
- `distortion` — Shader-based distortion effects
- `text` — Text-driven visual effects
- `model` — GLTF/GLB model placement
- `postfx` — Post-processing effects
- `group` — Layer grouping
- `event` — Event-triggered actions

## Archive format (Phase 8)

Projects are distributed as `.effectforge` ZIP archives:

```text
my-effect.effectforge
├── project.json
├── metadata.json
├── assets/
│   ├── textures/
│   ├── models/
│   └── fonts/
└── preview/
    └── thumbnail.webp
```

Archive extraction enforces path containment, size limits, and entry count limits.

## Versioning

When `formatVersion` increases, migrations transform older documents forward. Documents with a newer `formatVersion` than the application supports are rejected with a clear error.
