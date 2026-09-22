import { z } from "zod";

/** A single control point for piecewise curves. */
export const CurvePointSchema = z.object({
  time: z.number().min(0).max(1),
  value: z.number(),
});

export type CurvePoint = z.infer<typeof CurvePointSchema>;

/** Cubic Bezier control handles relative to anchor points. */
export const BezierHandleSchema = z.object({
  inTangent: z.object({ x: z.number(), y: z.number() }),
  outTangent: z.object({ x: z.number(), y: z.number() }),
});

export type BezierHandle = z.infer<typeof BezierHandleSchema>;

export const BezierKeyframeSchema = z.object({
  time: z.number().min(0).max(1),
  value: z.number(),
  handles: BezierHandleSchema,
});

export type BezierKeyframe = z.infer<typeof BezierKeyframeSchema>;

export const ConstantCurveSchema = z.object({
  type: z.literal("constant"),
  value: z.number(),
});

export const LinearCurveSchema = z.object({
  type: z.literal("linear"),
  start: z.number(),
  end: z.number(),
});

export const PiecewiseLinearCurveSchema = z.object({
  type: z.literal("piecewise-linear"),
  points: z.array(CurvePointSchema).min(2),
});

export const CubicBezierCurveSchema = z.object({
  type: z.literal("cubic-bezier"),
  keyframes: z.array(BezierKeyframeSchema).min(2),
});

export const PiecewiseCubicBezierCurveSchema = z.object({
  type: z.literal("piecewise-cubic-bezier"),
  keyframes: z.array(BezierKeyframeSchema).min(2),
});

export const ParameterCurveSchema = z.discriminatedUnion("type", [
  ConstantCurveSchema,
  LinearCurveSchema,
  PiecewiseLinearCurveSchema,
  CubicBezierCurveSchema,
  PiecewiseCubicBezierCurveSchema,
]);

export type ParameterCurve = z.infer<typeof ParameterCurveSchema>;
