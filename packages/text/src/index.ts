export {
  hasTextLayers,
  resolveTextLayers,
  type ResolvedTextLayer,
} from "./resolve.js";

export {
  estimateGlyphWidth,
  layoutText,
  textSizeToWorld,
  type TextLayoutBounds,
  type TextLayoutGlyph,
} from "./layout.js";

export {
  computeTextGlyphStates,
  type TextGlyphState,
} from "./effects.js";

export { TextSystem, type TextSystemOptions } from "./system.js";
