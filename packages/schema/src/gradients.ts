import { z } from "zod";
import { ColorSchema } from "./primitives.js";

export const GradientStopSchema = z.object({
  position: z.number().min(0).max(1),
  color: ColorSchema,
});

export type GradientStop = z.infer<typeof GradientStopSchema>;

export const AlphaStopSchema = z.object({
  position: z.number().min(0).max(1),
  alpha: z.number().min(0).max(1),
});

export type AlphaStop = z.infer<typeof AlphaStopSchema>;

export const ColorGradientSchema = z.object({
  colorStops: z.array(GradientStopSchema).min(2),
  alphaStops: z.array(AlphaStopSchema).min(1).optional(),
});

export type ColorGradient = z.infer<typeof ColorGradientSchema>;
