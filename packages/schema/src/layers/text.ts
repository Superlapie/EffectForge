import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { IdSchema } from "../primitives.js";

export const TextEffectModeSchema = z.enum([
  "fade",
  "stagger",
  "scramble",
  "glitch-reveal",
  "neon-flicker",
  "particle-assemble",
  "particle-dissolve",
  "particle-scatter",
  "wave",
  "electric-outline",
  "smoke-reveal",
]);

export type TextEffectMode = z.infer<typeof TextEffectModeSchema>;

export const TextLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("text"),
  text: z.string().min(1).max(4096),
  fontAssetId: IdSchema.optional(),
  fontSize: z.number().positive().default(48),
  fontWeight: z.union([z.number(), z.string()]).default(400),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  lineHeight: z.number().positive().default(1.2),
  letterSpacing: z.number().default(0),
  effectMode: TextEffectModeSchema.default("fade"),
  duration: z.number().positive().default(2),
});

export type TextLayer = z.infer<typeof TextLayerSchema>;
