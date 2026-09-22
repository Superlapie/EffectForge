import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { IdSchema, Vector3Schema } from "../primitives.js";

export const ModelLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("model"),
  modelAssetId: IdSchema,
  position: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  rotation: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  scale: Vector3Schema.default({ x: 1, y: 1, z: 1 }),
});

export type ModelLayer = z.infer<typeof ModelLayerSchema>;
