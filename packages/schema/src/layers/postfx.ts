import { z } from "zod";
import { LayerBaseSchema } from "./base.js";

export const PostEffectSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bloom"),
    intensity: z.number().nonnegative().default(0.6),
    threshold: z.number().min(0).max(1).default(0.8),
  }),
  z.object({
    type: z.literal("chromatic-aberration"),
    offset: z.number().nonnegative().default(0.002),
  }),
  z.object({
    type: z.literal("vignette"),
    darkness: z.number().min(0).max(1).default(0.5),
    offset: z.number().min(0).max(1).default(0.5),
  }),
  z.object({
    type: z.literal("noise"),
    intensity: z.number().nonnegative().default(0.1),
  }),
  z.object({
    type: z.literal("glitch"),
    intensity: z.number().nonnegative().default(0.5),
  }),
  z.object({
    type: z.literal("pixelation"),
    granularity: z.number().int().positive().default(8),
  }),
  z.object({
    type: z.literal("shockwave"),
    center: z.object({ x: z.number(), y: z.number() }).default({ x: 0.5, y: 0.5 }),
    speed: z.number().positive().default(2),
    amplitude: z.number().nonnegative().default(0.5),
  }),
]);

export type PostEffect = z.infer<typeof PostEffectSchema>;

export const PostFxLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("postfx"),
  effect: PostEffectSchema,
});

export type PostFxLayer = z.infer<typeof PostFxLayerSchema>;
