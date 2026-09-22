# Post-Processing

EffectForge postfx layers apply fullscreen shader passes after the main scene render.

## Package layout

| Package | Responsibility |
|---------|----------------|
| `@effectforge/postfx` | Resolve enabled postfx layers from projects |
| `@effectforge/renderer-three` | `PostFxPipeline` render-target pass chain |

## Supported effects

| Effect | Parameters |
|--------|------------|
| `bloom` | `intensity`, `threshold` |
| `vignette` | `darkness`, `offset` |
| `chromatic-aberration` | `offset` |
| `noise` | `intensity` |
| `glitch` | `intensity` |
| `pixelation` | `granularity` |
| `shockwave` | `center`, `speed`, `amplitude` |

Layers are applied in project layer order. Each layer's `opacity` blends the effect result.

## Editor

Use **+ Bloom** in the layer panel to add a post-processing layer. The inspector exposes effect-specific sliders for bloom, vignette, and chromatic aberration.

## Preset

`sparkles-bloom` — cursor-attract sparkles with a bloom pass for a cinematic glow.
