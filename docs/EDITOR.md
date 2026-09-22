# EffectForge Editor

The web editor at `/editor` provides a minimal authoring surface for particle effects.

## Layout

- **Toolbar** — Project name, open/save `.effectforge`, import/export preset bundles, preset loader, undo/redo, play/pause
- **Layer panel** — Select, enable/disable, duplicate, and add particle layers
- **Viewport** — Live WebGL preview with pointer interaction
- **Inspector** — Edit layer name, opacity, emission rate, and common particle parameters
- **Timeline** — Scrub playback time within the project duration

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Space` | Toggle play/pause |
| `Delete` / `Backspace` | Remove selected layer |
| `Ctrl+S` / `Cmd+S` | Save `.effectforge` archive |

Shortcuts are ignored while typing in form fields.

## Architecture

Editor UI lives in `apps/web`. Shared editor logic is in `@effectforge/editor`:

- `EditorController` — Wraps `CommandSession` with selection and playback state
- `handleEditorShortcut` — Centralized keyboard handling
- `getSelectedLayer` — Helper for inspector bindings

All project mutations go through the command engine so undo/redo stays consistent with CLI and future MCP tooling.

## Development

```bash
pnpm dev
```

Open http://127.0.0.1:43123/editor
