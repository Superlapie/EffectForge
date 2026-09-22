# Text Layers

EffectForge text layers render animated typography in the scene using canvas textures.

## Package layout

| Package | Responsibility |
|---------|----------------|
| `@effectforge/text` | Layout, effect animation, and glyph state computation |
| `@effectforge/renderer-three` | `TextScene` and canvas-textured `TextMesh` rendering |

## Supported effect modes

| Mode | Behavior |
|------|----------|
| `fade` | Whole text fades in |
| `stagger` | Characters reveal one after another |
| `scramble` | Random characters resolve into the final text |
| `glitch-reveal` | Horizontal jitter during reveal |
| `neon-flicker` | Glow and opacity flicker |
| `particle-assemble` | Characters fly in from scattered positions |
| `particle-dissolve` | Characters drift and fade out |
| `particle-scatter` | Characters scatter outward |
| `wave` | Vertical wave motion during reveal |
| `electric-outline` | Pulsing electric outline |
| `smoke-reveal` | Upward drift with soft reveal |

Each layer loops its animation using the layer `duration`.

## Editor

Use **+ Text** in the layer panel to add a text layer. The inspector exposes content, font size, duration, and effect mode.

## Preset

`neon-title` — bold "EffectForge" title with neon flicker animation.
