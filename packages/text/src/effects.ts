import { deriveStream } from "@effectforge/core";
import type { TextLayer } from "@effectforge/schema";
import type { TextLayoutGlyph } from "./layout.js";

const SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface TextGlyphState {
  char: string;
  displayChar: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  glow: number;
  outline: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickScrambleChar(seed: number, index: number): string {
  const stream = deriveStream(seed, `scramble-${index}`);
  const charIndex = stream.nextInt(0, SCRAMBLE_CHARSET.length - 1);
  return SCRAMBLE_CHARSET[charIndex] ?? "?";
}

function glyphProgress(progress: number, index: number, total: number, window = 0.15): number {
  if (total <= 0) {
    return progress;
  }
  const start = index / total;
  return clamp((progress - start) / window, 0, 1);
}

function computeFade(glyph: TextLayoutGlyph, progress: number): TextGlyphState {
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: 0,
    opacity: progress,
    glow: 0,
    outline: 0,
  };
}

function computeStagger(
  glyph: TextLayoutGlyph,
  progress: number,
  total: number,
): TextGlyphState {
  const reveal = glyphProgress(progress, glyph.charIndex, total, 0.12);
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: 0,
    opacity: reveal,
    glow: 0,
    outline: 0,
  };
}

function computeScramble(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const settleStart = 0.65;
  const scrambled = progress < settleStart;
  const settle = clamp((progress - settleStart) / (1 - settleStart), 0, 1);
  const displayChar = scrambled ? pickScrambleChar(seed, glyph.charIndex) : glyph.char;
  return {
    char: glyph.char,
    displayChar,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: 0,
    opacity: scrambled ? 0.85 : settle,
    glow: 0,
    outline: 0,
  };
}

function computeGlitchReveal(
  glyph: TextLayoutGlyph,
  progress: number,
  total: number,
  seed: number,
): TextGlyphState {
  const reveal = glyphProgress(progress, glyph.charIndex, total, 0.1);
  const stream = deriveStream(seed, `glitch-${glyph.charIndex}`);
  const jitter = reveal < 1 ? (stream.next() - 0.5) * 24 * (1 - reveal) : 0;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: jitter,
    offsetY: 0,
    opacity: reveal,
    glow: 0,
    outline: 0,
  };
}

function computeNeonFlicker(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const stream = deriveStream(seed, `neon-${glyph.charIndex}`);
  const flicker = 0.65 + stream.next() * 0.35 * Math.sin(progress * Math.PI * 8);
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: 0,
    opacity: progress * flicker,
    glow: progress * 0.9,
    outline: 0,
  };
}

function computeParticleAssemble(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const stream = deriveStream(seed, `assemble-${glyph.charIndex}`);
  const startX = glyph.x + stream.nextRange(-120, 120);
  const startY = glyph.y + stream.nextRange(-80, 80);
  const eased = 1 - Math.pow(1 - progress, 3);
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: startX + (glyph.x - startX) * eased,
    y: startY + (glyph.y - startY) * eased,
    offsetX: 0,
    offsetY: 0,
    opacity: eased,
    glow: 0,
    outline: 0,
  };
}

function computeParticleDissolve(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const stream = deriveStream(seed, `dissolve-${glyph.charIndex}`);
  const driftX = stream.nextRange(-40, 40) * progress;
  const driftY = stream.nextRange(-30, 30) * progress;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: driftX,
    offsetY: driftY,
    opacity: 1 - progress,
    glow: 0,
    outline: 0,
  };
}

function computeParticleScatter(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const stream = deriveStream(seed, `scatter-${glyph.charIndex}`);
  const angle = stream.nextRange(0, Math.PI * 2);
  const distance = stream.nextRange(40, 140) * progress;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: Math.cos(angle) * distance,
    offsetY: Math.sin(angle) * distance,
    opacity: 1 - progress,
    glow: 0,
    outline: 0,
  };
}

function computeWave(
  glyph: TextLayoutGlyph,
  progress: number,
  total: number,
): TextGlyphState {
  const reveal = glyphProgress(progress, glyph.charIndex, total, 0.08);
  const wave = Math.sin(glyph.charIndex * 0.45 + progress * Math.PI * 4) * 12 * reveal;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: wave,
    opacity: reveal,
    glow: 0,
    outline: 0,
  };
}

function computeElectricOutline(
  glyph: TextLayoutGlyph,
  progress: number,
  seed: number,
): TextGlyphState {
  const stream = deriveStream(seed, `electric-${glyph.charIndex}`);
  const pulse = 0.5 + stream.next() * 0.5;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: 0,
    opacity: progress,
    glow: progress * 0.4,
    outline: progress * pulse,
  };
}

function computeSmokeReveal(
  glyph: TextLayoutGlyph,
  progress: number,
  total: number,
): TextGlyphState {
  const reveal = glyphProgress(progress, glyph.charIndex, total, 0.18);
  const rise = (1 - reveal) * 18;
  return {
    char: glyph.char,
    displayChar: glyph.char,
    x: glyph.x,
    y: glyph.y,
    offsetX: 0,
    offsetY: rise,
    opacity: reveal * 0.95,
    glow: 0,
    outline: 0,
  };
}

/** Compute animated glyph states for a text layer at normalized progress [0, 1]. */
export function computeTextGlyphStates(
  layer: TextLayer,
  glyphs: TextLayoutGlyph[],
  progress: number,
  seed: number,
): TextGlyphState[] {
  const mode = layer.effectMode;
  const total = glyphs.length;

  return glyphs.map((glyph) => {
    switch (mode) {
      case "fade":
        return computeFade(glyph, progress);
      case "stagger":
        return computeStagger(glyph, progress, total);
      case "scramble":
        return computeScramble(glyph, progress, seed);
      case "glitch-reveal":
        return computeGlitchReveal(glyph, progress, total, seed);
      case "neon-flicker":
        return computeNeonFlicker(glyph, progress, seed);
      case "particle-assemble":
        return computeParticleAssemble(glyph, progress, seed);
      case "particle-dissolve":
        return computeParticleDissolve(glyph, progress, seed);
      case "particle-scatter":
        return computeParticleScatter(glyph, progress, seed);
      case "wave":
        return computeWave(glyph, progress, total);
      case "electric-outline":
        return computeElectricOutline(glyph, progress, seed);
      case "smoke-reveal":
        return computeSmokeReveal(glyph, progress, total);
      default:
        return computeFade(glyph, progress);
    }
  });
}
