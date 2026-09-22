import { z } from "zod";
import { LayerBaseSchema } from "./base.js";
import { IdSchema } from "../primitives.js";

export const GroupLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("group"),
  childLayerIds: z.array(IdSchema).default([]),
  collapsed: z.boolean().default(false),
});

export type GroupLayer = z.infer<typeof GroupLayerSchema>;
