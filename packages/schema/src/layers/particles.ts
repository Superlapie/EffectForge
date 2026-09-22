import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { BurstSchema, EmitterShapeSchema, EmitterSpaceSchema } from "./emitters.js";
import { ColorValueSourceSchema, NumericValueSourceSchema } from "../values.js";
import { ParameterCurveSchema } from "../curves.js";
import { Vector3Schema } from "../primitives.js";

export const ParticleBehaviorSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("gravity"), strength: z.number() }),
  z.object({ type: z.literal("drag"), coefficient: z.number().min(0).max(1) }),
  z.object({
    type: z.literal("constant-acceleration"),
    acceleration: Vector3Schema,
  }),
  z.object({
    type: z.literal("attraction"),
    target: Vector3Schema,
    strength: z.number(),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("repulsion"),
    target: Vector3Schema,
    strength: z.number(),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("cursor-attract"),
    strength: z.number(),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("cursor-repel"),
    strength: z.number(),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("vortex"),
    axis: Vector3Schema,
    strength: z.number(),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal("turbulence"),
    strength: z.number(),
    frequency: z.number().positive(),
    octaves: z.number().int().min(1).max(8).default(3),
  }),
]);

export type ParticleBehavior = z.infer<typeof ParticleBehaviorSchema>;

export const ParticleEmitterSchema = z.object({
  shape: EmitterShapeSchema,
  space: EmitterSpaceSchema.default("local"),
  position: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  rotation: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  scale: Vector3Schema.default({ x: 1, y: 1, z: 1 }),
  rate: z.number().nonnegative().default(50),
  bursts: z.array(BurstSchema).default([]),
  startDelay: z.number().nonnegative().default(0),
  duration: z.number().nonnegative().nullable().default(null),
  loop: z.boolean().default(true),
  prewarm: z.boolean().default(false),
  maxParticles: z.number().int().positive().max(500_000).default(10_000),
});

export type ParticleEmitter = z.infer<typeof ParticleEmitterSchema>;

export const ParticleLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("particles"),
  emitter: ParticleEmitterSchema,
  lifetime: NumericValueSourceSchema,
  speed: NumericValueSourceSchema,
  size: NumericValueSourceSchema,
  rotation: NumericValueSourceSchema.optional(),
  angularVelocity: NumericValueSourceSchema.optional(),
  color: ColorValueSourceSchema,
  initialOpacity: NumericValueSourceSchema,
  sizeOverLifetime: ParameterCurveSchema.optional(),
  opacityOverLifetime: ParameterCurveSchema.optional(),
  rotationOverLifetime: ParameterCurveSchema.optional(),
  behaviors: z.array(ParticleBehaviorSchema).default([]),
  billboardMode: z
    .enum(["camera-facing", "vertical", "stretched", "velocity-aligned"])
    .default("camera-facing"),
});

export type ParticleLayer = z.infer<typeof ParticleLayerSchema>;
