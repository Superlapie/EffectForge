import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { IdSchema } from "../primitives.js";

export const DistortionEffectSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ripple"),
    amplitude: z.number().nonnegative().default(0.02),
    frequency: z.number().positive().default(20),
    speed: z.number().positive().default(2),
  }),
  z.object({
    type: z.literal("heat-haze"),
    intensity: z.number().nonnegative().default(0.5),
    speed: z.number().positive().default(1),
  }),
  z.object({
    type: z.literal("liquid"),
    viscosity: z.number().min(0).max(1).default(0.5),
    rippleStrength: z.number().nonnegative().default(0.3),
  }),
  z.object({
    type: z.literal("lens"),
    strength: z.number().default(0.5),
    radius: z.number().positive().default(0.3),
  }),
  z.object({
    type: z.literal("chromatic-warp"),
    offset: z.number().nonnegative().default(0.01),
    angle: z.number().default(0),
  }),
  z.object({
    type: z.literal("glitch-displacement"),
    intensity: z.number().nonnegative().default(0.5),
    blockSize: z.number().int().positive().default(16),
  }),
  z.object({
    type: z.literal("pixel-displacement"),
    blockSize: z.number().int().positive().default(8),
    intensity: z.number().nonnegative().default(0.5),
  }),
]);

export type DistortionEffect = z.infer<typeof DistortionEffectSchema>;

export const DistortionLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("distortion"),
  effect: DistortionEffectSchema,
  sourceAssetId: IdSchema.optional(),
});

export type DistortionLayer = z.infer<typeof DistortionLayerSchema>;
