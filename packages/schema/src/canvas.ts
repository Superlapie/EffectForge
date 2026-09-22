import { z } from "zod";
import { ColorSchema } from "./primitives.js";

export const CanvasBackgroundSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("color"),
    value: ColorSchema,
  }),
  z.object({
    type: z.literal("transparent"),
  }),
  z.object({
    type: z.literal("gradient"),
    stops: z
      .array(
        z.object({
          position: z.number().min(0).max(1),
          color: ColorSchema,
        }),
      )
      .min(2),
    angle: z.number().default(180),
  }),
]);

export type CanvasBackground = z.infer<typeof CanvasBackgroundSchema>;

export const CanvasSizingModeSchema = z.enum([
  "fill-container",
  "fixed-aspect",
  "fixed-resolution",
  "responsive",
]);

export type CanvasSizingMode = z.infer<typeof CanvasSizingModeSchema>;

export const CanvasSchema = z.object({
  width: z.number().int().positive().max(8192),
  height: z.number().int().positive().max(8192),
  background: CanvasBackgroundSchema,
  sizingMode: CanvasSizingModeSchema.default("fill-container"),
  maxDpr: z.number().positive().max(4).default(2),
});

export type Canvas = z.infer<typeof CanvasSchema>;
