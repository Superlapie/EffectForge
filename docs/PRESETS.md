# Effect Presets

Production-ready starter projects ship in `@effectforge/presets`. Custom presets can be exported and shared as `.effectforge-preset` bundles.

## Built-in presets

| ID | Name | Interaction |
|----|------|-------------|
| `cursor-attract-sparkles` | Cursor Attract Sparkles | Pointer attract |
| `cursor-repel-mist` | Cursor Repel Mist | Pointer repel |
| `click-burst-stars` | Click Burst Stars | Click bursts + ambient field |

## Usage

```typescript
import { createProjectFromPreset, listPresets, listAllPresets } from "@effectforge/presets";

const project = createProjectFromPreset("cursor-attract-sparkles");
const builtIn = listPresets();
const withImported = listAllPresets(); // includes session-imported bundles
```

## Preset bundles (`.effectforge-preset`)

Preset bundles are ZIP archives for sharing reusable effects:

```text
my-preset.effectforge-preset
├── preset.json      # id, name, description, tags
└── project.json     # full EffectForge project
```

### CLI

```bash
effectforge preset list
effectforge preset pack project.json sparkles.effectforge-preset
effectforge preset unpack sparkles.effectforge-preset ./output
```

### Library

```typescript
import { packPresetBundle, unpackPresetBundle, importPresetBundle } from "@effectforge/presets";

const { bytes, manifest } = packPresetBundle(project, {
  description: "Shareable sparkles",
  tags: ["pointer"],
});

const imported = importPresetBundle(bytes); // registers for listAllPresets()
```

### Web editor

Use **Export preset** to download the current project as a bundle, or **Import preset** to load a bundle into the editor and add it to the preset picker for the session.
