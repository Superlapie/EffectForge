import { z } from "zod";
import { ColorSchema } from "./primitives.js";
import { ParameterCurveSchema } from "./curves.js";
import { ColorGradientSchema } from "./gradients.js";

export const ConstantValueSchema = z.object({
  kind: z.literal("constant"),
  value: z.number(),
});

export const RandomRangeValueSchema = z.object({
  kind: z.literal("random-range"),
  min: z.number(),
  max: z.number(),
});

export const CurveValueSchema = z.object({
  kind: z.literal("curve"),
  curve: ParameterCurveSchema,
});

export const RandomCurveRangeValueSchema = z.object({
  kind: z.literal("random-curve-range"),
  minCurve: ParameterCurveSchema,
  maxCurve: ParameterCurveSchema,
});

export const NumericValueSourceSchema = z.discriminatedUnion("kind", [
  ConstantValueSchema,
  RandomRangeValueSchema,
  CurveValueSchema,
  RandomCurveRangeValueSchema,
]);

export type NumericValueSource = z.infer<typeof NumericValueSourceSchema>;

export const ConstantColorValueSchema = z.object({
  kind: z.literal("constant"),
  value: ColorSchema,
});

export const GradientColorValueSchema = z.object({
  kind: z.literal("gradient"),
  gradient: ColorGradientSchema,
});

export const RandomGradientRangeValueSchema = z.object({
  kind: z.literal("random-gradient-range"),
  minGradient: ColorGradientSchema,
  maxGradient: ColorGradientSchema,
});

export const ColorValueSourceSchema = z.discriminatedUnion("kind", [
  ConstantColorValueSchema,
  GradientColorValueSchema,
  RandomGradientRangeValueSchema,
]);

export type ColorValueSource = z.infer<typeof ColorValueSourceSchema>;
