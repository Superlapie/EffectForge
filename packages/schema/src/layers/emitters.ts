import { z } from "zod";
import { Vector3Schema } from "../primitives.js";

export const EmitterShapeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("point") }),
  z.object({
    type: z.literal("line"),
    start: Vector3Schema,
    end: Vector3Schema,
  }),
  z.object({
    type: z.literal("box"),
    size: Vector3Schema,
  }),
  z.object({
    type: z.literal("circle"),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("disk"),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("sphere"),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("hemisphere"),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("cone"),
    radius: z.number().positive(),
    angle: z.number().min(0).max(180),
    length: z.number().positive(),
  }),
  z.object({
    type: z.literal("plane"),
    size: z.object({ width: z.number().positive(), height: z.number().positive() }),
  }),
  z.object({
    type: z.literal("ring"),
    innerRadius: z.number().nonnegative(),
    outerRadius: z.number().positive(),
  }),
]);

export type EmitterShape = z.infer<typeof EmitterShapeSchema>;

export const EmitterSpaceSchema = z.enum(["local", "world"]);

export type EmitterSpace = z.infer<typeof EmitterSpaceSchema>;

export const BurstSchema = z.object({
  time: z.number().min(0),
  count: z.number().int().positive(),
  cycles: z.number().int().positive().default(1),
  interval: z.number().nonnegative().default(0),
  probability: z.number().min(0).max(1).default(1),
});

export type Burst = z.infer<typeof BurstSchema>;
