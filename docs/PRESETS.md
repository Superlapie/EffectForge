# Effect Presets

Production-ready starter projects ship in `@effectforge/presets`.

## Available presets

| ID | Name | Interaction |
|----|------|-------------|
| `cursor-attract-sparkles` | Cursor Attract Sparkles | Pointer attract |
| `cursor-repel-mist` | Cursor Repel Mist | Pointer repel |
| `click-burst-stars` | Click Burst Stars | Click bursts + ambient field |

## Usage

```typescript
import { createProjectFromPreset, listPresets } from "@effectforge/presets";

const project = createProjectFromPreset("cursor-attract-sparkles");
const all = listPresets();
```

Presets return validated `EffectForgeProject` documents compatible with `@effectforge/renderer-three`.
