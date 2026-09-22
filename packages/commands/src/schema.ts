import { z } from "zod";
import { LayerSchema } from "@effectforge/schema";

export const SetProjectNameCommandSchema = z.object({
  type: z.literal("SetProjectName"),
  payload: z.object({
    name: z.string().min(1).max(256),
  }),
});

export const SetProjectSeedCommandSchema = z.object({
  type: z.literal("SetProjectSeed"),
  payload: z.object({
    seed: z.number().int().nonnegative(),
  }),
});

export const AddLayerCommandSchema = z.object({
  type: z.literal("AddLayer"),
  payload: z.object({
    layer: LayerSchema,
    index: z.number().int().nonnegative().optional(),
  }),
});

export const RemoveLayerCommandSchema = z.object({
  type: z.literal("RemoveLayer"),
  payload: z.object({
    layerId: z.string().min(1),
  }),
});

export const DuplicateLayerCommandSchema = z.object({
  type: z.literal("DuplicateLayer"),
  payload: z.object({
    layerId: z.string().min(1),
  }),
});

export const ReorderLayerCommandSchema = z.object({
  type: z.literal("ReorderLayer"),
  payload: z.object({
    layerId: z.string().min(1),
    toIndex: z.number().int().nonnegative(),
  }),
});

export const SetLayerEnabledCommandSchema = z.object({
  type: z.literal("SetLayerEnabled"),
  payload: z.object({
    layerId: z.string().min(1),
    enabled: z.boolean(),
  }),
});

export const SetLayerOpacityCommandSchema = z.object({
  type: z.literal("SetLayerOpacity"),
  payload: z.object({
    layerId: z.string().min(1),
    opacity: z.number().min(0).max(1),
  }),
});

export const SetLayerNameCommandSchema = z.object({
  type: z.literal("SetLayerName"),
  payload: z.object({
    layerId: z.string().min(1),
    name: z.string().min(1).max(128),
  }),
});

export const SetLayerPropertyCommandSchema = z.object({
  type: z.literal("SetLayerProperty"),
  payload: z.object({
    layerId: z.string().min(1),
    /** Dot-separated path within the layer object, e.g. "emitter.rate" */
    path: z.string().min(1),
    value: z.unknown(),
  }),
});

export const SetParticleParameterCommandSchema = z.object({
  type: z.literal("SetParticleParameter"),
  payload: z.object({
    layerId: z.string().min(1),
    parameter: z.enum([
      "lifetime",
      "speed",
      "size",
      "rotation",
      "angularVelocity",
      "color",
      "initialOpacity",
      "sizeOverLifetime",
      "opacityOverLifetime",
      "rotationOverLifetime",
      "billboardMode",
    ]),
    value: z.unknown(),
  }),
});

export const SetEmitterParameterCommandSchema = z.object({
  type: z.literal("SetEmitterParameter"),
  payload: z.object({
    layerId: z.string().min(1),
    parameter: z.enum([
      "rate",
      "maxParticles",
      "startDelay",
      "duration",
      "loop",
      "prewarm",
      "space",
      "shape",
      "position",
      "rotation",
      "scale",
      "bursts",
    ]),
    value: z.unknown(),
  }),
});

export const BeginTransactionCommandSchema = z.object({
  type: z.literal("BeginTransaction"),
  payload: z.object({
    label: z.string().max(128).optional(),
  }),
});

export const CommitTransactionCommandSchema = z.object({
  type: z.literal("CommitTransaction"),
  payload: z.object({}).default({}),
});

export const RollbackTransactionCommandSchema = z.object({
  type: z.literal("RollbackTransaction"),
  payload: z.object({}).default({}),
});

export const EffectForgeCommandSchema = z.discriminatedUnion("type", [
  SetProjectNameCommandSchema,
  SetProjectSeedCommandSchema,
  AddLayerCommandSchema,
  RemoveLayerCommandSchema,
  DuplicateLayerCommandSchema,
  ReorderLayerCommandSchema,
  SetLayerEnabledCommandSchema,
  SetLayerOpacityCommandSchema,
  SetLayerNameCommandSchema,
  SetLayerPropertyCommandSchema,
  SetParticleParameterCommandSchema,
  SetEmitterParameterCommandSchema,
  BeginTransactionCommandSchema,
  CommitTransactionCommandSchema,
  RollbackTransactionCommandSchema,
]);

export type EffectForgeCommand = z.infer<typeof EffectForgeCommandSchema>;

export type SetProjectNameCommand = z.infer<typeof SetProjectNameCommandSchema>;
export type AddLayerCommand = z.infer<typeof AddLayerCommandSchema>;
export type RemoveLayerCommand = z.infer<typeof RemoveLayerCommandSchema>;
export type SetLayerPropertyCommand = z.infer<typeof SetLayerPropertyCommandSchema>;
export type SetParticleParameterCommand = z.infer<typeof SetParticleParameterCommandSchema>;
