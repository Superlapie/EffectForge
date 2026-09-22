# Distortion Layers

EffectForge distortion layers apply fullscreen displacement passes that warp the rendered scene.

## Package layout

| Package | Responsibility |
|---------|----------------|
| `@effectforge/distortion` | Resolve enabled distortion layers from projects |
| `@effectforge/renderer-three` | `DistortionPipeline` render-target pass chain |

## Supported effects

| Effect | Parameters |
|--------|------------|
| `ripple` | `amplitude`, `frequency`, `speed` |
| `heat-haze` | `intensity`, `speed` |
| `liquid` | `viscosity`, `rippleStrength` |
| `lens` | `strength`, `radius` |
| `chromatic-warp` | `offset`, `angle` |
| `glitch-displacement` | `intensity`, `blockSize` |
| `pixel-displacement` | `blockSize`, `intensity` |

Layers are applied in project layer order before post-processing. Each layer's `opacity` blends the warped result with the input.

## Render pipeline order

```text
Scene → Distortion passes → Post-processing passes → Screen
```

## Editor

Use **+ Ripple** in the layer panel to add a distortion layer. The inspector exposes effect-specific sliders for ripple, heat haze, and lens.

## Preset

`sparkles-ripple` — cursor-attract sparkles with a subtle animated ripple distortion.
