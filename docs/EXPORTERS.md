# Exporters

EffectForge exports production-ready starter projects with no editor dependencies.

## Packages

| Package | Role |
|---------|------|
| `@effectforge/runtime` | Framework-independent `mountEffect()` API |
| `@effectforge/exporter-core` | `EffectForgeExporter` implementations |

## Export targets

| Target | Stack |
|--------|-------|
| `vanilla` | TypeScript + Vite |
| `react-vite` | React 19 + Vite |
| `nextjs` | Next.js 16 App Router |

Each export embeds `effect-project.json` and depends on `@effectforge/runtime`.

## CLI

```bash
effectforge export project.json --target vanilla -o ./my-effect
effectforge export project.json --target react-vite -o ./my-effect
effectforge export project.json --target nextjs -o ./my-effect
```

## Library

```typescript
import { exportProject, exportResultToZip } from "@effectforge/exporter-core";

const result = exportProject(project, "react-vite");
const zipBytes = exportResultToZip(result);
```

## Runtime

```typescript
import { mountEffect } from "@effectforge/runtime";
import project from "./effect-project.json";

const canvas = document.getElementById("effect") as HTMLCanvasElement;
const handle = await mountEffect({ canvas, project });

// later
handle.dispose();
```

## Web editor

Use **Export code…** in the toolbar to download a ZIP for any target.

## CI validation

`pnpm validate:exports` generates vanilla and react-vite exports in an isolated workspace, installs dependencies, and runs production builds.

Generated projects include `THIRD_PARTY_NOTICES.md` for runtime dependencies (Three.js, etc.).
