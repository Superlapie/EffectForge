# Trail Engine

EffectForge trail layers render smooth pointer-following ribbons with gradient color and width falloff.

## Package layout

| Package | Responsibility |
|---------|----------------|
| `@effectforge/trails` | `TrailStore` ring buffer, `TrailSystem` pointer sampling |
| `@effectforge/renderer-three` | `TrailScene`, `TrailMesh` ribbon geometry |

## Trail layer schema

Trail layers (`kind: "trail"`) support:

- `maxPoints` — ring buffer capacity
- `width` / `widthOverLifetime` — ribbon thickness
- `colorGradient` — color and alpha along the trail
- `fade` — tail opacity falloff
- `followPointer` — record pointer movement
- `minDistance` — minimum spacing between recorded points

## Simulation

`TrailSystem` appends pointer world positions when `followPointer` is enabled and the pointer moves past `minDistance`. Points are stored oldest-to-newest in a fixed-size ring buffer.

## Rendering

`TrailMesh` builds a triangle-strip ribbon with per-vertex color from the layer gradient and width from `widthOverLifetime`.

## Editor

Use **+ Trail** in the layer panel to add a trail layer. The inspector exposes width, fade, and min distance controls.

## Preset

`cursor-trail-glow` — additive cyan ribbon that follows the pointer.
