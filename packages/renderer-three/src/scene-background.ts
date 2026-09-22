import type { CanvasBackground } from "@effectforge/schema";
import { Color, type Scene } from "three";

function parseHexColor(hex: string): Color {
  return new Color(hex);
}

/** Apply project canvas background settings to a Three.js scene. */
export function applyCanvasBackground(scene: Scene, background: CanvasBackground): void {
  switch (background.type) {
    case "color":
      scene.background = parseHexColor(background.value);
      break;
    case "transparent":
      scene.background = null;
      break;
    case "gradient":
      // Phase 3: approximate gradient with first stop; full gradient shader in later phases.
      scene.background = parseHexColor(background.stops[0]?.color ?? "#000000");
      break;
    default:
      scene.background = new Color(0x050508);
  }
}
