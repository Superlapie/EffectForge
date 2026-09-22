import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { ColorGradientSchema } from "../gradients.js";
import { ParameterCurveSchema } from "../curves.js";

export const TrailLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("trail"),
  maxPoints: z.number().int().positive().max(10_000).default(256),
  width: z.number().positive().default(4),
  widthOverLifetime: ParameterCurveSchema.optional(),
  colorGradient: ColorGradientSchema.optional(),
  fade: z.number().min(0).max(1).default(0.9),
  followPointer: z.boolean().default(true),
  minDistance: z.number().nonnegative().default(2),
});

export type TrailLayer = z.infer<typeof TrailLayerSchema>;
